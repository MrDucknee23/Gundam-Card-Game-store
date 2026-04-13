const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email đã tồn tại' });

    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password,
      phone: phone || '',
      role: 'customer',
      status: 'active'
    });

    await user.save();
    res.status(201).json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.name, 
      role: user.role,
      phone: user.phone || '',
      joinDate: user.createdAt,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    
    if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    if (user.status === 'blocked') return res.status(403).json({ error: 'Tài khoản đã bị khóa' });

    res.json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.name, 
      role: user.role,
      phone: user.phone || '',      // ← thêm
      joinDate: user.createdAt,     // ← thêm
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật thông tin cá nhân
router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: fullName, phone },
      { new: true }
    ).select('-password');
    
    res.json({
      id: user._id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      phone: user.phone || '',
      joinDate: user.createdAt,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;