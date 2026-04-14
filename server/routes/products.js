const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticateJWT = require('../middleware/authenticateJWT');

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Chỉ admin mới được phép thực hiện!' });
}

// 1. Lấy danh sách toàn bộ sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    // Đổi _id thành id để Frontend React dễ đọc
    const formatted = products.map(p => ({
      ...p.toObject(),
      id: p._id.toString()
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Lấy chi tiết 1 sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ ...product.toObject(), id: product._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Thêm sản phẩm mới (admin)
router.post('/', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Cập nhật sản phẩm (admin)
router.put('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. Xóa sản phẩm (admin)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;