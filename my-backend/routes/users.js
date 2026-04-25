const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
<<<<<<< HEAD
=======
const {
  isDbReady,
  isDbUnavailableError,
  logDbDegraded,
  sendDegradedJson,
} = require('../utils/dbState');
>>>>>>> main

const PAID_PAYMENT_STATUSES = ['Đã thanh toán', 'paid', 'Paid', 'PAID'];

// Lấy tất cả users
router.get('/', async (req, res) => {
  if (!isDbReady()) {
    logDbDegraded('users:list');
    return sendDegradedJson(res, [], { source: 'users-empty' });
  }

  try {
    const users = await User.find().select('-password').lean();

    const orderStats = await Order.aggregate([
      {
        $match: {
          paymentStatus: { $in: PAID_PAYMENT_STATUSES },
          'customer.email': { $type: 'string', $ne: '' }
        }
      },
      {
        $project: {
          emailNorm: { $toLower: '$customer.email' },
          totalAmount: { $ifNull: ['$totalAmount', 0] }
        }
      },
      {
        $group: {
          _id: '$emailNorm',
          totalSpending: { $sum: '$totalAmount' },
          ordersCount: { $sum: 1 }
        }
      }
    ]);

    const statsByEmail = new Map(
      orderStats.map((entry) => [entry._id, {
        totalSpending: entry.totalSpending || 0,
        ordersCount: entry.ordersCount || 0,
      }])
    );

    const mergedUsers = users.map((user) => {
      const emailNorm = typeof user.email === 'string' ? user.email.toLowerCase() : '';
      const stats = statsByEmail.get(emailNorm);

      return {
        ...user,
        totalSpending: stats?.totalSpending || 0,
        ordersCount: stats?.ordersCount || 0,
      };
    });

    res.json(mergedUsers);
  } catch (err) {
    if (isDbUnavailableError(err)) {
      logDbDegraded('users:list', err);
      return sendDegradedJson(res, [], { source: 'users-empty' });
    }

    res.status(500).json({ error: err.message });
  }
});

// Thêm user mới
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sửa user
router.put('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Xóa user
router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khóa/mở khóa user
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;