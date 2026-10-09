# Aicardly backend on AWS (Mumbai, ap-south-1): App Runner + CodeBuild + ECR + Secrets Manager +
# CloudWatch logs/metrics/alarms/dashboard + EventBridge cron. Secrets: SSM Parameter Store
# SecureStrings under /aicardly/backend/<NAME> (filled by deploy/aws/push-secrets.mjs). Safe to run again: it creates what is
# missing and redeploys the code. Run from BACKEND:  powershell -File deploy\aws\deploy.ps1
# Needs: AWS CLI logged in to the Aicardly account, python (for the source zip), and the secret
# secrets under /aicardly/backend/ in SSM Parameter Store (deploy/aws/README.md, step 2).
param(
  [string]$Region = 'ap-south-1',
  [string]$Name = 'aicardly-backend',
  [string]$AlertEmail = '',
  [switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'
$env:AWS_REGION = $Region
$env:AWS_PAGER = ''
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Resolve-Path (Join-Path $here '..\..')
$tmp = Join-Path $env:TEMP "aicardly-aws"
New-Item -ItemType Directory -Force $tmp | Out-Null

function Aws([string[]]$a) {
  $out = & aws @a --region $Region --output json 2>&1
  if ($LASTEXITCODE -ne 0) { throw "aws $($a -join ' ') failed: $out" }
  $text = ($out | Out-String).Trim()
  if (-not $text) { return $true }
  try { return ($text | ConvertFrom-Json) } catch { return $text }
}
function AwsTry([string[]]$a) { try { return Aws $a } catch { return $null } }
function JsonFile($name, $obj) { $p = Join-Path $tmp $name; [IO.File]::WriteAllText($p, ($obj | ConvertTo-Json -Depth 20 -Compress)); return "file://$p" }
function Step($t) { Write-Host "`n== $t" -ForegroundColor Cyan }

Step 'Account'
$acct = (Aws @('sts', 'get-caller-identity')).Account
Write-Host "AWS account $acct, region $Region"

# ---------------------------------------------------------------- secrets (must exist)
Step 'SSM Parameter Store: /aicardly/backend/*'
$params = @()
$next = $null
do {
  $a = @('ssm', 'get-parameters-by-path', '--path', '/aicardly/backend/', '--max-results', '10')
  if ($next) { $a += @('--next-token', $next) }
  $page = Aws $a
  $params += $page.Parameters
  $next = $page.NextToken
} while ($next)
if (-not $params.Count) { throw "No parameters under /aicardly/backend/. Push the secrets first (deploy/aws/README.md, step 2)." }
$secretKeys = $params | ForEach-Object { $_.Name.Split('/')[-1] }
Write-Host "keys: $($secretKeys -join ', ')"

# ---------------------------------------------------------------- build pipeline
$bucket = "aicardly-build-$acct-$Region"
Step "S3 bucket $bucket"
& aws s3api head-bucket --bucket $bucket --region $Region 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Aws @('s3api', 'create-bucket', '--bucket', $bucket, '--create-bucket-configuration', "LocationConstraint=$Region") | Out-Null
  Aws @('s3api', 'put-public-access-block', '--bucket', $bucket, '--public-access-block-configuration', 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true') | Out-Null
}

Step "ECR repository $Name"
$repo = AwsTry @('ecr', 'describe-repositories', '--repository-names', $Name)
if (-not $repo) { $repo = Aws @('ecr', 'create-repository', '--repository-name', $Name, '--image-scanning-configuration', 'scanOnPush=true'); $repoUri = $repo.repository.repositoryUri }
else { $repoUri = $repo.repositories[0].repositoryUri }
Aws @('ecr', 'put-lifecycle-policy', '--repository-name', $Name, '--lifecycle-policy-text', (JsonFile 'ecr-life.json' @{ rules = @(@{ rulePriority = 1; description = 'keep last 15 images'; selection = @{ tagStatus = 'any'; countType = 'imageCountMoreThan'; countNumber = 15 }; action = @{ type = 'expire' } }) })) | Out-Null

function Role($roleName, $service, $policyName, $policyDoc, [string[]]$managed) {
  $trust = JsonFile "$roleName-trust.json" @{ Version = '2012-10-17'; Statement = @(@{ Effect = 'Allow'; Principal = @{ Service = $service }; Action = 'sts:AssumeRole' }) }
  $r = AwsTry @('iam', 'get-role', '--role-name', $roleName)
  if (-not $r) { $r = Aws @('iam', 'create-role', '--role-name', $roleName, '--assume-role-policy-document', $trust); Start-Sleep 8 }
  if ($policyDoc) { Aws @('iam', 'put-role-policy', '--role-name', $roleName, '--policy-name', $policyName, '--policy-document', (JsonFile "$roleName-policy.json" $policyDoc)) | Out-Null }
  foreach ($m in $managed) { Aws @('iam', 'attach-role-policy', '--role-name', $roleName, '--policy-arn', $m) | Out-Null }
  return "arn:aws:iam::${acct}:role/$roleName"
}

Step 'IAM roles'
$cbRole = Role 'aicardly-codebuild' 'codebuild.amazonaws.com' 'build' @{ Version = '2012-10-17'; Statement = @(
    @{ Effect = 'Allow'; Action = @('logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'); Resource = '*' },
    @{ Effect = 'Allow'; Action = @('s3:GetObject', 's3:GetObjectVersion'); Resource = "arn:aws:s3:::$bucket/*" },
    @{ Effect = 'Allow'; Action = @('ecr:GetAuthorizationToken'); Resource = '*' },
    @{ Effect = 'Allow'; Action = @('ecr:BatchCheckLayerAvailability', 'ecr:InitiateLayerUpload', 'ecr:UploadLayerPart', 'ecr:CompleteLayerUpload', 'ecr:PutImage', 'ecr:BatchGetImage', 'ecr:GetDownloadUrlForLayer'); Resource = "arn:aws:ecr:${Region}:${acct}:repository/$Name" }
  ) } @()
$accessRole = Role 'aicardly-apprunner-ecr' 'build.apprunner.amazonaws.com' $null $null @('arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess')
$instanceRole = Role 'aicardly-apprunner-instance' 'tasks.apprunner.amazonaws.com' 'secrets' @{ Version = '2012-10-17'; Statement = @(
    @{ Effect = 'Allow'; Action = @('ssm:GetParameters', 'ssm:GetParameter'); Resource = "arn:aws:ssm:${Region}:${acct}:parameter/aicardly/backend/*" },
    @{ Effect = 'Allow'; Action = @('kms:Decrypt'); Resource = '*'; Condition = @{ StringEquals = @{ 'kms:ViaService' = "ssm.$Region.amazonaws.com" } } }
  ) } @()

Step 'CodeBuild project'
$cbName = "$Name-build"
$cbSpec = @{
  name = $cbName; serviceRole = $cbRole
  source = @{ type = 'S3'; location = "$bucket/backend-src.zip"; buildspec = 'deploy/aws/buildspec.yml' }
  artifacts = @{ type = 'NO_ARTIFACTS' }
  environment = @{ type = 'LINUX_CONTAINER'; image = 'aws/codebuild/standard:7.0'; computeType = 'BUILD_GENERAL1_SMALL'; privilegedMode = $true
    environmentVariables = @(@{ name = 'ECR_REPO_URI'; value = $repoUri; type = 'PLAINTEXT' }) }
  logsConfig = @{ cloudWatchLogs = @{ status = 'ENABLED'; groupName = "/aicardly/codebuild" } }
}
if (AwsTry @('codebuild', 'batch-get-projects', '--names', $cbName) | Where-Object { $_.projects.Count }) { Aws @('codebuild', 'update-project', '--cli-input-json', (JsonFile 'cb.json' $cbSpec)) | Out-Null }
else { Aws @('codebuild', 'create-project', '--cli-input-json', (JsonFile 'cb.json' $cbSpec)) | Out-Null }

if (-not $SkipBuild) {
  Step 'Upload source + build image'
  $zip = Join-Path $tmp 'backend-src.zip'
  $py = @"
import os, zipfile, sys
root = sys.argv[1]; out = sys.argv[2]
skip_dirs = {'node_modules', '.vercel', 'uploads', 'tests', '.git'}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as z:
    for d, dirs, files in os.walk(root):
        dirs[:] = [x for x in dirs if x not in skip_dirs]
        for f in files:
            if f == '.env' or f.startswith('.env.') and f != '.env.example' or f.startswith('scratch-'):
                continue
            p = os.path.join(d, f)
            z.write(p, os.path.relpath(p, root).replace(os.sep, '/'))
print('zipped')
"@
  [IO.File]::WriteAllText((Join-Path $tmp 'zip.py'), $py)
  & python (Join-Path $tmp 'zip.py') $backend $zip
  & aws s3 cp $zip "s3://$bucket/backend-src.zip" --region $Region --only-show-errors
  if ($LASTEXITCODE -ne 0) { throw 'upload to S3 failed' }
  $build = Aws @('codebuild', 'start-build', '--project-name', $cbName)
  $id = $build.build.id
  Write-Host "build $id"
  do { Start-Sleep 15; $b = (Aws @('codebuild', 'batch-get-builds', '--ids', $id)).builds[0]; Write-Host "  $($b.currentPhase) $($b.buildStatus)" } while ($b.buildStatus -eq 'IN_PROGRESS')
  if ($b.buildStatus -ne 'SUCCEEDED') { throw "Image build failed: $($b.logs.deepLink)" }
}

# ---------------------------------------------------------------- App Runner service
Step 'App Runner service'
$scaleName = 'aicardly-scale'
$scale = (AwsTry @('apprunner', 'list-auto-scaling-configurations', '--auto-scaling-configuration-name', $scaleName)).AutoScalingConfigurationSummaryList | Select-Object -First 1
if (-not $scale) { $scale = (Aws @('apprunner', 'create-auto-scaling-configuration', '--auto-scaling-configuration-name', $scaleName, '--min-size', '1', '--max-size', '4', '--max-concurrency', '80')).AutoScalingConfiguration }
$plainEnv = [ordered]@{ NODE_ENV = 'production'; PORT = '8080'; AWS_LOG_FORMAT = 'json' }
$secretEnv = [ordered]@{}
foreach ($k in $secretKeys) { $secretEnv[$k] = "arn:aws:ssm:${Region}:${acct}:parameter/aicardly/backend/$k" }
$source = @{
  ImageRepository = @{ ImageIdentifier = "${repoUri}:latest"; ImageRepositoryType = 'ECR'
    ImageConfiguration = @{ Port = '8080'; RuntimeEnvironmentVariables = $plainEnv; RuntimeEnvironmentSecrets = $secretEnv } }
  AutoDeploymentsEnabled = $true
  AuthenticationConfiguration = @{ AccessRoleArn = $accessRole }
}
$svc = (Aws @('apprunner', 'list-services')).ServiceSummaryList | Where-Object { $_.ServiceName -eq $Name } | Select-Object -First 1
$health = @{ Protocol = 'HTTP'; Path = '/healthz'; Interval = 10; Timeout = 5; HealthyThreshold = 1; UnhealthyThreshold = 3 }
$instance = @{ Cpu = '1 vCPU'; Memory = '2 GB'; InstanceRoleArn = $instanceRole }
if (-not $svc) {
  $spec = @{ ServiceName = $Name; SourceConfiguration = $source; InstanceConfiguration = $instance; HealthCheckConfiguration = $health; AutoScalingConfigurationArn = $scale.AutoScalingConfigurationArn
    ObservabilityConfiguration = @{ ObservabilityEnabled = $false } }
  $svc = (Aws @('apprunner', 'create-service', '--cli-input-json', (JsonFile 'svc.json' $spec))).Service
} else {
  $spec = @{ ServiceArn = $svc.ServiceArn; SourceConfiguration = $source; InstanceConfiguration = $instance; HealthCheckConfiguration = $health; AutoScalingConfigurationArn = $scale.AutoScalingConfigurationArn }
  do { $st = (Aws @('apprunner', 'describe-service', '--service-arn', $svc.ServiceArn)).Service.Status; if ($st -eq 'OPERATION_IN_PROGRESS') { Start-Sleep 15 } } while ($st -eq 'OPERATION_IN_PROGRESS')
  $svc = (Aws @('apprunner', 'update-service', '--cli-input-json', (JsonFile 'svc.json' $spec))).Service
}
Write-Host "waiting for $($svc.ServiceArn)"
do { Start-Sleep 20; $s = (Aws @('apprunner', 'describe-service', '--service-arn', $svc.ServiceArn)).Service; Write-Host "  $($s.Status)" } while ($s.Status -eq 'OPERATION_IN_PROGRESS')
if ($s.Status -ne 'RUNNING') { throw "Service status $($s.Status) - see CloudWatch log group /aws/apprunner/$Name" }
$url = "https://$($s.ServiceUrl)"
$svcId = $s.ServiceId
Write-Host "LIVE: $url" -ForegroundColor Green

# ---------------------------------------------------------------- CloudWatch: metrics, alarms, dashboard
Step 'CloudWatch logging'
$appLog = "/aws/apprunner/$Name/$svcId/application"
foreach ($i in 1..12) { if ((Aws @('logs', 'describe-log-groups', '--log-group-name-prefix', $appLog)).logGroups.Count) { break }; Start-Sleep 10 }
Aws @('logs', 'put-retention-policy', '--log-group-name', $appLog, '--retention-in-days', '90') | Out-Null
$ns = 'Aicardly/Backend'
$filters = @(
  @{ n = 'Errors'; p = '{ $.level = "error" }'; v = '1' },
  @{ n = 'Http5xx'; p = '{ $.status >= 500 }'; v = '1' },
  @{ n = 'Http4xx'; p = '{ $.status >= 400 && $.status < 500 }'; v = '1' },
  @{ n = 'Requests'; p = '{ $.req = * }'; v = '1' },
  @{ n = 'LatencyMs'; p = '{ $.ms >= 0 }'; v = '$.ms' },
  @{ n = 'Payments'; p = '{ $.event = "payment.*" }'; v = '1' },
  @{ n = 'MailFailed'; p = '{ $.event = "mail.failed" }'; v = '1' }
)
foreach ($f in $filters) {
  $t = @(@{ metricName = $f.n; metricNamespace = $ns; metricValue = $f.v; defaultValue = 0 })
  if ($f.n -eq 'LatencyMs') { $t = @(@{ metricName = $f.n; metricNamespace = $ns; metricValue = $f.v; unit = 'Milliseconds' }) }
  Aws @('logs', 'put-metric-filter', '--log-group-name', $appLog, '--filter-name', "aicardly-$($f.n)", '--filter-pattern', $f.p, '--metric-transformations', (JsonFile "mf-$($f.n).json" $t)) | Out-Null
}
$topicArn = (Aws @('sns', 'create-topic', '--name', 'aicardly-alerts')).TopicArn
if ($AlertEmail) {
  $subs = (Aws @('sns', 'list-subscriptions-by-topic', '--topic-arn', $topicArn)).Subscriptions | Where-Object { $_.Endpoint -eq $AlertEmail }
  if (-not $subs) { Aws @('sns', 'subscribe', '--topic-arn', $topicArn, '--protocol', 'email', '--notification-endpoint', $AlertEmail) | Out-Null; Write-Host "Confirm the email sent to $AlertEmail to get alerts." -ForegroundColor Yellow }
}
function Alarm($n, $metric, $stat, $threshold, $periods, $desc, $ns2 = $ns, $dims = $null) {
  $a = @('cloudwatch', 'put-metric-alarm', '--alarm-name', $n, '--alarm-description', $desc, '--namespace', $ns2, '--metric-name', $metric, '--statistic', $stat, '--period', '300', '--evaluation-periods', "$periods", '--threshold', "$threshold", '--comparison-operator', 'GreaterThanOrEqualToThreshold', '--treat-missing-data', 'notBreaching', '--alarm-actions', $topicArn, '--ok-actions', $topicArn)
  if ($dims) { $a += @('--dimensions', $dims) }
  Aws $a | Out-Null
}
Alarm 'aicardly-errors' 'Errors' 'Sum' 10 1 'More than 10 errors in 5 minutes'
Alarm 'aicardly-5xx' 'Http5xx' 'Sum' 5 1 'More than 5 server errors (5xx) in 5 minutes'
Alarm 'aicardly-slow' 'LatencyMs' 'Average' 2000 2 'Average response time over 2 s for 10 minutes'
Alarm 'aicardly-mail' 'MailFailed' 'Sum' 3 1 'Emails failing (SMTP)'
$svcDim = "Name=ServiceName,Value=$Name", "Name=ServiceID,Value=$svcId"
Alarm 'aicardly-cpu' 'CPUUtilization' 'Average' 80 3 'CPU over 80% for 15 minutes' 'AWS/AppRunner' $svcDim
Alarm 'aicardly-memory' 'MemoryUtilization' 'Average' 85 3 'Memory over 85% for 15 minutes' 'AWS/AppRunner' $svcDim

$w = @(
  @{ type = 'metric'; x = 0; y = 0; width = 12; height = 6; properties = @{ title = 'Requests / 5 min'; region = $Region; stat = 'Sum'; period = 300; metrics = @(, @($ns, 'Requests')) } },
  @{ type = 'metric'; x = 12; y = 0; width = 12; height = 6; properties = @{ title = 'Errors, 5xx, 4xx'; region = $Region; stat = 'Sum'; period = 300; metrics = @(@($ns, 'Errors'), @($ns, 'Http5xx'), @($ns, 'Http4xx')) } },
  @{ type = 'metric'; x = 0; y = 6; width = 12; height = 6; properties = @{ title = 'Response time (ms)'; region = $Region; period = 300; metrics = @(@($ns, 'LatencyMs', @{ stat = 'Average' }), @($ns, 'LatencyMs', @{ stat = 'p95' })) } },
  @{ type = 'metric'; x = 12; y = 6; width = 12; height = 6; properties = @{ title = 'CPU / Memory %'; region = $Region; stat = 'Average'; period = 300; metrics = @(@('AWS/AppRunner', 'CPUUtilization', 'ServiceName', $Name, 'ServiceID', $svcId), @('AWS/AppRunner', 'MemoryUtilization', 'ServiceName', $Name, 'ServiceID', $svcId)) } },
  @{ type = 'log'; x = 0; y = 12; width = 24; height = 8; properties = @{ title = 'Latest errors'; region = $Region; query = "SOURCE '$appLog' | fields @timestamp, event, req, status, msg | filter level = 'error' | sort @timestamp desc | limit 50"; view = 'table' } }
)
Aws @('cloudwatch', 'put-dashboard', '--dashboard-name', 'Aicardly-Backend', '--dashboard-body', (JsonFile 'dash.json' @{ widgets = $w })) | Out-Null

# ---------------------------------------------------------------- daily cron (was Vercel Cron)
Step 'EventBridge cron (daily 03:00 UTC -> /api/cron/card-orders)'
$cronSecret = (AwsTry @('ssm', 'get-parameter', '--name', '/aicardly/backend/CRON_SECRET', '--with-decryption')).Parameter.Value
if ($cronSecret) {
  $connName = 'aicardly-cron'
  $conn = AwsTry @('events', 'describe-connection', '--name', $connName)
  $auth = JsonFile 'conn.json' @{ ApiKeyAuthParameters = @{ ApiKeyName = 'Authorization'; ApiKeyValue = "Bearer $cronSecret" } }
  if (-not $conn) { $conn = Aws @('events', 'create-connection', '--name', $connName, '--authorization-type', 'API_KEY', '--auth-parameters', $auth) }
  else { $conn = Aws @('events', 'update-connection', '--name', $connName, '--authorization-type', 'API_KEY', '--auth-parameters', $auth) }
  $destName = 'aicardly-cron-card-orders'
  $dest = AwsTry @('events', 'describe-api-destination', '--name', $destName)
  if (-not $dest) { $dest = Aws @('events', 'create-api-destination', '--name', $destName, '--connection-arn', $conn.ConnectionArn, '--invocation-endpoint', "$url/api/cron/card-orders", '--http-method', 'GET', '--invocation-rate-limit-per-second', '1') }
  else { $dest = Aws @('events', 'update-api-destination', '--name', $destName, '--connection-arn', $conn.ConnectionArn, '--invocation-endpoint', "$url/api/cron/card-orders", '--http-method', 'GET', '--invocation-rate-limit-per-second', '1') }
  # Hourly: upgrade links to free accounts whose 24-hour trial is over (services/trial.js).
  $destName2 = 'aicardly-cron-trial-links'
  $dest2 = AwsTry @('events', 'describe-api-destination', '--name', $destName2)
  if (-not $dest2) { $dest2 = Aws @('events', 'create-api-destination', '--name', $destName2, '--connection-arn', $conn.ConnectionArn, '--invocation-endpoint', "$url/api/cron/trial-links", '--http-method', 'GET', '--invocation-rate-limit-per-second', '1') }
  else { $dest2 = Aws @('events', 'update-api-destination', '--name', $destName2, '--connection-arn', $conn.ConnectionArn, '--invocation-endpoint', "$url/api/cron/trial-links", '--http-method', 'GET', '--invocation-rate-limit-per-second', '1') }
  $evRole = Role 'aicardly-events-cron' 'events.amazonaws.com' 'invoke' @{ Version = '2012-10-17'; Statement = @(@{ Effect = 'Allow'; Action = 'events:InvokeApiDestination'; Resource = @($dest.ApiDestinationArn, $dest2.ApiDestinationArn) }) } @()
  Aws @('events', 'put-rule', '--name', 'aicardly-card-orders-daily', '--schedule-expression', 'cron(0 3 * * ? *)', '--state', 'ENABLED') | Out-Null
  Aws @('events', 'put-targets', '--rule', 'aicardly-card-orders-daily', '--targets', (JsonFile 'targets.json' @(@{ Id = 'card-orders'; Arn = $dest.ApiDestinationArn; RoleArn = $evRole }))) | Out-Null
  Aws @('events', 'put-rule', '--name', 'aicardly-trial-links-hourly', '--schedule-expression', 'rate(1 hour)', '--state', 'ENABLED') | Out-Null
  Aws @('events', 'put-targets', '--rule', 'aicardly-trial-links-hourly', '--targets', (JsonFile 'targets2.json' @(@{ Id = 'trial-links'; Arn = $dest2.ApiDestinationArn; RoleArn = $evRole }))) | Out-Null
} else { Write-Host 'CRON_SECRET not in the secret: cron skipped' -ForegroundColor Yellow }

Step 'Done'
Write-Host "Backend URL:  $url"
Write-Host "Health:       $url/api/ping?db=1"
Write-Host "Logs:         https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#logsV2:log-groups/log-group/$([uri]::EscapeDataString($appLog))"
Write-Host "Dashboard:    https://$Region.console.aws.amazon.com/cloudwatch/home?region=$Region#dashboards/dashboard/Aicardly-Backend"
