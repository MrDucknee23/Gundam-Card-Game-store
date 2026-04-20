const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');

const PAID_PAYMENT_STATUSES = ['Đã thanh toán', 'paid', 'Paid', 'PAID'];

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const fetchStatsByEmails = async (emails) => {
  if (!emails.length) {
    return new Map();
  }

  const normalizedEmails = emails
    .map((email) => String(email || '').toLowerCase())
    .filter(Boolean);

  if (!normalizedEmails.length) {
    return new Map();
  }

  const orderStats = await Order.aggregate([
    {
      $match: {
        paymentStatus: { $in: PAID_PAYMENT_STATUSES },
        'customer.email': { $type: 'string', $ne: '' },
      },
    },
    {
      $project: {
        emailNorm: { $toLower: '$customer.email' },
        totalAmount: { $ifNull: ['$totalAmount', 0] },
      },
    },
    {
      $match: {
        emailNorm: { $in: normalizedEmails },
      },
    },
    {
      $group: {
        _id: '$emailNorm',
        totalSpending: { $sum: '$totalAmount' },
        ordersCount: { $sum: 1 },
      },
    },
  ]);

  return new Map(
    orderStats.map((entry) => [entry._id, {
      totalSpending: entry.totalSpending || 0,
      ordersCount: entry.ordersCount || 0,
    }])
  );
};

// Lấy tất cả users
router.get('/', async (req, res) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const shouldPaginate = pageParam !== undefined || limitParam !== undefined;
    const page = parsePositiveInt(pageParam, 1);
    const limit = Math.min(parsePositiveInt(limitParam, 10), 50);

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const role = typeof req.query.role === 'string' ? req.query.role.trim() : '';

    const filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }

    if (search) {
      const queryRegex = new RegExp(escapeRegex(search), 'i');
      const phoneDigits = search.replace(/\D/g, '');
      filter.$or = [
        { name: queryRegex },
        { email: queryRegex },
      ];
      if (phoneDigits) {
        filter.$or.push({ phone: new RegExp(escapeRegex(phoneDigits)) });
      }
    }

    const baseQuery = User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    let users;
    let total = 0;

    if (shouldPaginate) {
      total = await User.countDocuments(filter);
      users = await baseQuery.skip((page - 1) * limit).limit(limit);
    } else {
      users = await baseQuery;
    }

    const statsByEmail = await fetchStatsByEmails(users.map((user) => user.email));

    const mergedUsers = users.map((user) => {
      const emailNorm = typeof user.email === 'string' ? user.email.toLowerCase() : '';
      const stats = statsByEmail.get(emailNorm);

      return {
        ...user,
        totalSpending: stats?.totalSpending || 0,
        ordersCount: stats?.ordersCount || 0,
      };
    });

    if (!shouldPaginate) {
      return res.json(mergedUsers);
    }

    return res.json({
      items: mergedUsers,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (err) {
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