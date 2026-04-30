require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const EMAIL = 'admin@webkik.co.in';
const PLAN  = 'AI AGENT PRO';
const DAYS  = 3650; // 10 years for admin

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + DAYS);

  const user = await User.findOneAndUpdate(
    { email: EMAIL },
    { $set: { plan: PLAN, planExpiry: expiry, cardLimit: 10 } },
    { new: true }
  );

  if (!user) {
    console.log('❌  User not found:', EMAIL);
  } else {
    console.log('✅  Plan activated!');
    console.log('   Name  :', user.name || user.firstName);
    console.log('   Email :', user.email);
    console.log('   Plan  :', user.plan);
    console.log('   Expiry:', user.planExpiry.toDateString());
  }

  await mongoose.disconnect();
})();
