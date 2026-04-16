const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// Seed danh mục mặc định nếu DB trống
const seedDefaults = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
    await Category.insertMany([
      { name: 'gundam', slug: 'gundam', label: 'Gundam', description: 'Mô hình Gundam các loại' },
      { name: 'pokemon', slug: 'pokemon', label: 'Pokémon', description: 'Thẻ bài Pokémon TCG' },
      { name: 'onepiece', slug: 'onepiece', label: 'One Piece', description: 'Thẻ bài One Piece Card Game' },
    ]);
    console.log('✅ Đã seed 3 danh mục mặc định');
  }
};
seedDefaults().catch(err => console.error('Seed categories error:', err));

// 1. Lấy tất cả danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    const formatted = categories.map(c => ({
      ...c.toObject(),
      id: c._id.toString(),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Thêm danh mục mới
router.post('/', async (req, res) => {
  try {
    const { name, slug, label, description } = req.body;

    if (!name || !slug || !label) {
      return res.status(400).json({ message: 'Tên, slug và label là bắt buộc' });
    }

    const slugClean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!slugClean) {
      return res.status(400).json({ message: 'Slug không hợp lệ (chỉ chấp nhận a-z, 0-9, dấu gạch ngang)' });
    }

    const existing = await Category.findOne({ $or: [{ name: name.trim() }, { slug: slugClean }] });
    if (existing) {
      return res.status(409).json({ message: 'Danh mục đã tồn tại' });
    }

    const category = new Category({
      name: name.trim(),
      slug: slugClean,
      label: label.trim(),
      description: (description || '').trim(),
    });
    const saved = await category.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 3. Sửa danh mục
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, label, description } = req.body;

    if (!name || !slug || !label) {
      return res.status(400).json({ message: 'Tên, slug và label là bắt buộc' });
    }

    const slugClean = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!slugClean) {
      return res.status(400).json({ message: 'Slug không hợp lệ' });
    }

    // Kiểm tra trùng (trừ chính nó)
    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: slugClean }],
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(409).json({ message: 'Danh mục đã tồn tại' });
    }

    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Nếu slug thay đổi, cập nhật category của tất cả sản phẩm liên quan
    if (oldCategory.slug !== slugClean) {
      await Product.updateMany(
        { category: oldCategory.slug },
        { $set: { category: slugClean } }
      );
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, {
      name: name.trim(),
      slug: slugClean,
      label: label.trim(),
      description: (description || '').trim(),
    }, { new: true });

    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Xóa danh mục
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    // Chặn xóa nếu còn sản phẩm
    const productCount = await Product.countDocuments({ category: category.slug });
    if (productCount > 0) {
      return res.status(400).json({
        message: `Không thể xóa: còn ${productCount} sản phẩm thuộc danh mục "${category.label}"`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
