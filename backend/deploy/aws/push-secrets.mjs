// Moves the backend's production secrets from Vercel to AWS SSM Parameter Store
// (/aicardly/backend/<NAME>, SecureString), without anyone ever seeing them in plain text.
// Vercel can't show "sensitive" values, so a short-lived route on the Vercel backend sends them,
// encrypted with a public key made here (RSA-OAEP + AES-256-GCM); only this machine can decrypt.
//
//   node deploy/aws/push-secrets.mjs prepare   → key pair in %TEMP%, routes/_migrateEnv.js created
//   (deploy the backend to Vercel)
//   node deploy/aws/push-secrets.mjs push      → fetch, decrypt, write to SSM, delete the route file
//   (deploy the backend to Vercel again, so the route is gone)
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const backend = path.resolve(here, '..', '..');
const routeFile = path.join(backend, 'routes', '_migrateEnv.js');
const keyDir = path.join(os.tmpdir(), 'aicardly-migrate');
const VERCEL = process.env.VERCEL_BACKEND || 'https://backend-nine-omega-26.vercel.app';
const REGION = process.env.AWS_REGION || 'ap-south-1';
// Only the variables the backend's own code reads (scanned from the source at 'prepare'), minus
// the ones the platform sets itself.
const PLATFORM = new Set(['PORT', 'AWS_REGION', 'VERCEL', 'VERCEL_REGION', 'NODE_ENV']);
function appEnvNames() {
  const names = new Set();
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (['node_modules', 'admin-ui', 'tests', '.git', '.vercel', 'deploy'].includes(e.name)) continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.js')) for (const m of fs.readFileSync(p, 'utf8').matchAll(/process\.env\.([A-Z0-9_]+)/g)) names.add(m[1]);
    }
  };
  walk(backend);
  return [...names].filter((n) => !PLATFORM.has(n)).sort();
}

const step = process.argv[2];
if (step === 'prepare') {
  fs.mkdirSync(keyDir, { recursive: true });
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 3072 });
  const token = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(path.join(keyDir, 'private.pem'), privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  fs.writeFileSync(path.join(keyDir, 'token'), token, { mode: 0o600 });
  const pub = publicKey.export({ type: 'spki', format: 'pem' });
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  fs.writeFileSync(
    routeFile,
    `// TEMPORARY (deploy/aws/push-secrets.mjs): sends this server's secrets, encrypted for one key,
// to move them to AWS. Deleted right after use. Without the token it answers 404.
const crypto = require('crypto');
const router = require('express').Router();
const PUB = ${JSON.stringify(pub)};
const TOKEN_SHA256 = '${tokenHash}';
const KEEP = new Set(${JSON.stringify(appEnvNames())});
router.post('/env', (req, res) => {
  const given = String(req.get('x-migrate-token') || '');
  const ok = given && crypto.timingSafeEqual(Buffer.from(crypto.createHash('sha256').update(given).digest('hex')), Buffer.from(TOKEN_SHA256));
  if (!ok) return res.status(404).end();
  const env = Object.fromEntries(Object.entries(process.env).filter(([k, v]) => KEEP.has(k) && v !== undefined && v !== ''));
  const key = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(JSON.stringify(env), 'utf8'), c.final()]);
  res.json({
    key: crypto.publicEncrypt({ key: PUB, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, key).toString('base64'),
    iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: data.toString('base64'),
  });
});
module.exports = router;
`
  );
  console.log('Prepared. Now deploy the backend to Vercel, then run: node deploy/aws/push-secrets.mjs push');
} else if (step === 'push') {
  const token = fs.readFileSync(path.join(keyDir, 'token'), 'utf8');
  const privateKey = fs.readFileSync(path.join(keyDir, 'private.pem'), 'utf8');
  const r = await fetch(`${VERCEL}/api/_migrate/env`, { method: 'POST', headers: { 'x-migrate-token': token } });
  if (!r.ok) throw new Error(`Vercel answered ${r.status}. Is the prepared backend deployed?`);
  const b = await r.json();
  const key = crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(b.key, 'base64'));
  const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(b.iv, 'base64'));
  d.setAuthTag(Buffer.from(b.tag, 'base64'));
  const env = JSON.parse(Buffer.concat([d.update(Buffer.from(b.data, 'base64')), d.final()]).toString('utf8'));
  const names = Object.keys(env).sort();
  console.log(`Received ${names.length} values: ${names.join(', ')}`);
  if (process.argv.includes('--dry')) {
    console.log('Dry run: nothing written to AWS, route and keys kept.');
    process.exit(0);
  }
  for (const name of names) {
    // The value goes through a temp file (not the command line), deleted right after.
    const f = path.join(keyDir, 'p.json');
    fs.writeFileSync(f, JSON.stringify({ Name: `/aicardly/backend/${name}`, Value: env[name], Type: 'SecureString', Overwrite: true, Tier: env[name].length > 4000 ? 'Advanced' : 'Standard' }), { mode: 0o600 });
    try {
      execFileSync('aws', ['ssm', 'put-parameter', '--region', REGION, '--cli-input-json', `file://${f}`], { stdio: ['ignore', 'ignore', 'inherit'] });
    } finally {
      fs.rmSync(f, { force: true });
    }
    process.stdout.write('.');
  }
  console.log(`\nSaved ${names.length} parameters to SSM /aicardly/backend/ (${REGION}).`);
  fs.rmSync(routeFile, { force: true });
  fs.rmSync(keyDir, { recursive: true, force: true });
  console.log('Route file and keys deleted. Deploy the backend to Vercel once more so the route is gone.');
} else {
  console.log('Usage: node deploy/aws/push-secrets.mjs prepare | push');
}
