// What each admin role may do. Routes ask for a permission (requirePermission), never a role,
// so changing a role's reach happens only here. The admin UI hides what the role can't do,
// but the server is what enforces it.
const SUPPORT = [
  'dashboard.view',
  'users.view',
  'cards.view',
  'payments.view',
  'plans.view',
  'support.view',
  'support.update',
  'payments.resend', // resend / regenerate a payment link, resend a delivered card
  'leads.view', // people who asked the team to contact them (Cardy lead form)
  'leads.update',
  'users.reset_link', // email the user a password-reset / verification link
];

const ADMIN = [
  ...SUPPORT,
  'users.block',
  'users.delete', // soft delete + restore
  'users.plan', // grant / extend / change / revoke plans
  'users.credits', // free card credits, card limit
  'users.create', // add a site account for a customer
  'users.edit', // name, email, phone, email verified
  'users.password', // sign the user out everywhere (passwords are only reset by email link)
  'users.impersonate', // sign in to the site as the user (to fix their card for them)
  'export.csv',
  'plans.manage',
  'logs.view', // app logs + AI usage
  'cards.moderate', // hide / show a card, fix its link
  'payments.refund', // refund a plan payment
  'audit.view',
];

const SUPER_ADMIN = [...ADMIN, 'users.purge', 'admins.manage'];

const PERMISSIONS = {
  super_admin: new Set(SUPER_ADMIN),
  admin: new Set(ADMIN),
  support: new Set(SUPPORT),
};

const can = (role, permission) => !!PERMISSIONS[role]?.has(permission);
const permissionsOf = (role) => [...(PERMISSIONS[role] || [])];

module.exports = { can, permissionsOf, PERMISSIONS };
