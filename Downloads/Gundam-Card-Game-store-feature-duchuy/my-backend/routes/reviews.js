const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');

const mapReviewToResponse = (review) => ({
  id: review._id.toString(),
  productId: review.product.toString(),
  userId: review.user?._id?.toString() || '',
  userName: review.user?.name || 'Ẩn danh',
  userEmail: review.user?.email || '',
  userAvatar: review.user?.avatar || null,
  rating: review.rating,
  content: review.content,
  createdAt: review.createdAt,
  adminReply: review.adminReply || '',
  adminReplyAt: review.adminReplyAt,
  adminReplyAuthor: review.adminReplyAuthor || '',
});

// GET /api/reviews/:productId — all reviews for a product
router.get('/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });

    const formatted = reviews.map(mapReviewToResponse);

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews/:productId — create a review
router.post('/:productId', async (req, res) => {
  try {
    const { userId, rating, content } = req.body;

    if (!userId || !rating || !content) {
      return res.status(400).json({ message: 'Thiếu thông tin đánh giá' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Số sao phải từ 1 đến 5' });
    }

    if (typeof content !== 'string' || content.trim().length === 0 || content.length > 2000) {
      return res.status(400).json({ message: 'Nội dung đánh giá không hợp lệ' });
    }

    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const existing = await Review.findOne({ product: req.params.productId, user: userId });
    if (existing) {
      return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }

    const review = new Review({
      product: req.params.productId,
      user: userId,
      rating: Number(rating),
      content: content.trim(),
    });

    const saved = await review.save();
    const populated = await saved.populate('user', 'name email avatar');

    res.status(201).json(mapReviewToResponse(populated));
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Bạn đã đánh giá sản phẩm này rồi' });
    }
    res.status(500).json({ message: err.message });
  }
});

const upsertReviewReply = async (req, res) => {
  try {
    const adminReply = typeof req.body.adminReply === 'string' ? req.body.adminReply.trim() : '';
    const adminReplyAuthor = typeof req.body.adminReplyAuthor === 'string' ? req.body.adminReplyAuthor.trim() : '';

    if (adminReply.length === 0) {
      return res.status(400).json({ message: 'Nội dung phản hồi không được để trống' });
    }

    if (adminReply.length > 2000) {
      return res.status(400).json({ message: 'Nội dung phản hồi không được vượt quá 2000 ký tự' });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      {
        adminReply,
        adminReplyAt: new Date(),
        adminReplyAuthor: adminReplyAuthor || 'Quản trị viên',
      },
      { new: true }
    ).populate('user', 'name email avatar');

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    return res.json(mapReviewToResponse(review));
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

router.put('/:reviewId/reply', upsertReviewReply);
router.post('/:reviewId/reply', upsertReviewReply);

// DELETE /api/reviews/:reviewId — admin delete a review
router.delete('/:reviewId', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    res.json({ message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
