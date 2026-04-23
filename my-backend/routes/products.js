const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const { deleteUploadFile, isBase64Image, normalizeUploadPublicPath } = require('../utils/imageStorage');
const {
  isDbReady,
  isDbUnavailableError,
  logDbDegraded,
  sendDegradedJson,
  sendServiceUnavailable,
} = require('../utils/dbState');

const logProductRouteError = (scope, err, extra = {}) => {
  console.error(`[products:${scope}]`, {
    message: err?.message || err,
    ...extra,
  });
};

const sanitizeProductPayload = (body) => ({
  name: typeof body.name === 'string' ? body.name.trim() : '',
  description: typeof body.description === 'string' ? body.description.trim() : '',
  price: Number(body.price),
  stock: Number(body.stock),
  category: body.category,
  images: Array.isArray(body.images)
    ? body.images
      .filter((image) => typeof image === 'string' && image.trim() !== '')
      .map((image) => image.trim())
    : [],
  scale: typeof body.scale === 'string' ? body.scale.trim() : undefined,
  grade: typeof body.grade === 'string' ? body.grade.trim() : undefined,
  material: typeof body.material === 'string' ? body.material.trim() : undefined,
  rarity: typeof body.rarity === 'string' ? body.rarity.trim() : undefined,
  cardType: typeof body.cardType === 'string' ? body.cardType.trim() : undefined,
  subCategoryKey: typeof body.subCategoryKey === 'string' ? body.subCategoryKey.trim() : undefined,
  subCategoryValue: typeof body.subCategoryValue === 'string' ? body.subCategoryValue.trim() : undefined,
  featured: Boolean(body.featured),
});

const PRODUCT_LIST_PROJECTION = {
  name: 1,
  description: 1,
  price: 1,
  stock: 1,
  category: 1,
  images: { $slice: ['$images', 1] },
  scale: 1,
  grade: 1,
  material: 1,
  rarity: 1,
  cardType: 1,
  subCategoryKey: 1,
  subCategoryValue: 1,
  featured: 1,
  createdAt: 1,
  updatedAt: 1,
};

const mapProductListItem = (product) => ({
  ...product,
  id: product._id.toString(),
});

const normalizeProductImages = (images) => Array.from(
  new Set(
    (Array.isArray(images) ? images : [])
      .map((image) => normalizeUploadPublicPath(image))
      .filter((image) => image !== '')
  )
);

const cleanupUnusedUploads = async (currentProductId, removedImages) => {
  for (const imagePath of removedImages) {
    const remainingUsageCount = await Product.countDocuments({
      _id: { $ne: currentProductId },
      images: imagePath,
    });

    if (remainingUsageCount === 0) {
      await deleteUploadFile(imagePath);
    }
  }
};

const validateProductPayload = async (payload) => {
  const errors = [];
  let categoryDoc = null;

  if (!payload.name) {
    errors.push('Ten san pham la bat buoc');
  }

  if (typeof payload.category !== 'string' || payload.category.trim() === '') {
    errors.push('Danh muc san pham khong hop le');
  } else {
    try {
      categoryDoc = await Category.findOne({ slug: payload.category.trim() });
    } catch (err) {
      err.statusCode = 500;
      err.publicMessage = 'Khong the kiem tra danh muc san pham luc nay';
      throw err;
    }

    if (!categoryDoc) {
      errors.push('Danh muc san pham khong hop le');
    }
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

  if (Array.isArray(payload.images) && payload.images.some((image) => isBase64Image(image))) {
    errors.push('Hinh anh base64 khong con duoc ho tro. Vui long tai anh len qua /api/upload');
  }

  if (Array.isArray(payload.images) && payload.images.some((image) => normalizeUploadPublicPath(image) === '')) {
    errors.push('Duong dan hinh anh khong hop le. Vui long tai anh len lai');
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

const emptyCategoryDistribution = {
  totalProducts: 0,
  categories: {
    gundam: 0,
    pokemon: 0,
    onepiece: 0,
  },
  gundamGrades: {
    HG: 0,
    MG: 0,
    RG: 0,
    PG: 0,
  },
};

router.get('/stats/category-distribution', async (req, res) => {
  if (!isDbReady()) {
    logDbDegraded('products:stats:category-distribution');
    return sendDegradedJson(res, emptyCategoryDistribution, { source: 'products-category-distribution-empty' });
  }

  try {
    const [categoryCounts, gundamGradeCounts] = await Promise.all([
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
      Product.aggregate([
        { $match: { category: 'gundam' } },
        {
          $project: {
            normalizedGrade: {
              $toUpper: {
                $trim: {
                  input: {
                    $ifNull: [
                      '$grade',
                      {
                        $cond: [
                          { $eq: ['$subCategoryKey', 'grade'] },
                          '$subCategoryValue',
                          '',
                        ],
                      },
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $group: {
            _id: '$normalizedGrade',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const categorySummary = { ...emptyCategoryDistribution.categories };
    categoryCounts.forEach((entry) => {
      if (entry?._id && Object.prototype.hasOwnProperty.call(categorySummary, entry._id)) {
        categorySummary[entry._id] = entry.count;
      }
    });

    const gundamGradeSummary = { ...emptyCategoryDistribution.gundamGrades };
    gundamGradeCounts.forEach((entry) => {
      if (entry?._id && Object.prototype.hasOwnProperty.call(gundamGradeSummary, entry._id)) {
        gundamGradeSummary[entry._id] = entry.count;
      }
    });

    return res.json({
      totalProducts: Object.values(categorySummary).reduce((sum, count) => sum + count, 0),
      categories: categorySummary,
      gundamGrades: gundamGradeSummary,
    });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      logDbDegraded('products:stats:category-distribution', err);
      return sendDegradedJson(res, emptyCategoryDistribution, { source: 'products-category-distribution-empty' });
    }

    logProductRouteError('stats:category-distribution', err);
    return res.status(500).json({ message: 'Khong the tai thong ke danh muc san pham luc nay' });
  }
});

// 1. Lấy danh sách toàn bộ sản phẩm
router.get('/', async (req, res) => {
  if (!isDbReady()) {
    logDbDegraded('products:list');
    return sendDegradedJson(res, [], { source: 'products-empty' });
  }

  try {
    const products = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      { $project: PRODUCT_LIST_PROJECTION },
    ]);
    const formatted = products.map(mapProductListItem);
    res.json(formatted);
  } catch (err) {
    if (isDbUnavailableError(err)) {
      logDbDegraded('products:list', err);
      return sendDegradedJson(res, [], { source: 'products-empty' });
    }

    res.status(500).json({ message: err.message });
  }
});

// 2. Lấy chi tiết 1 sản phẩm
router.get('/:id', async (req, res) => {
  if (!isDbReady()) {
    logDbDegraded('products:detail', null, { productId: req.params.id });
    return sendServiceUnavailable(res, 'Du lieu san pham tam thoi khong san sang', { source: 'products-detail-unavailable' });
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ ...product.toObject(), id: product._id.toString() });
  } catch (err) {
    if (isDbUnavailableError(err)) {
      logDbDegraded('products:detail', err, { productId: req.params.id });
      return sendServiceUnavailable(res, 'Du lieu san pham tam thoi khong san sang', { source: 'products-detail-unavailable' });
    }

    res.status(500).json({ message: err.message });
  }
});

// 3. Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const payload = sanitizeProductPayload(req.body);
    payload.images = normalizeProductImages(payload.images);
    const errors = await validateProductPayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const newProduct = new Product(payload);
    const saved = await newProduct.save();
    res.status(201).json({ ...saved.toObject(), id: saved._id.toString() });
  } catch (err) {
    const statusCode = err?.statusCode === 500 ? 500 : 400;

    if (statusCode === 500) {
      logProductRouteError('create', err);
    }

    res.status(statusCode).json({ message: err?.publicMessage || err.message });
  }
});

// 4. Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const payload = sanitizeProductPayload(req.body);
    payload.images = normalizeProductImages(payload.images);
    const errors = await validateProductPayload(payload);

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0], errors });
    }

    const existingProduct = await Product.findById(req.params.id).lean();
    if (!existingProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    const updated = await Product.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    const removedImages = normalizeProductImages(existingProduct.images).filter((imagePath) => !payload.images.includes(imagePath));
    await cleanupUnusedUploads(updated._id, removedImages);
    res.json({ ...updated.toObject(), id: updated._id.toString() });
  } catch (err) {
    if (err?.statusCode === 500) {
      logProductRouteError('update', err, { productId: req.params.id });
      return res.status(500).json({ message: err.publicMessage || 'Khong the cap nhat san pham luc nay' });
    }

    if (err?.name === 'CastError') {
      return res.status(400).json({ message: 'Id san pham khong hop le' });
    }

    if (err?.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }

    logProductRouteError('update', err, { productId: req.params.id });
    return res.status(500).json({ message: 'Khong the cap nhat san pham luc nay' });
  }
});

// 5. Xóa sản phẩm
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    await cleanupUnusedUploads(deleted._id, normalizeProductImages(deleted.images));
    res.json({ message: 'Đã xóa thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;