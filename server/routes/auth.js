const express = require('express');
const router = express.Router();
const User = require('../models/User');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'gundam_secret_key';

// Đăng ký
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'Email đã tồn tại' });

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      role: 'customer',
      status: 'active'
    });

    await user.save();

    // Sinh JWT ngay sau khi đăng ký (auto login)
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.name, 
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      joinDate: user.createdAt,
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    if (user.status === 'blocked') return res.status(403).json({ error: 'Tài khoản đã bị khóa' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });

    // Sinh JWT
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.name, 
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      joinDate: user.createdAt,
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cập nhật thông tin cá nhân
router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, phone, address } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name: fullName, phone, address },
      { new: true }
    ).select('-password');
    
    res.json({
      id: user._id,
      email: user.email,
      fullName: user.name,
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      joinDate: user.createdAt,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;