// Creates the first super admin for the admin panel (nothing is hardcoded).
//
//   npm run admin:create -- --email you@company.com --name "Your Name"
//
// The password is read from ADMIN_SEED_PASSWORD, or asked for when the script runs.
// Email and name can also come from ADMIN_SEED_EMAIL / ADMIN_SEED_NAME.
// Refuses to run when a super admin already exists (add more admins in the panel).
// Recovery when locked out: add --reset to set a new password for an existing admin
// (it also clears the lockout and switches 2FA off for that admin).
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const readline = require('readline');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

function ask(question, hidden) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => rl.output.write(s.includes(question) ? s : '*');
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

(async () => {
  const email = String(arg('email') || process.env.ADMIN_SEED_EMAIL || '').trim().toLowerCase();
  const name = String(arg('name') || process.env.ADMIN_SEED_NAME || '').trim();
  const reset = process.argv.includes('--reset');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    console.error('Give a valid email: --email you@company.com (or ADMIN_SEED_EMAIL).');
    process.exit(1);
  }
  if (!reset && name.length < 2) {
    console.error('Give a name: --name "Your Name" (or ADMIN_SEED_NAME).');
    process.exit(1);
  }
  let password = process.env.ADMIN_SEED_PASSWORD || '';
  if (!password) {
    if (!process.stdin.isTTY) {
      console.error('Set ADMIN_SEED_PASSWORD, or run this in a terminal to type the password.');
      process.exit(1);
    }
    password = await ask('Password (min 12 characters): ', true);
    const again = await ask('Repeat password: ', true);
    if (password !== again) {
      console.error('Passwords do not match.');
      process.exit(1);
    }
  }
  if (password.length < 12 || password.length > 128) {
    console.error('The password must be 12–128 characters.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  try {
    const hash = await bcrypt.hash(password, 12);
    if (reset) {
      const admin = await Admin.findOne({ email });
      if (!admin) throw new Error(`No admin with email ${email}.`);
      admin.passwordHash = hash;
      admin.passwordChangedAt = new Date();
      admin.tokenVersion = (admin.tokenVersion || 0) + 1;
      admin.failedLogins = 0;
      admin.lockUntil = null;
      admin.isActive = true;
      admin.totpEnabled = false;
      admin.totpSecretEnc = '';
      await admin.save();
      await require('../models/AdminSession').updateMany({ admin: admin._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
      await require('../models/AdminAuditLog').create({ action: 'admin.reset_cli', targetType: 'admin', targetId: String(admin._id), summary: `Password reset from the command line for ${email}` });
      console.log(`✅ Password reset for ${email} (lockout cleared, 2FA off, all sessions ended).`);
      return;
    }
    if (await Admin.exists({ role: 'super_admin' })) {
      throw new Error('A super admin already exists. Add more admins from the admin panel (Admins page), or use --reset.');
    }
    if (await Admin.exists({ email })) throw new Error(`An admin with email ${email} already exists.`);
    const admin = await Admin.create({ name, email, role: 'super_admin', passwordHash: hash });
    await require('../models/AdminAuditLog').create({ action: 'admin.seed', targetType: 'admin', targetId: String(admin._id), adminEmail: email, adminRole: 'super_admin', summary: `First super admin created from the command line: ${email}` });
    console.log(`✅ Super admin created: ${email}. Sign in at <backend>/admin/login and switch on 2FA from "My account".`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
