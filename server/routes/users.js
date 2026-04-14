const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateJWT = require('../middleware/authenticateJWT');

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Chỉ admin mới được phép thực hiện!' });
}

// Lấy tất cả users (admin)
router.get('/', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Thêm user mới (admin)
router.post('/', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Sửa user (admin)
router.put('/:id', authenticateJWT, requireAdmin, async (req, res) => {
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

// Xóa user (admin)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa người dùng' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khóa/mở khóa user (admin)
router.patch('/:id/toggle-status', authenticateJWT, requireAdmin, async (req, res) => {
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