// Is this card allowed to be seen by the public? Not when an admin hid it, and not when its
// owner is removed or no longer exists (a permanently deleted account must not leave a live card).
const { accountStatus } = require('./accountStatus');

async function isPublicCard(card) {
  if (!card || card.adminHidden) return false;
  if (!card.userId) return false;
  const status = await accountStatus(card.userId);
  return status !== 'removed' && status !== 'missing';
}

module.exports = { isPublicCard };
