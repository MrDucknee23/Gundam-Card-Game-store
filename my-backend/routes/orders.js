const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Import Model của bạn

// 1. Lấy danh sách toàn bộ đơn hàng
router.get('/', async (req, res) => {
  try {
    const dbOrders = await Order.find().sort({ createdAt: -1 });
    
    // Format lại dữ liệu từ DB (Tiếng Việt) sang Interface của React (Tiếng Anh)
    const formattedOrders = dbOrders.map(order => {
      const mapOrderStatus = (status) => {
        if (status === 'Đang xử lý') return 'processing';
        if (status === 'Đã gửi hàng' || status === 'Đang giao') return 'shipped';
        if (status === 'Đã giao hàng') return 'delivered';
        if (status === 'Đã hủy') return 'cancelled';
        return 'processing';
      };
      
      const mapPaymentStatus = (status) => {
        if (status === 'Đã thanh toán') return 'paid';
        if (status === 'Chờ thanh toán' || status === 'Chưa thanh toán') return 'pending';
        return 'failed';
      };

      return {
        id: order._id.toString(),
        orderNumber: order.orderCode || `ORD-${order._id.toString().slice(-6)}`,
        customerName: order.customer?.name || 'Khách vãng lai',
        customerEmail: order.customer?.email || 'N/A',
        customerPhone: order.customer?.phone || 'N/A',
        orderDate: order.createdAt || new Date().toISOString(),
        total: order.totalAmount || 0,
        subtotal: order.subtotal || 0,
        shippingFee: order.shippingFee || 0,
        paymentStatus: mapPaymentStatus(order.paymentStatus),
        orderStatus: mapOrderStatus(order.orderStatus),
        paymentMethod: 'cod', // Giả định
        shippingAddress: {
          street: order.customer?.address || '',
          ward: '', district: '', city: ''
        },
        items: order.items.map(item => ({
          productId: item._id?.toString(),
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          productImage: item.productImage,
          category: 'Sản phẩm'
        })),
        notes: order.history?.[0]?.note || ''
      };
    });
    
    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. Cập nhật trạng thái đơn hàng
router.put('/:id', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Map ngược lại từ Tiếng Anh sang Tiếng Việt để lưu vào DB
    const mapToVi = {
      'processing': 'Đang xử lý',
      'shipped': 'Đã gửi hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: mapToVi[orderStatus] || orderStatus },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Xóa đơn hàng
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;