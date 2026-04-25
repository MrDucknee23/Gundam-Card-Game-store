const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');
<<<<<<< HEAD
=======
const {
  DEFAULT_CATEGORY_SEED,
  getDefaultCategoriesFallback,
  isDbReady,
  isDbUnavailableError,
  logDbDegraded,
  sendDegradedJson,
} = require('../utils/dbState');
>>>>>>> main

const normalizeSlug = (value = '') => value.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');

const normalizeAttributeKey = (value = '') => {
  const cleaned = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (cleaned.includes('grade') || cleaned.includes('cap-do')) return 'grade';
  if (cleaned.includes('rarity') || cleaned.includes('do-hiem')) return 'rarity';
  return cleaned || 'custom';
};

const normalizeAttributeOptions = (options = []) => {
  const seen = new Set();

  return options
    .map((option, index) => {
      const rawLabel = typeof option === 'string'
        ? option
        : option?.label || option?.value || '';

      const label = String(rawLabel).trim();
      if (!label) return null;

      const dedupeKey = label.toLowerCase();
      if (seen.has(dedupeKey)) return null;
      seen.add(dedupeKey);

      return {
        value: label,
        label,
        sortOrder: Number(option?.sortOrder ?? index) || index,
        isActive: option?.isActive !== false,
      };
    })
    .filter(Boolean);
};

// Seed danh mục mặc định nếu DB trống
const seedDefaults = async () => {
  const count = await Category.countDocuments();
  if (count === 0) {
<<<<<<< HEAD
    await Category.insertMany([
      { name: 'gundam', slug: 'gundam', label: 'Gundam', description: 'Mô hình Gundam các loại' },
      { name: 'pokemon', slug: 'pokemon', label: 'Pokémon', description: 'Thẻ bài Pokémon TCG' },
      { name: 'onepiece', slug: 'onepiece', label: 'One Piece', description: 'Thẻ bài One Piece Card Game' },
    ]);
=======
    await Category.insertMany(DEFAULT_CATEGORY_SEED.map((category) => ({
      ...category,
      description:
        category.slug === 'gundam'
          ? 'Mô hình Gundam các loại'
          : category.slug === 'pokemon'
            ? 'Thẻ bài Pokémon TCG'
            : 'Thẻ bài One Piece Card Game',
    })));
>>>>>>> main
    console.log('✅ Đã seed 3 danh mục mặc định');
  }
};

const runSeedWhenDbReady = () => {
  if (mongoose.connection.readyState === 1) {
    seedDefaults().catch(err => console.error('Seed categories error:', err));
    return;
  }

  mongoose.connection.once('connected', () => {
    seedDefaults().catch(err => console.error('Seed categories error:', err));
  });
};

runSeedWhenDbReady();

// 1. Lấy tất cả danh mục
router.get('/', async (req, res) => {
<<<<<<< HEAD
=======
  if (!isDbReady()) {
    logDbDegraded('categories:list');
    return sendDegradedJson(res, getDefaultCategoriesFallback(), { source: 'default-categories' });
  }

>>>>>>> main
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    const formatted = categories.map(c => ({
      ...c.toObject(),
      id: c._id.toString(),
    }));
    res.json(formatted);
  } catch (err) {
<<<<<<< HEAD
=======
    if (isDbUnavailableError(err)) {
      logDbDegraded('categories:list', err);
      return sendDegradedJson(res, getDefaultCategoriesFallback(), { source: 'default-categories' });
    }

>>>>>>> main
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

    const slugClean = normalizeSlug(slug);
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

const saveAttributeGroup = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    const label = typeof req.body.label === 'string' ? req.body.label.trim() : '';
    const keySource = typeof req.body.key === 'string' ? req.body.key : label;
    const key = normalizeAttributeKey(keySource);
    const options = normalizeAttributeOptions(Array.isArray(req.body.options) ? req.body.options : []);

    if (!label) {
      return res.status(400).json({ message: 'Tên nhóm con là bắt buộc' });
    }

    if (options.length === 0) {
      return res.status(400).json({ message: 'Cần ít nhất một giá trị con' });
    }

    category.attributeGroup = {
      key,
      label,
      options,
      isActive: req.body.isActive !== false,
    };

    await category.save();
    res.json({ ...category.toObject(), id: category._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteAttributeGroup = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    category.attributeGroup = undefined;
    await category.save();

    res.json({ ...category.toObject(), id: category._id.toString() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Lưu / xóa nhóm thuộc tính con cho danh mục
router.put('/attribute-group/:id', saveAttributeGroup);
router.delete('/attribute-group/:id', deleteAttributeGroup);
router.put('/:id/attribute-group', saveAttributeGroup);
router.delete('/:id/attribute-group', deleteAttributeGroup);

// 5. Sửa danh mục
router.put('/:id', async (req, res) => {
  try {
    const { name, slug, label, description, attributeGroup } = req.body;

    const oldCategory = await Category.findById(req.params.id);
    if (!oldCategory) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    const isAttributeOnlyUpdate = Object.prototype.hasOwnProperty.call(req.body, 'attributeGroup')
      && !name && !slug && !label;

    if (isAttributeOnlyUpdate) {
      if (!attributeGroup) {
        oldCategory.attributeGroup = undefined;
      } else {
        const attributeLabel = typeof attributeGroup.label === 'string' ? attributeGroup.label.trim() : '';
        const keySource = typeof attributeGroup.key === 'string' ? attributeGroup.key : attributeLabel;
        const key = normalizeAttributeKey(keySource);
        const options = normalizeAttributeOptions(Array.isArray(attributeGroup.options) ? attributeGroup.options : []);

        if (!attributeLabel) {
          return res.status(400).json({ message: 'Tên nhóm con là bắt buộc' });
        }

        if (options.length === 0) {
          return res.status(400).json({ message: 'Cần ít nhất một giá trị con' });
        }

        oldCategory.attributeGroup = {
          key,
          label: attributeLabel,
          options,
          isActive: attributeGroup.isActive !== false,
        };
      }

      await oldCategory.save();
      return res.json({ ...oldCategory.toObject(), id: oldCategory._id.toString() });
    }

    if (!name || !slug || !label) {
      return res.status(400).json({ message: 'Tên, slug và label là bắt buộc' });
    }

    const slugClean = normalizeSlug(slug);
    if (!slugClean) {
      return res.status(400).json({ message: 'Slug không hợp lệ' });
    }

    let normalizedAttributeGroup = oldCategory.attributeGroup;
    if (Object.prototype.hasOwnProperty.call(req.body, 'attributeGroup')) {
      if (!attributeGroup) {
        normalizedAttributeGroup = undefined;
      } else {
        const attributeLabel = typeof attributeGroup.label === 'string' ? attributeGroup.label.trim() : '';
        const keySource = typeof attributeGroup.key === 'string' ? attributeGroup.key : attributeLabel;
        const key = normalizeAttributeKey(keySource);
        const options = normalizeAttributeOptions(Array.isArray(attributeGroup.options) ? attributeGroup.options : []);

        if (!attributeLabel) {
          return res.status(400).json({ message: 'Tên nhóm con là bắt buộc' });
        }

        if (options.length === 0) {
          return res.status(400).json({ message: 'Cần ít nhất một giá trị con' });
        }

        normalizedAttributeGroup = {
          key,
          label: attributeLabel,
          options,
          isActive: attributeGroup.isActive !== false,
        };
      }
    }

    const existing = await Category.findOne({
      $or: [{ name: name.trim() }, { slug: slugClean }],
      _id: { $ne: req.params.id },
    });
    if (existing) {
      return res.status(409).json({ message: 'Danh mục đã tồn tại' });
    }

    if (oldCategory.slug !== slugClean) {
      await Product.updateMany(
        { category: oldCategory.slug },
        { $set: { category: slugClean } }
      );
    }

    const updatedPayload = {
      name: name.trim(),
      slug: slugClean,
      label: label.trim(),
      description: (description || '').trim(),
      attributeGroup: normalizedAttributeGroup,
    };

    const updated = await Category.findByIdAndUpdate(req.params.id, updatedPayload, { new: true });

    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 6. Xóa danh mục
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

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
