const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Import Model của bạn

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value || ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

const formatOrder = (order) => ({
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
    ward: '', district: '', city: '',
  },
  items: order.items.map((item) => ({
    productId: item._id?.toString(),
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    productImage: item.productImage,
    category: 'Sản phẩm',
  })),
  notes: order.history?.[0]?.note || '',
});

// 1. Lấy danh sách toàn bộ đơn hàng
router.get('/', async (req, res) => {
  try {
    const pageParam = req.query.page;
    const limitParam = req.query.limit;
    const shouldPaginate = pageParam !== undefined || limitParam !== undefined;
    const page = parsePositiveInt(pageParam, 1);
    const limit = Math.min(parsePositiveInt(limitParam, 10), 50);

    let filter = {};

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const paymentStatus = typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus.trim() : '';
    const orderStatus = typeof req.query.orderStatus === 'string' ? req.query.orderStatus.trim() : '';

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [
        { orderCode: searchRegex },
        { 'customer.name': searchRegex },
        { 'customer.email': searchRegex },
        { 'customer.phone': searchRegex },
        { 'items.productName': searchRegex },
      ];
    }

    if (paymentStatus && paymentStatus !== 'all') {
      if (paymentStatus === 'paid') {
        filter.paymentStatus = { $in: ['Đã thanh toán'] };
      } else if (paymentStatus === 'pending') {
        filter.paymentStatus = { $in: ['Chờ thanh toán', 'Chưa thanh toán'] };
      } else if (paymentStatus === 'failed') {
        filter.paymentStatus = { $nin: ['Đã thanh toán', 'Chờ thanh toán', 'Chưa thanh toán'] };
      }
    }

    if (orderStatus && orderStatus !== 'all') {
      if (orderStatus === 'processing') {
        filter.orderStatus = { $in: ['Đang xử lý'] };
      } else if (orderStatus === 'shipped') {
        filter.orderStatus = { $in: ['Đã giao hàng', 'Đang giao', 'Đang vận chuyển'] };
      } else if (orderStatus === 'delivered') {
        filter.orderStatus = { $in: ['Đã gửi hàng', 'Giao thành công'] };
      } else if (orderStatus === 'cancelled') {
        filter.orderStatus = { $in: ['Đã hủy'] };
      }
    }

    // Nếu có truyền email hoặc số điện thoại, chỉ lấy đơn hàng của người đó
    if (req.query.email) {
      filter['customer.email'] = req.query.email;
    }
    if (req.query.phone) {
      filter['customer.phone'] = req.query.phone;
    }

    const baseQuery = Order.find(filter).sort({ _id: -1 });
    let dbOrders;
    let total = 0;

    if (shouldPaginate) {
      total = await Order.countDocuments(filter);
      dbOrders = await baseQuery.skip((page - 1) * limit).limit(limit);
    } else {
      dbOrders = await baseQuery;
    }

    const formattedOrders = dbOrders.map(formatOrder);

    if (!shouldPaginate) {
      return res.json(formattedOrders);
    }

    return res.json({
      items: formattedOrders,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 1.1 Lấy chi tiết một đơn hàng theo ID (Dùng cho trang Order Detail)

// 5. Thống kê chi tiêu của từng khách hàng (phải đặt trước /:id)
router.get('/stats/customer', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Thiếu email' });

    const paidOrders = await Order.find({
      'customer.email': email,
      paymentStatus: 'Đã thanh toán'
    });

    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const orderCount = paidOrders.length;

    res.json({ email, totalSpent, orderCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Thống kê doanh thu (theo tháng & năm) (phải đặt trước /:id)
router.get('/stats/revenue', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear + 1, 0, 1);

    const paidOrders = await Order.find({
      paymentStatus: 'Đã thanh toán',
      createdAt: { $gte: startOfYear, $lt: endOfYear }
    });

    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      revenue: 0,
      orderCount: 0
    }));

    paidOrders.forEach(order => {
      const month = new Date(order.createdAt).getMonth();
      monthlyRevenue[month].revenue += order.totalAmount || 0;
      monthlyRevenue[month].orderCount += 1;
    });

    const yearlyRevenue = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const yearlyOrderCount = paidOrders.length;

    res.json({ year: targetYear, yearlyRevenue, yearlyOrderCount, monthlyRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 7. Top khách hàng (phải đặt trước /:id)
router.get('/stats/top-customers', async (req, res) => {
  try {
    const pipeline = [
      { $match: { paymentStatus: 'Đã thanh toán' } },
      { $group: { _id: '$customer.email', name: { $first: '$customer.name' }, phone: { $first: '$customer.phone' }, totalSpent: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 }
    ];
    const result = await Order.aggregate(pipeline);
    res.json(result.map(r => ({ email: r._id, name: r.name, phone: r.phone, totalSpent: r.totalSpent, orderCount: r.orderCount })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const requestedEmail = typeof req.query.email === 'string' ? req.query.email.trim() : '';
    const requestedPhone = typeof req.query.phone === 'string' ? req.query.phone.trim() : '';

    if (requestedEmail && order.customer?.email !== requestedEmail) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
    }

    if (requestedPhone && order.customer?.phone !== requestedPhone) {
      return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này' });
    }

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

    // Đồng bộ trạng thái thanh toán về cùng một chuẩn tiếng Việt trong DB.
    if (updateData.paymentStatus) {
      const mapPaymentToVi = {
        paid: 'Đã thanh toán',
        pending: 'Chưa thanh toán',
        failed: 'Thanh toán thất bại',
      };
      updateData.paymentStatus = mapPaymentToVi[updateData.paymentStatus] || updateData.paymentStatus;
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

// 3. Xóa đơn hàng
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 4. Xác nhận đã thanh toán (Admin)
router.post('/:id/confirm-payment', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    order.paymentStatus = 'Đã thanh toán';
    order.paidAt = new Date();
    await order.save();

    // Tính tổng chi tiêu của khách hàng (chỉ đơn đã thanh toán)
    let customerTotalSpent = 0;
    if (order.customer?.email) {
      const paidOrders = await Order.find({
        'customer.email': order.customer.email,
        paymentStatus: 'Đã thanh toán'
      });
      customerTotalSpent = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    }

    res.json({ message: 'Xác nhận thanh toán thành công', customerTotalSpent });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;