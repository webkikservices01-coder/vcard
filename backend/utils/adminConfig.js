// Admin panel settings, read from the environment each time (so tests can change them).
// The panel only switches on when ADMIN_ENABLED=true AND a separate ADMIN_JWT_SECRET is set.
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

function adminConfig() {
  const secret = process.env.ADMIN_JWT_SECRET || '';
  const problems = [];
  if (process.env.ADMIN_ENABLED !== 'true') problems.push('ADMIN_ENABLED is not "true"');
  if (secret.length < 32) problems.push('ADMIN_JWT_SECRET must be at least 32 characters');
  if (secret && secret === process.env.JWT_SECRET) problems.push('ADMIN_JWT_SECRET must differ from JWT_SECRET');
  return {
    enabled: problems.length === 0,
    problems,
    jwtSecret: secret,
    // Short-lived access token; the refresh token (httpOnly cookie) keeps the admin signed in.
    accessTtlSec: Math.max(60, Number(process.env.ADMIN_ACCESS_TTL_MIN || 15) * 60),
    refreshTtlSec: Math.max(3600, Number(process.env.ADMIN_REFRESH_TTL_HOURS || 12) * 3600),
    // Extra origins allowed to call /api/admin (the panel itself is same-origin and always allowed).
    origins: list(process.env.ADMIN_ORIGINS),
    ipAllowlist: list(process.env.ADMIN_IP_ALLOWLIST),
    encryptionKey: process.env.ADMIN_ENCRYPTION_KEY || '',
    totpIssuer: process.env.ADMIN_TOTP_ISSUER || 'Aicardly Admin',
    maxFailedLogins: 5,
    lockMinutes: 15,
  };
}

const COOKIES = {
  access: 'aicardly_admin_at',
  refresh: 'aicardly_admin_rt',
  csrf: 'aicardly_admin_csrf',
};

module.exports = { adminConfig, COOKIES };
