const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

const sanitizeProductPayload = (body) => ({
  name: typeof body.name === 'string' ? body.name.trim() : '',
  description: typeof body.description === 'string' ? body.description.trim() : '',
  price: Number(body.price),
  stock: Number(body.stock),
  category: body.category,
  images: Array.isArray(body.images) ? body.images.filter((image) => typeof image === 'string' && image.trim() !== '') : [],
  scale: typeof body.scale === 'string' ? body.scale.trim() : undefined,
  grade: typeof body.grade === 'string' ? body.grade.trim() : undefined,
  material: typeof body.material === 'string' ? body.material.trim() : undefined,
  rarity: typeof body.rarity === 'string' ? body.rarity.trim() : undefined,
  cardType: typeof body.cardType === 'string' ? body.cardType.trim() : undefined,
  subCategoryKey: typeof body.subCategoryKey === 'string' ? body.subCategoryKey.trim() : undefined,
  subCategoryValue: typeof body.subCategoryValue === 'string' ? body.subCategoryValue.trim() : undefined,
  featured: Boolean(body.featured),
});

const validateProductPayload = async (payload) => {
  const errors = [];

  if (!payload.name) {
    errors.push('Ten san pham la bat buoc');
  }

  const categoryDoc = await Category.findOne({ slug: payload.category });
  if (!categoryDoc) {
    errors.push('Danh muc san pham khong hop le');
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    errors.push('Gia san pham khong hop le');
  }

  if (!Number.isFinite(payload.stock) || payload.stock < 0) {
    errors.push('So luong ton kho khong hop le');
  }

  if (!Array.isArray(payload.images) || payload.images.length === 0) {
    errors.push('San pham phai co it nhat mot hinh anh');
  }

  if (Array.isArray(payload.images) && payload.images.length > 10) {
    errors.push('San pham chi duoc toi da 10 hinh anh');
  }

  const group = categoryDoc?.attributeGroup;
  const activeOptions = group?.options?.filter((option) => option.isActive !== false) ?? [];
  const selectedValue = payload.subCategoryValue || payload.grade || payload.rarity;

  if (group?.isActive && activeOptions.length > 0) {
    if (!selectedValue) {
      errors.push(`${group.label || 'Thuoc tinh'} la bat buoc`);
    } else {
      const isValidOption = activeOptions.some((option) => option.value === selectedValue || option.label === selectedValue);
      if (!isValidOption) {
        errors.push(`${group.label || 'Thuoc tinh'} khong hop le`);
      }
    }
  }

  if (selectedValue) {
    payload.subCategoryKey = group?.key || payload.subCategoryKey || undefined;
    payload.subCategoryValue = selectedValue;

    if (payload.subCategoryKey === 'grade') {
      payload.grade = selectedValue;
      payload.rarity = undefined;
    } else if (payload.subCategoryKey === 'rarity') {
      payload.rarity = selectedValue;
      payload.grade = undefined;
    }
  }

  return errors;
};

// 1. Lấy danh sách toàn bộ sản phẩm
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
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

// 3. Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const payload = sanitizeProductPayload(req.body);
    const errors = await validateProductPayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const newProduct = new Product(payload);
    const saved = await newProduct.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 4. Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const payload = sanitizeProductPayload(req.body);
    const errors = await validateProductPayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 5. Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;