const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authenticateJWT = require('../middleware/authenticateJWT');

// Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Chỉ admin mới được phép thực hiện!' });
}

// 1. Lấy danh sách đơn hàng
//    - Admin: lấy tất cả (hoặc filter theo ?email=)
//    - Customer: chỉ lấy đơn của chính mình theo email trong token
router.get('/', authenticateJWT, async (req, res) => {
  try {
    let filter = {};
    const isAdmin = req.user.role === 'admin';

    if (isAdmin) {
      if (req.query.email) {
        filter['customer.email'] = req.query.email;
      }
    } else {
      // Customer chỉ thấy đơn của chính mình
      filter['customer.email'] = req.user.email;
    }

    const dbOrders = await Order.find(filter).sort({ _id: -1 }); // Sắp xếp theo _id để đơn mới nhất luôn ở trên cùng
    
    // Format lại dữ liệu từ DB (Tiếng Việt) sang Interface của React (Tiếng Anh)
    const formattedOrders = dbOrders.map(order => {
      const mapOrderStatus = (status) => {
        if (status === 'Đang xử lý') return 'processing';
        if (status === 'Đã giao hàng' || status === 'Đang giao' || status === 'Đang vận chuyển') return 'shipped';
        if (status === 'Đã gửi hàng' || status === 'Giao thành công') return 'delivered';
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

// 1.1 Lấy chi tiết một đơn hàng theo ID (admin)
router.get('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const mapOrderStatus = (status) => {
      if (status === 'Đang xử lý') return 'processing';
      if (status === 'Đã giao hàng' || status === 'Đang giao' || status === 'Đang vận chuyển') return 'shipped';
      if (status === 'Đã gửi hàng' || status === 'Giao thành công') return 'delivered';
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

// 1.2 Tạo đơn hàng mới (khách hàng hoặc admin đều có thể tạo, không cần JWT)
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

// 2. Cập nhật trạng thái đơn hàng (admin)
router.put('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Map ngược lại từ Tiếng Anh sang Tiếng Việt để lưu vào DB nếu có cập nhật trạng thái
    if (updateData.orderStatus) {
      const mapToVi = {
        'processing': 'Đang xử lý',
        'shipped': 'Đang vận chuyển',
        'delivered': 'Giao thành công',
        'cancelled': 'Đã hủy'
      };
      updateData.orderStatus = mapToVi[updateData.orderStatus] || updateData.orderStatus;
    }

    // Xử lý cập nhật ghi chú nội bộ của Admin
    if (updateData.notes !== undefined) {
      const order = await Order.findById(req.params.id);
      if (order && order.history) {
        if (order.history.length > 0) {
          order.history[0].note = updateData.notes;
        } else {
          order.history.push({ note: updateData.notes });
        }
        await order.save();
      }
      delete updateData.notes; // Xóa khỏi updateData để không lỗi schema
    }

    if (Object.keys(updateData).length > 0) {
      await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updateData },
        { new: true }
      );
    }
    
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 3. Xóa đơn hàng (admin)
router.delete('/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;