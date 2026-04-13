const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Import Model của bạn

// 1. Lấy danh sách toàn bộ đơn hàng
router.get('/', async (req, res) => {
  try {
    const dbOrders = await Order.find().sort({ _id: -1 }); // Sắp xếp theo _id để đơn mới nhất luôn ở trên cùng
    
    // Format lại dữ liệu từ DB (Tiếng Việt) sang Interface của React (Tiếng Anh)
    const formattedOrders = dbOrders.map(order => {
      const mapOrderStatus = (status) => {
        if (status === 'Đang xử lý') return 'processing';
        if (status === 'Đã giao hàng' || status === 'Đang giao') return 'shipped';
        if (status === 'Đã gửi hàng') return 'delivered';
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
        paymentMethod: order.paymentMethod || 'cod',
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

// 1.1 Lấy chi tiết một đơn hàng theo ID (Dùng cho trang Order Detail)
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const mapOrderStatus = (status) => {
      if (status === 'Đang xử lý') return 'processing';
      if (status === 'Đã giao hàng' || status === 'Đang giao') return 'shipped';
      if (status === 'Đã gửi hàng') return 'delivered';
      if (status === 'Đã hủy') return 'cancelled';
      return 'processing';
    };
    const mapPaymentStatus = (status) => {
      if (status === 'Đã thanh toán') return 'paid';
      if (status === 'Chờ thanh toán' || status === 'Chưa thanh toán') return 'pending';
      return 'failed';
    };

    const formattedOrder = {
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
      paymentMethod: order.paymentMethod || 'cod',
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
    res.json(formattedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 1.2 Tạo đơn hàng mới (Dành cho trang Thanh toán / Checkout)
router.post('/', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    if (!newOrder.orderCode) {
      newOrder.orderCode = `ORD-${Date.now().toString().slice(-6).toUpperCase()}`;
    }
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 2. Cập nhật trạng thái đơn hàng
router.put('/:id', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Map ngược lại từ Tiếng Anh sang Tiếng Việt để lưu vào DB
    const mapToVi = {
      'processing': 'Đang xử lý',
      'shipped': 'Đã giao hàng',
      'delivered': 'Đã gửi hàng',
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