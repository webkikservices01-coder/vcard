// Is this site user allowed in right now? (not blocked / removed from the admin panel, and the
// token not older than a password change or "sign out everywhere")
// Checked by middleware/auth.js on every signed-in request, so a block takes effect on tokens
// already issued too. Cached for 30 seconds per server instance to keep requests fast;
// the admin panel clears the cache on the instance that made the change.
const User = require('../models/User');

const TTL_MS = 30 * 1000;
const cache = new Map();

async function lookup(userId) {
  const key = String(userId);
  const hit = cache.get(key);
  if (hit && hit.at > Date.now() - TTL_MS) return hit;
  const u = await User.findById(key).select('isBlocked deletedAt status tokensValidAfter').lean();
  const status = !u ? 'missing' : u.deletedAt ? 'removed' : u.isBlocked ? 'blocked' : u.status === 'inactive' ? 'inactive' : 'ok';
  const entry = { status, after: u?.tokensValidAfter ? Math.floor(new Date(u.tokensValidAfter).getTime() / 1000) : 0, at: Date.now() };
  cache.set(key, entry);
  if (cache.size > 5000) cache.delete(cache.keys().next().value);
  return entry;
}

// issuedAt: the token's iat (seconds). A token from before tokensValidAfter is 'revoked'.
async function accountStatus(userId, issuedAt) {
  const { status, after } = await lookup(userId);
  if (status === 'ok' && issuedAt && after && issuedAt < after) return 'revoked';
  return status;
}

const forgetAccountStatus = (userId) => cache.delete(String(userId));

module.exports = { accountStatus, forgetAccountStatus };
