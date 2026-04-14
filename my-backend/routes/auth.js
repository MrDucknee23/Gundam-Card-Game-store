const express = require('express');
const router = express.Router();
const User = require('../models/User');

const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/u;
const addressRegex = /^[0-9A-Za-zÀ-ỹ\s]+$/u;
const phoneRegex = /^[0-9]{9,11}$/;

const isValidName = (value) => nameRegex.test(String(value || '').trim());
const isValidAddress = (value) => addressRegex.test(String(value || '').trim());
const isValidPhone = (value) => phoneRegex.test(String(value || '').trim());

const normalizeAddresses = (addresses, fullName, phone) => {
  if (!Array.isArray(addresses)) return [];

  const normalized = addresses.map((item, index) => ({
    label: item.label || `Địa chỉ ${index + 1}`,
    receiverName: item.receiverName || fullName || '',
    receiverPhone: item.receiverPhone || phone || '',
    address: String(item.address || '').trim(),
    isDefault: !!item.isDefault,
  }));

  if (normalized.length > 0 && !normalized.some((item) => item.isDefault)) {
    normalized[0].isDefault = true;
  }

  return normalized;
};

const formatUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  fullName: user.name,
  role: user.role,
  phone: user.phone || '',
  address: user.address || '',
  addresses: user.addresses || [],
  joinDate: user.createdAt,
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;
<<<<<<< HEAD
    
=======

    if (!isValidName(firstName) || !isValidName(lastName)) {
      return res.status(400).json({
        error: 'Họ tên không được chứa số hoặc ký tự đặc biệt',
      });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        error: 'Số điện thoại chỉ được nhập số và phải từ 9 đến 11 chữ số',
      });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({
        error: 'Địa chỉ không được chứa ký tự đặc biệt',
      });
    }

>>>>>>> c27dcdde (Update user validation and address management)
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email đã tồn tại' });
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const cleanPhone = phone.trim();
    const cleanAddress = address.trim();

    const user = new User({
      name: fullName,
      email,
      password,
<<<<<<< HEAD
      phone: phone || '',
      address: address || '',
=======
      phone: cleanPhone,
      address: cleanAddress,
      addresses: [
        {
          label: 'Địa chỉ nhà',
          receiverName: fullName,
          receiverPhone: cleanPhone,
          address: cleanAddress,
          isDefault: true,
        },
      ],
>>>>>>> c27dcdde (Update user validation and address management)
      role: 'customer',
      status: 'active',
    });

    await user.save();
<<<<<<< HEAD
    res.status(201).json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.name, 
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      joinDate: user.createdAt,
    });
=======

    res.status(201).json(formatUserResponse(user));
>>>>>>> c27dcdde (Update user validation and address management)
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

<<<<<<< HEAD
    res.json({ 
      id: user._id, 
      email: user.email, 
      fullName: user.name, 
      role: user.role,
      phone: user.phone || '',
      address: user.address || '',
      joinDate: user.createdAt,
    });
=======
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa' });
    }

    res.json(formatUserResponse(user));
>>>>>>> c27dcdde (Update user validation and address management)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/profile/:id', async (req, res) => {
  try {
<<<<<<< HEAD
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
=======
    const { fullName, phone, address, addresses } = req.body;

    if (fullName !== undefined && !isValidName(fullName)) {
      return res.status(400).json({
        error: 'Họ tên không được chứa số hoặc ký tự đặc biệt',
      });
    }

    if (phone !== undefined && phone && !isValidPhone(phone)) {
      return res.status(400).json({
        error: 'Số điện thoại chỉ được nhập số và phải từ 9 đến 11 chữ số',
      });
    }

    if (address !== undefined && address && !isValidAddress(address)) {
      return res.status(400).json({
        error: 'Địa chỉ không được chứa ký tự đặc biệt',
      });
    }

    if (Array.isArray(addresses)) {
      for (const item of addresses) {
        if (!isValidAddress(item.address)) {
          return res.status(400).json({
            error: 'Địa chỉ giao hàng không được chứa ký tự đặc biệt',
          });
        }

        if (item.receiverName && !isValidName(item.receiverName)) {
          return res.status(400).json({
            error: 'Tên người nhận không được chứa số hoặc ký tự đặc biệt',
          });
        }

        if (item.receiverPhone && !isValidPhone(item.receiverPhone)) {
          return res.status(400).json({
            error: 'Số điện thoại người nhận không hợp lệ',
          });
        }
      }
    }

    const updateData = {};

    if (fullName !== undefined) {
      updateData.name = fullName.trim();
    }

    if (phone !== undefined) {
      updateData.phone = phone.trim();
    }

    if (address !== undefined) {
      updateData.address = address.trim();
    }

    if (Array.isArray(addresses)) {
      const normalizedAddresses = normalizeAddresses(addresses, fullName, phone);
      updateData.addresses = normalizedAddresses;

      const defaultAddress = normalizedAddresses.find((item) => item.isDefault);
      if (defaultAddress) {
        updateData.address = defaultAddress.address;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json(formatUserResponse(user));
>>>>>>> c27dcdde (Update user validation and address management)
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;