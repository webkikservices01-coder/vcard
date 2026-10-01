// One-time (safe to re-run) setup for the admin panel:
//   1. creates the admin collections' indexes
//   2. seeds the plans from constants/plans.js CATALOG (existing plans are left as they are)
//   3. backfills plan history (user_plans) from completed plan payments and from users who
//      have a running plan but no history yet
// New user fields (isBlocked, deletedAt, freeCardCredits) need no migration: missing = default.
//
//   npm run admin:migrate
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { runAdminSetup } = require('../services/admin/setup');

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  try {
    const r = await runAdminSetup();
    console.log('✓ indexes');
    console.log(`✓ plans: ${r.plansAdded} added, ${r.plansTotal - r.plansAdded} already there`);
    console.log(`✓ plan history: ${r.fromPayments} from payments, ${r.activated} marked active, ${r.fromUsers} from users without history`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
