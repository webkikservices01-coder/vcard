// Admin panel auth & authorization. Runs without a database: the few model calls on these
// paths are stubbed. Run with: npm test
const { test, describe, before, after, beforeEach, mock } = require('node:test');
const assert = require('node:assert/strict');

process.env.JWT_SECRET = 'user-secret-for-tests-0123456789abcdef';
process.env.ADMIN_JWT_SECRET = 'admin-secret-for-tests-0123456789abcdef-xyz';
process.env.ADMIN_ENABLED = 'true';
delete process.env.ADMIN_IP_ALLOWLIST;

const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const { createAdminApi } = require('../routes/admin');
const userAuth = require('../middleware/auth');
const { signAccessToken } = require('../middleware/admin/auth');
const { COOKIES } = require('../utils/adminConfig');
const { can } = require('../constants/adminPermissions');
const { totpAt, verifyTotp, base32Encode } = require('../utils/totp');
const { toCsv } = require('../utils/csv');
const { forgetAccountStatus } = require('../utils/accountStatus');

const ids = { super: 'a'.repeat(24), admin: 'b'.repeat(24), support: 'c'.repeat(24), off: 'd'.repeat(24), user: 'e'.repeat(24), blocked: 'f'.repeat(24) };
const admins = {
  [ids.super]: { _id: ids.super, name: 'Super', email: 's@x.io', role: 'super_admin', isActive: true, tokenVersion: 0 },
  [ids.admin]: { _id: ids.admin, name: 'Admin', email: 'a@x.io', role: 'admin', isActive: true, tokenVersion: 0 },
  [ids.support]: { _id: ids.support, name: 'Support', email: 'c@x.io', role: 'support', isActive: true, tokenVersion: 3 },
  [ids.off]: { _id: ids.off, name: 'Off', email: 'd@x.io', role: 'super_admin', isActive: false, tokenVersion: 0 },
};
const users = {
  [ids.user]: { _id: ids.user, status: 'active' },
  [ids.blocked]: { _id: ids.blocked, status: 'active', isBlocked: true },
};

let server;
let base;
const CSRF = 'csrf-token-for-tests';

before(async () => {
  mock.method(Admin, 'findById', (id) => ({ lean: async () => admins[String(id)] || null }));
  mock.method(Admin, 'find', () => ({ sort: () => ({ lean: async () => Object.values(admins) }) }));
  mock.method(User, 'findById', (id) => ({ select: () => ({ lean: async () => users[String(id)] || null }) }));

  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use('/api/admin', createAdminApi());
  app.get('/api/user-only', userAuth, (req, res) => res.json({ ok: true, userId: req.user.userId }));
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server?.close();
  mock.restoreAll();
});

beforeEach(() => {
  process.env.ADMIN_ENABLED = 'true';
  process.env.ADMIN_JWT_SECRET = 'admin-secret-for-tests-0123456789abcdef-xyz';
  Object.keys(users).forEach(forgetAccountStatus);
});

const adminCookie = (id, tokenVersion) => `${COOKIES.access}=${signAccessToken({ _id: id, tokenVersion: tokenVersion ?? admins[id]?.tokenVersion ?? 0 })}`;
const userToken = (userId = ids.user) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
const call = (path, { method = 'GET', cookie = '', headers = {}, body } = {}) =>
  fetch(base + path, {
    method,
    headers: { ...(cookie && { cookie }), ...(body && { 'content-type': 'application/json' }), ...headers },
    body: body && JSON.stringify(body),
  });
const withCsrf = (cookie) => ({ cookie: `${cookie}; ${COOKIES.csrf}=${CSRF}`, headers: { 'x-csrf-token': CSRF } });

describe('admin routes reject non-admins', () => {
  test('no session → 401', async () => {
    assert.equal((await call('/api/admin/dashboard')).status, 401);
  });

  test('a site user token (x-auth-token) never works on admin routes', async () => {
    const res = await call('/api/admin/dashboard', { headers: { 'x-auth-token': userToken() } });
    assert.equal(res.status, 401);
  });

  test('a site user token placed in the admin cookie is rejected', async () => {
    assert.equal((await call('/api/admin/dashboard', { cookie: `${COOKIES.access}=${userToken()}` })).status, 401);
  });

  test('an admin-shaped token signed with the user secret is rejected', async () => {
    const forged = jwt.sign({ sub: ids.super, typ: 'admin', ver: 0 }, process.env.JWT_SECRET, { audience: 'aicardly-admin', issuer: 'aicardly' });
    assert.equal((await call('/api/admin/admins', { cookie: `${COOKIES.access}=${forged}` })).status, 401);
  });

  test('a deactivated admin is rejected even with a valid token', async () => {
    assert.equal((await call('/api/admin/admins', { cookie: adminCookie(ids.off) })).status, 401);
  });

  test('an old token (before a password reset / role change) is rejected', async () => {
    assert.equal((await call('/api/admin/admins', { cookie: adminCookie(ids.support, 2) })).status, 401);
  });

  test('an expired token is rejected', async () => {
    const expired = jwt.sign({ sub: ids.super, typ: 'admin', ver: 0 }, process.env.ADMIN_JWT_SECRET, { audience: 'aicardly-admin', issuer: 'aicardly', expiresIn: -10 });
    const res = await call('/api/admin/admins', { cookie: `${COOKIES.access}=${expired}` });
    assert.equal(res.status, 401);
    assert.equal((await res.json()).code, 'ADMIN_TOKEN_EXPIRED');
  });
});

describe('roles', () => {
  test('super_admin can manage admins', async () => {
    const res = await call('/api/admin/admins', { cookie: adminCookie(ids.super) });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(Array.isArray(body.admins));
    assert.ok(body.admins.every((a) => !('passwordHash' in a) && !('totpSecretEnc' in a)), 'no secrets in the response');
  });

  test('admin and support cannot manage admins', async () => {
    assert.equal((await call('/api/admin/admins', { cookie: adminCookie(ids.admin) })).status, 403);
    assert.equal((await call('/api/admin/admins', { cookie: adminCookie(ids.support) })).status, 403);
  });

  test('support cannot block users or delete them', async () => {
    const block = await call(`/api/admin/users/${ids.user}/block`, { method: 'POST', body: {}, ...withCsrf(adminCookie(ids.support)) });
    assert.equal(block.status, 403);
    const purge = await call(`/api/admin/users/${ids.user}`, { method: 'DELETE', body: { confirmEmail: 'x@y.z' }, ...withCsrf(adminCookie(ids.support)) });
    assert.equal(purge.status, 403);
  });

  test('admin cannot permanently delete users (super_admin only)', async () => {
    const res = await call(`/api/admin/users/${ids.user}`, { method: 'DELETE', body: { confirmEmail: 'x@y.z' }, ...withCsrf(adminCookie(ids.admin)) });
    assert.equal(res.status, 403);
  });

  test('permission table', () => {
    assert.equal(can('support', 'payments.resend'), true);
    assert.equal(can('support', 'users.block'), false);
    assert.equal(can('admin', 'users.block'), true);
    assert.equal(can('admin', 'users.purge'), false);
    assert.equal(can('admin', 'admins.manage'), false);
    assert.equal(can('super_admin', 'users.purge'), true);
    assert.equal(can('super_admin', 'admins.manage'), true);
    assert.equal(can('nobody', 'users.view'), false);
  });
});

describe('CSRF and origin', () => {
  test('a changing request without the CSRF token is refused', async () => {
    const res = await call(`/api/admin/users/${ids.user}/block`, { method: 'POST', body: {}, cookie: adminCookie(ids.super) });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, 'ADMIN_CSRF');
  });

  test('a wrong CSRF token is refused', async () => {
    const res = await call(`/api/admin/users/${ids.user}/block`, { method: 'POST', body: {}, cookie: `${adminCookie(ids.super)}; ${COOKIES.csrf}=${CSRF}`, headers: { 'x-csrf-token': 'other' } });
    assert.equal(res.status, 403);
  });

  test('a request from another origin is refused', async () => {
    const { cookie, headers } = withCsrf(adminCookie(ids.super));
    const res = await call(`/api/admin/users/${ids.user}/block`, { method: 'POST', body: {}, cookie, headers: { ...headers, origin: 'https://evil.example' } });
    assert.equal(res.status, 403);
  });

  test('GET /auth/csrf sets a CSRF cookie', async () => {
    const res = await call('/api/admin/auth/csrf');
    assert.equal(res.status, 200);
    assert.match(res.headers.get('set-cookie') || '', new RegExp(`${COOKIES.csrf}=.+SameSite=Strict`, 'i'));
  });
});

describe('site user routes reject admin tokens and blocked users', () => {
  test('a site user token works on user routes', async () => {
    const res = await call('/api/user-only', { headers: { 'x-auth-token': userToken() } });
    assert.equal(res.status, 200);
  });

  test('an admin access token never works on user routes', async () => {
    const adminToken = signAccessToken({ _id: ids.super, tokenVersion: 0 });
    assert.equal((await call('/api/user-only', { headers: { 'x-auth-token': adminToken } })).status, 401);
  });

  test('a token carrying typ "admin" signed with the user secret is refused on user routes', async () => {
    const t = jwt.sign({ userId: ids.user, typ: 'admin' }, process.env.JWT_SECRET);
    assert.equal((await call('/api/user-only', { headers: { 'x-auth-token': t } })).status, 401);
  });

  test('a blocked user is refused even with a valid token', async () => {
    const res = await call('/api/user-only', { headers: { 'x-auth-token': userToken(ids.blocked) } });
    assert.equal(res.status, 403);
    assert.equal((await res.json()).code, 'ACCOUNT_BLOCKED');
  });
});

describe('switching the panel off', () => {
  test('ADMIN_ENABLED=false → admin API is 404', async () => {
    process.env.ADMIN_ENABLED = 'false';
    assert.equal((await call('/api/admin/auth/csrf')).status, 404);
  });

  test('ADMIN_JWT_SECRET equal to JWT_SECRET → admin API is 404', async () => {
    process.env.ADMIN_JWT_SECRET = process.env.JWT_SECRET;
    assert.equal((await call('/api/admin/auth/csrf')).status, 404);
  });

  test('responses carry security headers and are not cached', async () => {
    const res = await call('/api/admin/auth/csrf');
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.match(res.headers.get('content-security-policy') || '', /frame-ancestors 'none'/);
  });
});

describe('helpers', () => {
  test('TOTP matches the RFC 6238 test vector', () => {
    const secret = base32Encode(Buffer.from('12345678901234567890'));
    assert.equal(totpAt(secret, 59 * 1000, 8), '94287082');
    assert.equal(totpAt(secret, 1111111109 * 1000, 8), '07081804');
    assert.equal(verifyTotp(secret, totpAt(secret)), true);
    assert.equal(verifyTotp(secret, '000000', 59 * 1000), false);
  });

  test('CSV cells cannot run as spreadsheet formulas', () => {
    const csv = toCsv([{ a: '=HYPERLINK("x")', b: 'plain, text' }], [{ header: 'A', value: (r) => r.a }, { header: 'B', value: (r) => r.b }]);
    assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
    assert.ok(csv.includes('"plain, text"'));
  });
});
