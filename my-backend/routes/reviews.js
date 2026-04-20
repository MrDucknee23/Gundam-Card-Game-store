const express = require('express');
const router  = express.Router({ mergeParams: true }); // productId from parent
const Review  = require('../models/Review');
const Product = require('../models/Product');

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

// ── GET /api/products/:productId/reviews ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const shouldPaginate = pageParam !== undefined || limitParam !== undefined;
    const page = parsePositiveInt(pageParam, 1);
    const limit = Math.min(parsePositiveInt(limitParam, 5), 50);

    const filter = { productId: req.params.productId };
    const baseQuery = Review.find(filter).sort({ createdAt: -1 });
    let reviews;
    let total = 0;

    if (shouldPaginate) {
      total = await Review.countDocuments(filter);
      reviews = await baseQuery.skip((page - 1) * limit).limit(limit);
    } else {
      reviews = await baseQuery;
    }

    if (!shouldPaginate) {
      return res.json(reviews);
    }

    return res.json({
      items: reviews,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/products/:productId/reviews/unread-count ─────────────────────────
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Review.countDocuments({
      productId:   req.params.productId,
      readByAdmin: false,
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/products/:productId/reviews ─────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { userId, userName, userAvatar, stars, content } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ message: 'userId và userName là bắt buộc' });
    }
    if (!Number.isInteger(Number(stars)) || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'stars phải từ 1–5' });
    }
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Nội dung không được trống' });
    }

    const productExists = await Product.findById(req.params.productId).select('_id');
    if (!productExists) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const review = await Review.create({
      productId:  req.params.productId,
      userId,
      userName,
      userAvatar: userAvatar || '',
      stars:      Number(stars),
      content:    String(content).trim(),
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/products/:productId/reviews/mark-read ─────────────────────────
// Admin marks all reviews of a product as read
router.patch('/mark-read', async (req, res) => {
  try {
    await Review.updateMany(
      { productId: req.params.productId, readByAdmin: false },
      { $set: { readByAdmin: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/products/:productId/reviews/:reviewId/reply ─────────────────────
router.post('/:reviewId/reply', async (req, res) => {
  try {
    const { userId, userName, userAvatar, role, content } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({ message: 'userId và userName là bắt buộc' });
    }
    if (!content || !String(content).trim()) {
      return res.status(400).json({ message: 'Nội dung trả lời không được trống' });
    }

    const review = await Review.findOne({
      _id:       req.params.reviewId,
      productId: req.params.productId,
    });

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    review.replies.push({
      userId,
      userName,
      userAvatar: userAvatar || '',
      role:       role || 'customer',
      content:    String(content).trim(),
    });

    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/products/:productId/reviews/:reviewId ───────────────────────
// Customer can delete only their own review; admin/super_admin can delete any.
router.delete('/:reviewId', async (req, res) => {
  try {
    const { requesterId, requesterRole } = req.body;

    if (!requesterId) {
      return res.status(400).json({ message: 'requesterId là bắt buộc' });
    }

    const review = await Review.findOne({
      _id: req.params.reviewId,
      productId: req.params.productId,
    });

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    const normalizedRole = String(requesterRole || '').toLowerCase();
    const isAdmin = normalizedRole === 'admin' || normalizedRole === 'super_admin';
    const isOwner = String(review.userId) === String(requesterId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
    }

    await review.deleteOne();
    res.json({ ok: true, reviewId: req.params.reviewId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
