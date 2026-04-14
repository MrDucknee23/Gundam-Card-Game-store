const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();
const User = require('./models/User');

async function seedAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  await User.findOneAndUpdate(
    { email: 'admin@gundamstore.com' },
    {
      name: 'System Administrator',
      email: 'admin@gundamstore.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
    { upsert: true, new: true }
  );

  console.log('✅ Admin user ready: admin@gundamstore.com / admin123');
  await mongoose.disconnect();
  console.log('Done!');
}

seedAdmin().catch(console.error);
