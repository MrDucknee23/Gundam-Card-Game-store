const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Import Model của bạn

const isTruthyQuery = (value) => ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());
const SUMMARY_FIELDS = 'orderCode customer totalAmount subtotal shippingFee paymentStatus orderStatus paymentMethod items.productName items.quantity items.price createdAt';
const SUMMARY_CACHE_TTL_MS = 30_000;
const summaryCache = new Map();

const formatOrderStatus = (status) => {
  if (status === 'Đang xử lý') return 'processing';
  if (status === 'Đã giao hàng' || status === 'Đang giao' || status === 'Đang vận chuyển') return 'shipped';
  if (status === 'Đã gửi hàng' || status === 'Giao thành công') return 'delivered';
  if (status === 'Đã hủy') return 'cancelled';
  return 'processing';
};

const formatPaymentStatus = (status) => {
  if (status === 'Đã thanh toán') return 'paid';
  if (status === 'Chờ thanh toán' || status === 'Chưa thanh toán') return 'pending';
  return 'failed';
};

const mapOrderToFrontend = (order) => ({
  id: order._id.toString(),
  orderNumber: order.orderCode || `ORD-${order._id.toString().slice(-6)}`,
  customerName: order.customer?.name || 'Khách vãng lai',
  customerEmail: order.customer?.email || 'N/A',
  customerPhone: order.customer?.phone || 'N/A',
  orderDate: order.createdAt || new Date().toISOString(),
  total: order.totalAmount || 0,
  subtotal: order.subtotal || 0,
  shippingFee: order.shippingFee || 0,
  paymentStatus: formatPaymentStatus(order.paymentStatus),
  orderStatus: formatOrderStatus(order.orderStatus),
  paymentMethod: order.paymentMethod || 'cod',
  shippingAddress: {
    street: order.customer?.address || '',
    ward: '', district: '', city: ''
  },
  items: (order.items || []).map(item => ({
    productId: item._id?.toString(),
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    productImage: item.productImage || '',
    category: 'Sản phẩm'
  })),
  notes: order.history?.[0]?.note || ''
});

const getCacheKey = (filter, limit) => JSON.stringify({ filter, limit });

// 1. Lấy danh sách toàn bộ đơn hàng
router.get('/', async (req, res) => {
  try {
    const filter = {};

    // Nếu có truyền email hoặc số điện thoại, chỉ lấy đơn hàng của người đó
    if (req.query.email) {
      filter['customer.email'] = req.query.email;
    }
    if (req.query.phone) {
      filter['customer.phone'] = req.query.phone;
    }

    const summaryOnly = isTruthyQuery(req.query.summary);
    const rawLimit = Number.parseInt(String(req.query.limit || ''), 10);
    const safeLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : null;

    let query = Order.find(filter)
      .sort({ _id: -1 })
      .lean()
      .maxTimeMS(8000);

    if (summaryOnly) {
      query = query.select(SUMMARY_FIELDS);
    }

    if (safeLimit) {
      query = query.limit(safeLimit);
    }

    const cacheKey = getCacheKey(filter, safeLimit ?? 0);
    const cachedEntry = summaryOnly ? summaryCache.get(cacheKey) : null;

    if (summaryOnly && cachedEntry && Date.now() - cachedEntry.timestamp < SUMMARY_CACHE_TTL_MS) {
      res.set('X-Orders-Cache', 'HIT');
      return res.json(cachedEntry.data);
    }

    const fetchPromise = query.then((dbOrders) => {
      const formattedOrders = dbOrders.map(mapOrderToFrontend);

      if (summaryOnly) {
        summaryCache.set(cacheKey, {
          data: formattedOrders,
          timestamp: Date.now(),
        });
      }

      return formattedOrders;
    });

    if (summaryOnly) {
      const timedResult = await Promise.race([
        fetchPromise,
        new Promise((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);

      if (timedResult) {
        res.set('X-Orders-Cache', 'MISS');
        return res.json(timedResult);
      }

      res.set('X-Orders-Stale', '1');
      return res.json(cachedEntry?.data || []);
    }

    const formattedOrders = await fetchPromise;
    res.json(formattedOrders);
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
    const order = await Order.findById(req.params.id).lean().maxTimeMS(8000);
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