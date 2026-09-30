// Runs work after the response is sent. On Vercel the function stays alive until it finishes
// (waitUntil); elsewhere (local server) the promise simply keeps running.
let waitUntil = null;
try {
  ({ waitUntil } = require('@vercel/functions'));
} catch {
  /* not on Vercel */
}

module.exports = function background(promise) {
  const p = Promise.resolve(promise).catch((err) => console.error('Background task failed:', err.message));
  if (waitUntil) {
    try {
      waitUntil(p);
    } catch {
      /* outside a request context */
    }
  }
  return p;
};
