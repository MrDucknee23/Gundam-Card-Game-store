const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Order = require('../models/Order');
const User = require('../models/User');

const buildMongoUri = () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }

  const {
    MONGODB_USERNAME,
    MONGODB_PASSWORD,
    MONGODB_CLUSTER,
    MONGODB_DB_NAME = 'gundam-store',
  } = process.env;

  if (!MONGODB_USERNAME || !MONGODB_PASSWORD || !MONGODB_CLUSTER) {
    return '';
  }

  return `mongodb+srv://${encodeURIComponent(MONGODB_USERNAME)}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_CLUSTER}/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const main = async () => {
  const apply = process.argv.includes('--apply');
  const mongoUri = buildMongoUri();

  if (!mongoUri) {
    throw new Error('Thieu cau hinh ket noi MongoDB trong .env');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const users = await User.find({}, '_id email').lean();
  const userMap = new Map();
  for (const user of users) {
    const email = normalizeEmail(user.email);
    if (!email) continue;

    if (!userMap.has(email)) {
      userMap.set(email, []);
    }
    userMap.get(email).push(String(user._id));
  }

  const legacyOrders = await Order.find({ userId: null }, '_id customer.email').lean();

  const summary = {
    mode: apply ? 'apply' : 'dry-run',
    scanned: legacyOrders.length,
    matched: 0,
    updated: 0,
    skippedNoEmail: 0,
    skippedNoUser: 0,
    skippedAmbiguous: 0,
  };

  for (const order of legacyOrders) {
    const email = normalizeEmail(order.customer?.email);
    if (!email) {
      summary.skippedNoEmail += 1;
      continue;
    }

    const matchedUsers = userMap.get(email) || [];
    if (matchedUsers.length === 0) {
      summary.skippedNoUser += 1;
      continue;
    }

    if (matchedUsers.length > 1) {
      summary.skippedAmbiguous += 1;
      continue;
    }

    summary.matched += 1;

    if (apply) {
      const updateResult = await Order.updateOne(
        { _id: order._id, userId: null },
        { $set: { userId: matchedUsers[0] } }
      );
      if (updateResult.modifiedCount === 1) {
        summary.updated += 1;
      }
    }
  }

  console.log('Migration summary:');
  console.log(JSON.stringify(summary, null, 2));
  console.log('Tip: Chay voi --apply de ghi du lieu. Mac dinh la dry-run.');
};

main()
  .catch((error) => {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => undefined);
  });
