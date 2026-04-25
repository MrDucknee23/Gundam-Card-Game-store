/**
 * Routes cho USER đã đăng nhập.
 * TẤT CẢ routes trong file này đều yêu cầu JWT hợp lệ.
 * KHÔNG có route nào nhận userId/email từ client.
 */
const express = require('express');
const authJwt = require('../middleware/authJwt');
const { listOrders, getOrderDetail } = require('../controllers/userOrderController');

const router = express.Router();

// authJwt buộc phải có, không được bỏ
router.get('/orders', authJwt, listOrders);
router.get('/orders/:id', authJwt, getOrderDetail);

module.exports = router;
