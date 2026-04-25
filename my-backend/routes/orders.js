const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Order = require('../models/Order'); // Import Model của bạn
const Product = require('../models/Product');
const User = require('../models/User');
const { verifyGuestAccessToken } = require('../services/guestOtpService');
const {
  isDbReady,
  isDbUnavailableError,
  logDbDegraded,
  sendDegradedJson,
} = require('../utils/dbState');

const isTruthyQuery = (value) => ['1', 'true', 'yes'].includes(String(value || '').toLowerCase());
const SUMMARY_FIELDS = 'orderCode customer totalAmount subtotal shippingFee paymentStatus orderStatus paymentMethod items.productName items.quantity items.price createdAt';
const SUMMARY_CACHE_TTL_MS = 30_000;
const summaryCache = new Map();
<<<<<<< HEAD

const formatOrderStatus = (status) => {
  if (status === 'Đang xử lý') return 'processing';
  if (status === 'Đã giao hàng' || status === 'Đang giao' || status === 'Đang vận chuyển') return 'shipped';
  if (status === 'Đã gửi hàng' || status === 'Giao thành công') return 'delivered';
  if (status === 'Đã hủy') return 'cancelled';
=======
const DATE_RANGE_DAYS = {
  '7days': 7,
  '30days': 30,
  '3months': 90,
  '6months': 180,
  '1year': 365,
};

const formatOrderStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (normalizedStatus === 'processing' || normalizedStatus === 'đang xử lý') return 'processing';
  if (
    normalizedStatus === 'shipped'
    || normalizedStatus === 'đã giao hàng'
    || normalizedStatus === 'đang giao'
    || normalizedStatus === 'đang vận chuyển'
  ) return 'shipped';
  if (normalizedStatus === 'delivered' || normalizedStatus === 'đã gửi hàng' || normalizedStatus === 'giao thành công') return 'delivered';
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === 'đã hủy') return 'cancelled';

>>>>>>> main
  return 'processing';
};

const formatPaymentStatus = (status) => {
  if (status === 'Đã thanh toán') return 'paid';
  if (status === 'Chờ thanh toán' || status === 'Chưa thanh toán') return 'pending';
  return 'failed';
};

<<<<<<< HEAD
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
=======
const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isAdminRole = (role) => role === 'admin' || role === 'super_admin';

const buildOwnedOrderFilter = (userId) => ({
  $or: [
    { user: userId },
    { userId },
  ],
});

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw createHttpError(500, 'JWT_SECRET is not configured');
  }

  return secret;
};

const getBearerToken = (req) => {
  const authorizationHeader = req.headers.authorization || '';
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

const resolveOptionalAuthUser = async (req) => {
  const token = getBearerToken(req);
  if (!token) {
    return null;
  }

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch {
    throw createHttpError(401, 'Token không hợp lệ hoặc đã hết hạn');
  }

  const user = await User.findById(payload.sub).select('_id status role email').lean();
  if (!user) {
    throw createHttpError(401, 'Phiên đăng nhập không hợp lệ');
  }

  if (user.status === 'blocked') {
    throw createHttpError(403, 'Tài khoản đã bị khóa');
  }

  return {
    id: String(user._id),
    role: user.role,
    email: user.email,
  };
};

const resolveRequiredAdminUser = async (req) => {
  const authUser = await resolveOptionalAuthUser(req);
  if (!authUser) {
    throw createHttpError(401, 'Thiếu token xác thực');
  }

  if (!isAdminRole(authUser.role)) {
    throw createHttpError(403, 'Bạn không có quyền thực hiện thao tác này');
  }

  return authUser;
};

const getGuestAccessToken = (req) => {
  const headerToken = typeof req.headers['x-guest-access-token'] === 'string'
    ? req.headers['x-guest-access-token'].trim()
    : '';

  return headerToken;
};

const resolveGuestContext = (req) => {
  const guestAccessToken = getGuestAccessToken(req);
  if (!guestAccessToken) {
    return null;
  }

  const verifiedGuest = verifyGuestAccessToken(guestAccessToken);
  return {
    email: verifiedGuest.email,
    phone: verifiedGuest.phone,
  };
};

const normalizeOrderStatusToVi = (status) => {
  const mapToVi = {
    processing: 'Đang xử lý',
    shipped: 'Đang vận chuyển',
    delivered: 'Giao thành công',
    cancelled: 'Đã hủy',
  };

  return mapToVi[status] || status;
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
    productId: item.productId?.toString() || '',
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    productImage: item.productImage || '',
    category: 'Sản phẩm'
  })),
  notes: order.history?.[0]?.note || ''
});

const getCacheKey = (filter, limit) => JSON.stringify({ filter, limit });

const sendOrdersFallback = (res, cachedEntry, source) => {
  if (cachedEntry?.data) {
    res.set('X-Orders-Cache', 'STALE');
    return sendDegradedJson(res, cachedEntry.data, { source });
  }

  res.set('X-Orders-Cache', 'EMPTY');
  return sendDegradedJson(res, [], { source });
};

const calculatePercentChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

const getRangeLabel = (date, range) => {
  const days = DATE_RANGE_DAYS[range] || 180;

  if (days <= 30) {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  }

  return date.toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' });
};

const matchesDashboardFilters = (order, filters, productCategoryMap) => {
  if (filters.status !== 'all' && formatOrderStatus(order.orderStatus) !== filters.status) {
    return false;
  }

  if (filters.category !== 'all') {
    return (order.items || []).some((item) => {
      const productName = String(item.productName || '').trim().toLowerCase();
      return productCategoryMap.get(productName) === filters.category;
    });
  }

  return true;
};

const createDashboardFallback = () => ({
  totals: {
    revenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    orders: 0,
    activeCustomers: 0,
    products: 0,
  },
  changes: {
    revenue: 0,
    paidRevenue: 0,
    pendingRevenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
  },
  revenueTrend: {
    labels: ['Chưa có dữ liệu'],
    revenue: [0],
    paidRevenue: [0],
    pendingRevenue: [0],
  },
  productPerformance: [],
  topSellingProducts: [],
  recentOrders: [],
  topCustomers: [],
});

const normalizeOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, 'Đơn hàng phải có ít nhất một sản phẩm');
  }

  return items.map((item) => {
    const productId = typeof item?.productId === 'string' ? item.productId.trim() : '';
    const quantity = Number(item?.quantity);

    if (!productId) {
      throw createHttpError(400, 'Thiếu mã sản phẩm trong đơn hàng');
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw createHttpError(400, `Mã sản phẩm không hợp lệ: ${productId}`);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError(400, 'Số lượng sản phẩm không hợp lệ');
    }

    return {
      productId,
      quantity,
      fallbackName: typeof item?.productName === 'string' ? item.productName.trim() : '',
      fallbackImage: typeof item?.productImage === 'string' ? item.productImage.trim() : '',
      fallbackCategory: typeof item?.category === 'string' ? item.category.trim() : 'Sản phẩm',
    };
  });
};

const normalizeOrderRequestPayload = (body) => {
  const requestBody = body && typeof body === 'object' ? body : {};
  const customer = requestBody.customer && typeof requestBody.customer === 'object' ? requestBody.customer : {};
  const shippingAddress = requestBody.shippingAddress && typeof requestBody.shippingAddress === 'object'
    ? requestBody.shippingAddress
    : null;

  const customerName = typeof customer.name === 'string' ? customer.name.trim() : '';
  const customerEmail = typeof customer.email === 'string' ? customer.email.trim() : '';
  const customerPhone = typeof customer.phone === 'string' ? customer.phone.trim() : '';
  const paymentMethod = typeof requestBody.paymentMethod === 'string' ? requestBody.paymentMethod.trim() : '';

  const street = typeof shippingAddress?.street === 'string'
    ? shippingAddress.street.trim()
    : typeof customer.address === 'string'
      ? customer.address.trim()
      : '';
  const city = typeof shippingAddress?.city === 'string' ? shippingAddress.city.trim() : '';
  const ward = typeof shippingAddress?.ward === 'string' ? shippingAddress.ward.trim() : '';
  const district = typeof shippingAddress?.district === 'string' ? shippingAddress.district.trim() : '';

  const productsSource = Array.isArray(requestBody.products)
    ? requestBody.products
    : Array.isArray(requestBody.items)
      ? requestBody.items
      : [];

  const rawProducts = productsSource.map((item) => {
    const productId = typeof item?.productId === 'string'
      ? item.productId
      : typeof item?.id === 'string'
        ? item.id
        : '';

    return {
      ...item,
      productId,
      quantity: item?.quantity,
    };
  });

  return {
    requestedUserId: requestBody?.userId ? String(requestBody.userId).trim() : '',
    customerName,
    customerEmail,
    customerPhone,
    shippingAddress: {
      street,
      ward,
      district,
      city,
    },
    customerAddressLine: [street, ward, district, city].filter(Boolean).join(', '),
    paymentMethod,
    rawProducts,
    history: Array.isArray(requestBody.history) ? requestBody.history : [],
  };
};

// 1. Lấy danh sách toàn bộ đơn hàng (CHỈ dành cho Admin)
// USER và GUEST dùng /api/user/orders và /api/guest/orders tương ứng.
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Thiếu token xác thực', error: 'auth_token_missing' });
    }

    const orders = await Order.find(buildOwnedOrderFilter(userId))
      .sort({ _id: -1 })
      .lean()
      .maxTimeMS(8000);

    return res.json(orders.map(mapOrderToFrontend));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Không thể tải lịch sử đơn hàng' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    if (!isAdminRole(req.user?.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập danh sách đơn hàng này' });
    }

    const filter = {};

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

    if (!isDbReady()) {
      logDbDegraded('orders:list', null, { summaryOnly, hasCached: Boolean(cachedEntry?.data) });

      if (summaryOnly) {
        return sendOrdersFallback(res, cachedEntry, 'orders-summary-fallback');
      }

      return sendDegradedJson(res, [], { source: 'orders-empty' });
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
>>>>>>> main

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
<<<<<<< HEAD
      return res.json(cachedEntry?.data || []);
=======
      return sendOrdersFallback(res, cachedEntry, 'orders-summary-timeout');
>>>>>>> main
    }

    const formattedOrders = await fetchPromise;
    res.json(formattedOrders);
  } catch (error) {
    if (isDbUnavailableError(error)) {
      const summaryOnly = isTruthyQuery(req.query.summary);
      const filter = {};

      const rawLimit = Number.parseInt(String(req.query.limit || ''), 10);
      const safeLimit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : null;
      const cacheKey = getCacheKey(filter, safeLimit ?? 0);
      const cachedEntry = summaryOnly ? summaryCache.get(cacheKey) : null;

      logDbDegraded('orders:list', error, { summaryOnly, hasCached: Boolean(cachedEntry?.data) });

      if (summaryOnly) {
        return sendOrdersFallback(res, cachedEntry, 'orders-summary-fallback');
      }

      return sendDegradedJson(res, [], { source: 'orders-empty' });
    }

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

<<<<<<< HEAD
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
=======
router.get('/stats/dashboard', async (req, res) => {
  if (!isDbReady()) {
    logDbDegraded('orders:stats:dashboard');
    return sendDegradedJson(res, createDashboardFallback(), { source: 'orders-dashboard-empty' });
  }

  try {
    const dateRange = DATE_RANGE_DAYS[req.query.dateRange] ? String(req.query.dateRange) : '6months';
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const status = typeof req.query.status === 'string' ? req.query.status : 'all';
    const now = new Date();
    const days = DATE_RANGE_DAYS[dateRange] || 180;
    const rangeStart = new Date(now);
    rangeStart.setDate(now.getDate() - days);
    const previousEnd = new Date(rangeStart.getTime() - 1);
    const previousStart = new Date(rangeStart);
    previousStart.setDate(rangeStart.getDate() - days);

    const [orders, products] = await Promise.all([
      Order.find({ createdAt: { $gte: previousStart, $lte: now } }).lean().maxTimeMS(8000),
      Product.find({}, 'name category createdAt').lean().maxTimeMS(8000),
    ]);

    const productCategoryMap = new Map(
      products.map((product) => [String(product.name || '').trim().toLowerCase(), product.category])
    );

    const filters = { category, status };

    const filteredOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt || now);
      return createdAt >= rangeStart && createdAt <= now && matchesDashboardFilters(order, filters, productCategoryMap);
    });

    const previousOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt || now);
      return createdAt >= previousStart && createdAt <= previousEnd && matchesDashboardFilters(order, filters, productCategoryMap);
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => (
      formatOrderStatus(order.orderStatus) === 'cancelled' ? sum : sum + (order.totalAmount || 0)
    ), 0);
    const paidRevenue = filteredOrders.reduce((sum, order) => (
      formatPaymentStatus(order.paymentStatus) === 'paid' && formatOrderStatus(order.orderStatus) !== 'cancelled'
        ? sum + (order.totalAmount || 0)
        : sum
    ), 0);
    const pendingRevenue = filteredOrders.reduce((sum, order) => (
      formatPaymentStatus(order.paymentStatus) === 'pending' && formatOrderStatus(order.orderStatus) !== 'cancelled'
        ? sum + (order.totalAmount || 0)
        : sum
    ), 0);

    const previousRevenue = previousOrders.reduce((sum, order) => (
      formatOrderStatus(order.orderStatus) === 'cancelled' ? sum : sum + (order.totalAmount || 0)
    ), 0);
    const previousPaidRevenue = previousOrders.reduce((sum, order) => (
      formatPaymentStatus(order.paymentStatus) === 'paid' && formatOrderStatus(order.orderStatus) !== 'cancelled'
        ? sum + (order.totalAmount || 0)
        : sum
    ), 0);
    const previousPendingRevenue = previousOrders.reduce((sum, order) => (
      formatPaymentStatus(order.paymentStatus) === 'pending' && formatOrderStatus(order.orderStatus) !== 'cancelled'
        ? sum + (order.totalAmount || 0)
        : sum
    ), 0);

    const activeCustomers = new Set(
      filteredOrders.map((order) => order.customer?.email || order.customer?.phone || order._id.toString())
    ).size;
    const previousCustomers = new Set(
      previousOrders.map((order) => order.customer?.email || order.customer?.phone || order._id.toString())
    ).size;

    const filteredProducts = category === 'all'
      ? products
      : products.filter((product) => product.category === category);

    const salesByProduct = new Map();
    filteredOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const productName = String(item.productName || '').trim();
        if (!productName) {
          return;
        }

        const productCategory = productCategoryMap.get(productName.toLowerCase());
        if (category !== 'all' && productCategory !== category) {
          return;
        }

        const current = salesByProduct.get(productName.toLowerCase()) || {
          product: productName,
          sold: 0,
          revenue: 0,
        };

        current.sold += Number(item.quantity) || 0;
        current.revenue += (Number(item.quantity) || 0) * (Number(item.price) || 0);
        salesByProduct.set(productName.toLowerCase(), current);
      });
    });

    const productPerformance = filteredProducts
      .map((product) => {
        const stats = salesByProduct.get(String(product.name || '').trim().toLowerCase()) || { sold: 0, revenue: 0 };

        return {
          product: product.name,
          sold: stats.sold,
          stock: Number(product.stock) || 0,
          revenue: stats.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue || b.sold - a.sold)
      .slice(0, 10);

    const topSellingProducts = productPerformance.slice(0, 5).map((product, index) => ({
      id: index + 1,
      name: product.product,
      sold: product.sold,
      revenue: product.revenue,
    }));

    const recentOrders = [...filteredOrders]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5)
      .map((order) => ({
        id: String(order._id),
        orderNumber: order.orderCode || `ORD-${String(order._id).slice(-6)}`,
        customer: order.customer?.name || 'Khách vãng lai',
        product: order.items?.[0]?.productName || 'Không có sản phẩm',
        amount: Number(order.totalAmount) || 0,
        status: formatOrderStatus(order.orderStatus),
      }));

    const topCustomersMap = new Map();
    filteredOrders.forEach((order) => {
      const key = order.customer?.email || order.customer?.phone || String(order._id);
      const current = topCustomersMap.get(key) || {
        name: order.customer?.name || 'Khách vãng lai',
        email: order.customer?.email || 'Khách vãng lai',
        orders: 0,
        spending: 0,
      };

      current.orders += 1;
      if (formatOrderStatus(order.orderStatus) !== 'cancelled') {
        current.spending += Number(order.totalAmount) || 0;
      }

      topCustomersMap.set(key, current);
    });

    const topCustomers = Array.from(topCustomersMap.values())
      .sort((a, b) => b.spending - a.spending || b.orders - a.orders)
      .slice(0, 5)
      .map((customer, index) => ({
        id: index + 1,
        name: customer.name,
        email: customer.email,
        orders: customer.orders,
        spending: customer.spending,
      }));

    const currentPeriodProducts = filteredProducts.filter((product) => {
      const createdAt = new Date(product.createdAt || now);
      return createdAt >= rangeStart && createdAt <= now;
    }).length;
    const previousPeriodProducts = filteredProducts.filter((product) => {
      const createdAt = new Date(product.createdAt || now);
      return createdAt >= previousStart && createdAt <= previousEnd;
    }).length;

    const revenueBuckets = {};
    filteredOrders.forEach((order) => {
      const createdAt = new Date(order.createdAt || now);
      const key = days <= 30
        ? createdAt.toISOString().slice(0, 10)
        : `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueBuckets[key]) {
        revenueBuckets[key] = {
          label: getRangeLabel(createdAt, dateRange),
          sortValue: createdAt.getTime(),
          revenue: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
        };
      }

      if (formatOrderStatus(order.orderStatus) !== 'cancelled') {
        revenueBuckets[key].revenue += order.totalAmount || 0;
      }

      if (formatPaymentStatus(order.paymentStatus) === 'paid' && formatOrderStatus(order.orderStatus) !== 'cancelled') {
        revenueBuckets[key].paidRevenue += order.totalAmount || 0;
      }

      if (formatPaymentStatus(order.paymentStatus) === 'pending' && formatOrderStatus(order.orderStatus) !== 'cancelled') {
        revenueBuckets[key].pendingRevenue += order.totalAmount || 0;
      }
    });

    const sortedBuckets = Object.values(revenueBuckets).sort((a, b) => a.sortValue - b.sortValue);

    return res.json({
      totals: {
        revenue: totalRevenue,
        paidRevenue,
        pendingRevenue,
        orders: filteredOrders.length,
        activeCustomers,
        products: filteredProducts.length,
      },
      changes: {
        revenue: calculatePercentChange(totalRevenue, previousRevenue),
        paidRevenue: calculatePercentChange(paidRevenue, previousPaidRevenue),
        pendingRevenue: calculatePercentChange(pendingRevenue, previousPendingRevenue),
        orders: calculatePercentChange(filteredOrders.length, previousOrders.length),
        customers: calculatePercentChange(activeCustomers, previousCustomers),
        products: calculatePercentChange(currentPeriodProducts, previousPeriodProducts),
      },
      revenueTrend: {
        labels: sortedBuckets.length > 0 ? sortedBuckets.map((bucket) => bucket.label) : ['Chưa có dữ liệu'],
        revenue: sortedBuckets.length > 0 ? sortedBuckets.map((bucket) => bucket.revenue) : [0],
        paidRevenue: sortedBuckets.length > 0 ? sortedBuckets.map((bucket) => bucket.paidRevenue) : [0],
        pendingRevenue: sortedBuckets.length > 0 ? sortedBuckets.map((bucket) => bucket.pendingRevenue) : [0],
      },
      productPerformance,
      topSellingProducts,
      recentOrders,
      topCustomers,
    });
  } catch (error) {
    if (isDbUnavailableError(error)) {
      logDbDegraded('orders:stats:dashboard', error);
      return sendDegradedJson(res, createDashboardFallback(), { source: 'orders-dashboard-empty' });
    }

    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const filter = isAdminRole(req.user?.role)
      ? { _id: req.params.id }
      : { _id: req.params.id, ...buildOwnedOrderFilter(req.user.userId) };

    const order = await Order.findOne(filter).lean().maxTimeMS(8000);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    const mapOrderStatus = (status) => {
      const normalizedStatus = String(status || '').trim().toLowerCase();

      if (normalizedStatus === 'processing' || normalizedStatus === 'đang xử lý') return 'processing';
      if (
        normalizedStatus === 'shipped'
        || normalizedStatus === 'đã giao hàng'
        || normalizedStatus === 'đang giao'
        || normalizedStatus === 'đang vận chuyển'
      ) return 'shipped';
      if (normalizedStatus === 'delivered' || normalizedStatus === 'đã gửi hàng' || normalizedStatus === 'giao thành công') return 'delivered';
      if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === 'đã hủy') return 'cancelled';

>>>>>>> main
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
<<<<<<< HEAD
    res.status(500).json({ message: error.message });
=======
    res.status(error.statusCode || 500).json({ message: error.message });
>>>>>>> main
  }
});

// 1.2 Tạo đơn hàng mới (Dành cho trang Thanh toán / Checkout)
router.post('/', async (req, res) => {
  try {
<<<<<<< HEAD
    const newOrder = new Order(req.body);
    if (!newOrder.orderCode) {
      newOrder.orderCode = `ORD-${Date.now().toString().slice(-6).toUpperCase()}`;
    }
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
=======
    if (!isDbReady()) {
      return res.status(503).json({ message: 'He thong don hang tam thoi khong san sang' });
    }

    const authUser = await resolveOptionalAuthUser(req);
    const authUserId = authUser?.id || null;
    const reqUser = req.user || null;

    console.log('=== ORDER DEBUG ===');
    console.log('BODY:', req.body);
    console.log('USER:', reqUser || (authUser ? { id: authUser.id, role: authUser.role, email: authUser.email } : null));

    const normalizedPayload = normalizeOrderRequestPayload(req.body);
    const {
      requestedUserId,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      customerAddressLine,
      paymentMethod,
      rawProducts,
      history,
    } = normalizedPayload;

    if (!customerName) {
      return res.status(400).json({ message: 'Thiếu tên khách hàng' });
    }

    if (!customerPhone) {
      return res.status(400).json({ message: 'Thiếu số điện thoại nhận hàng' });
    }

    if (!rawProducts || rawProducts.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }

    if (!shippingAddress.street || !shippingAddress.city) {
      return res.status(400).json({ message: 'Thiếu địa chỉ giao hàng' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Thiếu phương thức thanh toán' });
    }

    if (!['cod', 'bank', 'bank_transfer', 'momo', 'zalopay', 'credit_card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ' });
    }

    if (!authUserId && !customerEmail) {
      return res.status(400).json({ message: 'Đơn guest bắt buộc phải có email' });
    }

    if (requestedUserId && (!authUserId || requestedUserId !== authUserId)) {
      return res.status(403).json({ message: 'Không được giả mạo userId khi tạo đơn hàng' });
    }

    const normalizedItems = normalizeOrderItems(rawProducts);
    const session = await Order.startSession();
    let savedOrder;
    let updatedStocks = [];

    try {
      await session.withTransaction(async () => {
        const productIds = normalizedItems.map((item) => item.productId);
        const products = await Product.find({ _id: { $in: productIds } }, 'name price stock images category')
          .session(session)
          .lean();

        const productsById = new Map(products.map((product) => [product._id.toString(), product]));
        const orderItems = [];

        for (const item of normalizedItems) {
          const product = productsById.get(item.productId);

          if (!product) {
            throw createHttpError(404, 'Không tìm thấy sản phẩm trong đơn hàng');
          }

          if (!Number.isFinite(product.stock) || product.stock < item.quantity) {
            throw createHttpError(409, `Sản phẩm ${product.name} không đủ số lượng tồn kho`);
          }

          const updateResult = await Product.updateOne(
            { _id: item.productId, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
          );

          if (updateResult.modifiedCount !== 1) {
            throw createHttpError(409, `Sản phẩm ${product.name} đã thay đổi tồn kho, vui lòng thử lại`);
          }

          const nextStock = Math.max(0, Number(product.stock) - item.quantity);
          updatedStocks.push({ productId: item.productId, stock: nextStock });

          orderItems.push({
            productId: item.productId,
            productName: product.name || item.fallbackName,
            quantity: item.quantity,
            price: Number(product.price) || 0,
            productImage: product.images?.[0] || item.fallbackImage,
            category: product.category || item.fallbackCategory,
          });
        }

        const newOrder = new Order({
          ...req.body,
          customer: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddressLine,
          },
          shippingAddress,
          paymentMethod,
          // userId chỉ lấy từ JWT đã verify ở server.
          user: authUserId,
          userId: authUserId,
          items: orderItems,
          products: undefined,
          history,
          totalAmount: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0) + (Number(req.body.shippingFee) || 0),
          subtotal: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
          orderCode: req.body.orderCode || `ORD-${Date.now().toString().slice(-6).toUpperCase()}`,
        });

        savedOrder = await newOrder.save({ session });
      });
    } finally {
      await session.endSession();
    }

    res.status(201).json({
      ...savedOrder.toObject(),
      id: savedOrder._id.toString(),
      updatedStocks,
    });
  } catch (error) {
    const statusCode = error?.statusCode || (error?.name === 'CastError' ? 400 : 500);
    res.status(statusCode).json({ message: error.message });
>>>>>>> main
  }
});

// 2. Cập nhật trạng thái đơn hàng
router.put('/:id', async (req, res) => {
  try {
<<<<<<< HEAD
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
    
=======
    const authUser = await resolveOptionalAuthUser(req);
    const guestContext = authUser ? null : resolveGuestContext(req);

    if (!authUser && !guestContext) {
      return res.status(401).json({ message: 'Thiếu quyền truy cập đơn hàng' });
    }

    const isAdmin = isAdminRole(authUser?.role);
    const ownershipFilter = isAdmin
      ? { _id: req.params.id }
      : authUser
        ? { _id: req.params.id, userId: authUser.id }
        : {
          _id: req.params.id,
          userId: null,
          'customer.email': guestContext.email,
          'customer.phone': guestContext.phone,
        };

    const order = await Order.findOne(ownershipFilter);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Khách hàng (user/guest) chỉ được sửa đơn khi đang processing.
    if (!isAdmin && formatOrderStatus(order.orderStatus) !== 'processing') {
      return res.status(409).json({ message: 'Chỉ có thể cập nhật đơn hàng đang xử lý' });
    }

    const updateData = { ...req.body };

    if (isAdmin) {
      if (updateData.orderStatus) {
        updateData.orderStatus = normalizeOrderStatusToVi(updateData.orderStatus);
      }

      if (updateData.paymentStatus) {
        if (formatOrderStatus(order.orderStatus) === 'cancelled') {
          return res.status(409).json({ message: 'Không thể ghi nhận thanh toán cho đơn hàng đã hủy' });
        }

        const mapPaymentToVi = {
          paid: 'Đã thanh toán',
          pending: 'Chưa thanh toán',
          failed: 'Thanh toán thất bại',
        };
        updateData.paymentStatus = mapPaymentToVi[updateData.paymentStatus] || updateData.paymentStatus;
      }

      // Refill stock khi admin chuyển đơn sang trạng thái hủy lần đầu tiên
      const wasCancelledBefore = formatOrderStatus(order.orderStatus) === 'cancelled';
      const willBeCancelled = updateData.orderStatus && formatOrderStatus(updateData.orderStatus) === 'cancelled';
      if (!wasCancelledBefore && willBeCancelled && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.productId && item.quantity > 0) {
            await Product.updateOne(
              { _id: item.productId },
              { $inc: { stock: item.quantity } }
            );
          }
        }
      }

      if (updateData.notes !== undefined) {
        if (order.history && order.history.length > 0) {
          order.history[0].note = updateData.notes;
        } else {
          order.history = [{ note: updateData.notes }];
        }
        await order.save();
        delete updateData.notes;
      }

      if (Object.keys(updateData).length > 0) {
        await Order.updateOne({ _id: order._id }, { $set: updateData });
      }
    } else {
      if (updateData.paymentStatus !== undefined || updateData.userId !== undefined || updateData.notes !== undefined) {
        return res.status(403).json({ message: 'Bạn không có quyền cập nhật trường dữ liệu này' });
      }

      if (updateData.orderStatus !== undefined) {
        const normalizedStatus = normalizeOrderStatusToVi(updateData.orderStatus);
        if (normalizedStatus !== 'Đã hủy') {
          return res.status(403).json({ message: 'Khách hàng chỉ được hủy đơn hàng' });
        }

        // Refill stock khi user hủy đơn (guard đã có: chỉ cho phép khi đang 'processing')
        if (Array.isArray(order.items)) {
          for (const item of order.items) {
            if (item.productId && item.quantity > 0) {
              await Product.updateOne(
                { _id: item.productId },
                { $inc: { stock: item.quantity } }
              );
            }
          }
        }

        order.orderStatus = 'Đã hủy';
      }

      if (updateData.customer && typeof updateData.customer === 'object') {
        order.customer = {
          ...order.customer,
          name: updateData.customer.name ?? order.customer?.name,
          phone: updateData.customer.phone ?? order.customer?.phone,
          address: updateData.customer.address ?? order.customer?.address,
          // Không cho đổi email để tránh chiếm quyền đơn khác.
          email: order.customer?.email,
        };
      }

      await order.save();
    }

>>>>>>> main
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// 3. Xóa đơn hàng
router.delete('/:id', async (req, res) => {
  try {
    await resolveRequiredAdminUser(req);
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Xóa đơn hàng thành công' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// 4. Xác nhận đã thanh toán (Admin)
router.post('/:id/confirm-payment', async (req, res) => {
  try {
    await resolveRequiredAdminUser(req);
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (formatOrderStatus(order.orderStatus) === 'cancelled') {
      return res.status(409).json({ message: 'Không thể ghi nhận thanh toán cho đơn hàng đã hủy' });
    }

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
    res.status(error.statusCode || 500).json({ message: error.message });
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