const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// --- CHỨC NĂNG DANH SÁCH ĐƠN HÀNG (Tìm kiếm, Lọc, Phân trang) ---
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, paymentStatus } = req.query;
    let query = {};

    // Tìm kiếm theo Mã đơn, Tên khách hoặc Email
    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } }
      ];
    }
    // Lọc theo trạng thái
    if (status && status !== 'all') query.orderStatus = status;
    if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;

    const orders = await Order.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Order.countDocuments(query);
    res.json({ orders, totalPages: Math.ceil(count / limit), currentPage: Number(page) });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng" });
  }
});

// --- CHỨC NĂNG CHI TIẾT ĐƠN HÀNG (Dùng cho xem chi tiết & In hóa đơn) ---
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "ID không hợp lệ" });
  }
});

// --- CHỨC NĂNG VẬN HÀNH: Cập nhật trạng thái, Ghi chú nội bộ, Hoàn tiền ---
router.patch('/:id', async (req, res) => {
  try {
    const { orderStatus, internalNotes, paymentStatus, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // 1. Cập nhật trạng thái & Lưu history cho Timeline
    if (orderStatus && orderStatus !== order.orderStatus) {
      order.orderStatus = orderStatus;
      order.history.push({ 
        status: orderStatus, 
        note: note || `Trạng thái đơn hàng chuyển sang: ${orderStatus}` 
      });
    }

    // 2. Lưu ghi chú nội bộ (Ghi đè hoặc nối thêm tùy bạn)
    if (internalNotes !== undefined) order.internalNotes = internalNotes;

    // 3. Xử lý trạng thái thanh toán (Hoàn tiền)
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.json({ message: "Cập nhật đơn hàng thành công", order });
  } catch (err) {
    res.status(400).json({ message: "Lỗi khi cập nhật" });
  }
});

// --- CHỨC NĂNG XÓA/HỦY ---
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa đơn hàng vĩnh viễn' });
  } catch (err) {
    res.status(500).json({ message: "Lỗi khi xóa" });
  }
});

module.exports = router;