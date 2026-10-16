// What each admin role may do. Routes ask for a permission (requirePermission), never a role,
// so changing a role's reach happens only here. A super admin can also give one admin extra
// permissions or take some away (Admins page → Permissions); those live on the admin
// (extraPermissions / removedPermissions). The admin UI hides what they can't do, but the
// server is what enforces it.
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
  'orders.view', // metal NFC card orders
  'orders.manage', // move an order along: confirmed, printing, shipped (tracking), delivered
  'coupons.view',
  'content.view', // site testimonials and card reviews
  'invites.view', // digital invites
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
  'export.csv', // list exports and one user's data export (asks for a reason)
  'plans.manage',
  'logs.view', // app logs + AI usage
  'cards.moderate', // hide / show a card, fix its link
  'payments.refund', // refund a plan payment
  'audit.view',
  'coupons.manage',
  'content.manage', // add / edit site testimonials, remove a card review
  'invites.moderate', // take an invite offline / back online
  'emails.manage', // email templates: subject, heading, first line
  'ai.settings', // Cardy (the website chatbot): on/off, welcome, extra knowledge, booking link
];

const SUPER_ADMIN = [...ADMIN, 'users.purge', 'admins.manage', 'settings.manage'];

const PERMISSIONS = {
  super_admin: new Set(SUPER_ADMIN),
  admin: new Set(ADMIN),
  support: new Set(SUPPORT),
};

// Every permission with a plain label, for the Permissions editor.
const CATALOG = [
  ['Overview', [['dashboard.view', 'See the dashboard']]],
  ['Customers', [
    ['users.view', 'See users'], ['users.create', 'Add users'], ['users.edit', 'Edit user details'], ['users.block', 'Block / unblock users'],
    ['users.delete', 'Delete / restore users'], ['users.purge', 'Delete users permanently'], ['users.plan', 'Give or change plans'],
    ['users.credits', 'Card credits and limits'], ['users.password', 'Sign users out everywhere'], ['users.reset_link', 'Send reset / verify links'],
    ['users.impersonate', 'Sign in as a user'], ['cards.view', 'See cards'], ['cards.moderate', 'Hide cards, fix card links'],
    ['leads.view', 'See leads & enquiries'], ['leads.update', 'Update lead status'], ['support.view', 'See support tickets'], ['support.update', 'Reply to tickets'],
  ]],
  ['Orders & money', [
    ['orders.view', 'See metal card orders'], ['orders.manage', 'Update orders and tracking'], ['payments.view', 'See payments'],
    ['payments.resend', 'Resend payment links'], ['payments.refund', 'Refund payments'], ['plans.view', 'See plans'], ['plans.manage', 'Edit plans'],
    ['coupons.view', 'See coupons'], ['coupons.manage', 'Create and edit coupons'],
  ]],
  ['Content', [
    ['content.view', 'See testimonials and reviews'], ['content.manage', 'Edit testimonials, remove reviews'],
    ['invites.view', 'See digital invites'], ['invites.moderate', 'Take invites offline'], ['emails.manage', 'Edit email templates'],
    ['ai.settings', 'Website chatbot settings'],
  ]],
  ['System', [
    ['export.csv', 'Export data (with a reason)'], ['logs.view', 'App logs & AI usage'], ['audit.view', 'Audit log'],
    ['settings.manage', 'Site and security settings'], ['admins.manage', 'Manage admins and permissions'],
  ]],
];
const ALL = new Set(CATALOG.flatMap(([, items]) => items.map(([p]) => p)));

// who: a role name, or an admin { role, extraPermissions, removedPermissions }.
function permissionSet(who) {
  if (!who) return new Set();
  if (typeof who === 'string') return new Set(PERMISSIONS[who] || []);
  const set = new Set(PERMISSIONS[who.role] || []);
  for (const p of who.extraPermissions || []) if (ALL.has(p)) set.add(p);
  for (const p of who.removedPermissions || []) set.delete(p);
  // A super admin always keeps admin management (so nobody locks the panel).
  if (who.role === 'super_admin') set.add('admins.manage');
  return set;
}

const can = (who, permission) => permissionSet(who).has(permission);
const permissionsOf = (who) => [...permissionSet(who)];

module.exports = { can, permissionsOf, PERMISSIONS, CATALOG, ALL_PERMISSIONS: ALL };
