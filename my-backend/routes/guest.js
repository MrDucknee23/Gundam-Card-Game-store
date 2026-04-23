/**
 * Routes GUEST.
 * - POST /send-otp  → gửi OTP qua email (rate limited)
 * - POST /verify-otp → xác thực OTP, trả guest access token + danh sách orders
 * - GET  /orders    → lấy danh sách đơn guest (yêu cầu guest access token)
 * - GET  /orders/:id → lấy chi tiết đơn guest (yêu cầu guest access token)
 *
 * KHÔNG có route nào nhận userId. KHÔNG dùng chung controller với user.
 */
const express = require('express');
const { sendOtp, verifyOtp } = require('../controllers/guestAuthController');
const { listOrders, getOrderDetail } = require('../controllers/guestOrderController');
const guestOtpRateLimit = require('../middleware/guestOtpRateLimit');

const router = express.Router();

router.post('/send-otp', guestOtpRateLimit, sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/orders', listOrders);
router.get('/orders/:id', getOrderDetail);

module.exports = router;