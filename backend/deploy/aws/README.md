# Aicardly backend on AWS (App Runner, Mumbai)

What runs where:

| Piece | AWS service |
|---|---|
| Backend (Express, same code as Vercel) | **App Runner** service `aicardly-backend`, ap-south-1, 1 vCPU / 2 GB, 1–4 instances |
| Container image | built by **CodeBuild** (`aicardly-backend-build`) from the source zip in S3, stored in **ECR** `aicardly-backend` |
| Secrets (MONGO_URI, JWT_SECRET, API keys, SMTP …) | **SSM Parameter Store** SecureStrings `/aicardly/backend/<NAME>` |
| Logs | **CloudWatch Logs** `/aws/apprunner/aicardly-backend/<id>/application` (90 days). One JSON line per request: `level, req, status, ms, ip, userId`; events: `event, level, msg` |
| Metrics | `Aicardly/Backend`: Requests, Errors, Http5xx, Http4xx, LatencyMs, Payments, MailFailed (+ App Runner CPU/Memory) |
| Alerts | SNS topic `aicardly-alerts` (email): errors ≥10/5 min, 5xx ≥5/5 min, avg latency > 2 s, mail failures, CPU > 80 %, memory > 85 % |
| Dashboard | CloudWatch dashboard **Aicardly-Backend** (requests, errors, latency avg/p95, CPU/memory, latest errors table) |
| Daily job (was Vercel Cron) | **EventBridge** rule `aicardly-card-orders-daily` 03:00 UTC → `GET /api/cron/card-orders` with `Authorization: Bearer <CRON_SECRET>` |

## 1. Log in to the Aicardly AWS account (once)

Create an IAM user with *AdministratorAccess* (or use SSO), then on this computer:

```
aws configure        # access key, secret key, region ap-south-1, output json
aws sts get-caller-identity
```

## 2. Move the secrets from Vercel (once)

Vercel never shows "sensitive" values, so they are sent encrypted by a short-lived route:

```
cd BACKEND
node deploy/aws/push-secrets.mjs prepare
npx vercel deploy --prod --yes --scope webkikservices01-8990s-projects
node deploy/aws/push-secrets.mjs push           # writes /aicardly/backend/* in SSM
npx vercel deploy --prod --yes --scope webkikservices01-8990s-projects   # route removed again
```

## 3. Deploy (first time and every update)

```
cd BACKEND
powershell -ExecutionPolicy Bypass -File deploy\aws\deploy.ps1 -AlertEmail you@example.com
```

It prints the backend URL, the health check, the logs link and the dashboard link.
Code-only update: run the same command again (CodeBuild builds, App Runner redeploys itself).

## 4. Switch the site to AWS

1. `FRONTEND/.env.production` → `VITE_API_URL=<App Runner URL>`; `FRONTEND/public/og.php` and
   `sitemap.php` → `BACKEND`; `npm run build && npm run zip`, upload to Hostinger.
2. Payment / WhatsApp webhooks (Cashfree, Razorpay, Meta) → new URL in their dashboards.
3. `EMAIL_LOGO_URL` → `<App Runner URL>/brand/email-logo.png` (SSM parameter).
4. Remove `crons` from `vercel.json` so the job doesn't run twice. Keep the Vercel backend a few
   days as a fallback (same database), then switch it off.

Optional: custom domain `api.aicardly.com` (App Runner → Custom domains, add the CNAME records it
shows at the DNS host).
