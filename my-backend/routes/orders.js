const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Order = require('../models/Order'); // Import Model cß╗ºa bß║ín
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
const DATE_RANGE_DAYS = {
  '7days': 7,
  '30days': 30,
  '3months': 90,
  '6months': 180,
  '1year': 365,
};
const NAME_REGEX = /^[A-Za-z├Ç-ß╗╣\s]+$/u;
const PHONE_REGEX = /^[0-9]{9,11}$/;
const CANCELLED_STATUSES = new Set(['cancelled', 'canceled', '─æ├ú hß╗ºy']);
const CANCELLED_STATUS_VALUE = 'cancelled';
const CANCELLABLE_ORDER_STATUSES = new Set(['processing', 'pending', 'confirmed']);

const formatOrderStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (normalizedStatus === 'processing' || normalizedStatus === '─æang xß╗¡ l├╜') return 'processing';
  if (
    normalizedStatus === 'shipped'
    || normalizedStatus === '─æ├ú giao h├áng'
    || normalizedStatus === '─æang giao'
    || normalizedStatus === '─æang vß║¡n chuyß╗ân'
  ) return 'shipped';
  if (normalizedStatus === 'delivered' || normalizedStatus === '─æ├ú gß╗¡i h├áng' || normalizedStatus === 'giao th├ánh c├┤ng') return 'delivered';
  if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === '─æ├ú hß╗ºy') return 'cancelled';

  return 'processing';
};

const isCancelledStatus = (status) => CANCELLED_STATUSES.has(String(status || '').trim().toLowerCase());

const normalizeOrderStatus = (status) => {
  const normalizedStatus = String(status || '').trim().toLowerCase();

  if (normalizedStatus === 'pending' || normalizedStatus === 'cho xac nhan' || normalizedStatus === 'chờ xác nhận') {
    return 'pending';
  }

  if (normalizedStatus === 'confirmed' || normalizedStatus === 'da xac nhan' || normalizedStatus === 'đã xác nhận') {
    return 'confirmed';
  }

  if (normalizedStatus === 'processing' || normalizedStatus === '─æang xß╗¡ l├╜' || normalizedStatus === 'dang xu ly') {
    return 'processing';
  }

  if (
    normalizedStatus === 'shipped'
    || normalizedStatus === '─æ├ú giao h├áng'
    || normalizedStatus === '─æang giao'
    || normalizedStatus === '─æang vß║¡n chuyß╗ân'
  ) {
    return 'shipped';
  }

  if (normalizedStatus === 'delivered' || normalizedStatus === '─æ├ú gß╗¡i h├áng' || normalizedStatus === 'giao th├ánh c├┤ng') {
    return 'delivered';
  }

  if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === '─æ├ú hß╗ºy') {
    return 'cancelled';
  }

  return 'processing';
};

const normalizePersonName = (value) => String(value || '').trim().replace(/\s+/g, ' ');
const normalizePhoneNumber = (value) => String(value || '').trim();

const assertValidName = (value, fieldName) => {
  const normalized = normalizePersonName(value);

  if (!normalized) {
    throw createHttpError(400, `${fieldName} kh├┤ng ─æ╞░ß╗úc ─æß╗â trß╗æng`);
  }

  if (!NAME_REGEX.test(normalized)) {
    throw createHttpError(400, `${fieldName} chß╗ë ─æ╞░ß╗úc chß╗⌐a chß╗» c├íi v├á khoß║úng trß║»ng`);
  }

  return normalized;
};

const assertValidPhone = (value) => {
  const normalized = normalizePhoneNumber(value);

  if (!PHONE_REGEX.test(normalized)) {
    throw createHttpError(400, 'Sß╗æ ─æiß╗çn thoß║íi kh├┤ng hß╗úp lß╗ç (9-11 chß╗» sß╗æ)');
  }

  return normalized;
};

const normalizeCustomerForCreate = (customer) => {
  if (!customer || typeof customer !== 'object') {
    throw createHttpError(400, 'Thiß║┐u th├┤ng tin kh├ích h├áng');
  }

  return {
    ...customer,
    name: assertValidName(customer.name, 'Hß╗ì v├á t├¬n'),
    phone: assertValidPhone(customer.phone),
    address: String(customer.address || '').trim(),
    email: String(customer.email || '').trim(),
  };
};

const normalizeCustomerPatch = (customer) => {
  if (!customer || typeof customer !== 'object') {
    return null;
  }

  const patch = {};

  if (customer.name !== undefined) {
    patch.name = assertValidName(customer.name, 'Hß╗ì v├á t├¬n');
  }

  if (customer.phone !== undefined) {
    patch.phone = assertValidPhone(customer.phone);
  }

  if (customer.address !== undefined) {
    patch.address = String(customer.address || '').trim();
  }

  return patch;
};

const restoreStockAndCancelOrder = async (orderId) => {
  const session = await Order.startSession();

  try {
    let result = {
      didRestore: false,
      wasAlreadyCancelled: false,
      order: null,
    };

    await session.withTransaction(async () => {
      const order = await Order.findOne({ _id: orderId }).session(session);

      if (!order) {
        throw createHttpError(404, 'Kh├┤ng t├¼m thß║Ñy ─æ╞ín h├áng');
      }

      const currentStatus = normalizeOrderStatus(order.orderStatus);

      if (currentStatus === 'cancelled') {
        result = {
          didRestore: false,
          wasAlreadyCancelled: true,
          order: order.toObject(),
        };
        return;
      }

      if (!CANCELLABLE_ORDER_STATUSES.has(currentStatus)) {
        throw createHttpError(409, 'Kh├┤ng thß╗â hß╗ºy ─æ╞ín h├áng tß╗½ tr╞░ß╗¥ng th├íi hiß╗çn tß║íi');
      }

      // Atomic state transition: only one request can switch non-cancelled -> cancelled.
      const switchedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          orderStatus: { $nin: ['cancelled', 'canceled', '─É├ú hß╗ºy'] },
        },
        {
          $set: { orderStatus: CANCELLED_STATUS_VALUE },
        },
        {
          new: true,
          session,
        }
      );

      if (!switchedOrder) {
        const latest = await Order.findOne({ _id: orderId }).session(session);
        result = {
          didRestore: false,
          wasAlreadyCancelled: true,
          order: latest ? latest.toObject() : order.toObject(),
        };
        return;
      }

      for (const item of order.items || []) {
        const quantity = Number(item.quantity) || 0;
        if (quantity <= 0) {
          continue;
        }

        await Product.updateOne(
          { _id: item.productId },
          { $inc: { stock: quantity } },
          { session }
        );
      }

      result = {
        didRestore: true,
        wasAlreadyCancelled: false,
        order: switchedOrder.toObject(),
      };
    });

    return result;
  } finally {
    await session.endSession();
  }
};

const formatPaymentStatus = (status) => {
  if (status === '─É├ú thanh to├ín') return 'paid';
  if (status === 'Chß╗¥ thanh to├ín' || status === 'Ch╞░a thanh to├ín') return 'pending';
  return 'failed';
};

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
    throw createHttpError(401, 'Token kh├┤ng hß╗úp lß╗ç hoß║╖c ─æ├ú hß║┐t hß║ín');
  }

  const user = await User.findById(payload.sub).select('_id status role email').lean();
  if (!user) {
    throw createHttpError(401, 'Phi├¬n ─æ─âng nhß║¡p kh├┤ng hß╗úp lß╗ç');
  }

  if (user.status === 'blocked') {
    throw createHttpError(403, 'T├ái khoß║ún ─æ├ú bß╗ï kh├│a');
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
    throw createHttpError(401, 'Thiß║┐u token x├íc thß╗▒c');
  }

  if (!isAdminRole(authUser.role)) {
    throw createHttpError(403, 'Bß║ín kh├┤ng c├│ quyß╗ün thß╗▒c hiß╗çn thao t├íc n├áy');
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

const normalizeOrderStatusToVi = (status) => normalizeOrderStatus(status);

const mapOrderToFrontend = (order) => ({
  id: order._id.toString(),
  orderNumber: order.orderCode || `ORD-${order._id.toString().slice(-6)}`,
  customerName: order.customer?.name || 'Kh├ích v├úng lai',
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
    category: 'Sß║ún phß║⌐m'
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
    labels: ['Ch╞░a c├│ dß╗» liß╗çu'],
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
    throw createHttpError(400, '─É╞ín h├áng phß║úi c├│ ├¡t nhß║Ñt mß╗Öt sß║ún phß║⌐m');
  }

  return items.map((item) => {
    const productId = typeof item?.productId === 'string' ? item.productId.trim() : '';
    const quantity = Number(item?.quantity);

    if (!productId) {
      throw createHttpError(400, 'Thiß║┐u m├ú sß║ún phß║⌐m trong ─æ╞ín h├áng');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw createHttpError(400, 'Sß╗æ l╞░ß╗úng sß║ún phß║⌐m kh├┤ng hß╗úp lß╗ç');
    }

    return {
      productId,
      quantity,
      fallbackName: typeof item?.productName === 'string' ? item.productName.trim() : '',
      fallbackImage: typeof item?.productImage === 'string' ? item.productImage.trim() : '',
      fallbackCategory: typeof item?.category === 'string' ? item.category.trim() : 'Sß║ún phß║⌐m',
    };
  });
};

// 1. Lß║Ñy danh s├ích to├án bß╗Ö ─æ╞ín h├áng (CHß╗ê d├ánh cho Admin)
// USER v├á GUEST d├╣ng /api/user/orders v├á /api/guest/orders t╞░╞íng ß╗⌐ng.
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Thiß║┐u token x├íc thß╗▒c', error: 'auth_token_missing' });
    }

    const orders = await Order.find(buildOwnedOrderFilter(userId))
      .sort({ _id: -1 })
      .lean()
      .maxTimeMS(8000);

    return res.json(orders.map(mapOrderToFrontend));
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || 'Kh├┤ng thß╗â tß║úi lß╗ïch sß╗¡ ─æ╞ín h├áng' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    if (!isAdminRole(req.user?.role)) {
      return res.status(403).json({ message: 'Bß║ín kh├┤ng c├│ quyß╗ün truy cß║¡p danh s├ích ─æ╞ín h├áng n├áy' });
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
      return sendOrdersFallback(res, cachedEntry, 'orders-summary-timeout');
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

// 1.1 Lß║Ñy chi tiß║┐t mß╗Öt ─æ╞ín h├áng theo ID (D├╣ng cho trang Order Detail)

// 5. Thß╗æng k├¬ chi ti├¬u cß╗ºa tß╗½ng kh├ích h├áng (phß║úi ─æß║╖t tr╞░ß╗¢c /:id)
router.get('/stats/customer', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Thiß║┐u email' });

    const paidOrders = await Order.find({
      'customer.email': email,
      paymentStatus: '─É├ú thanh to├ín'
    });

    const totalSpent = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const orderCount = paidOrders.length;

    res.json({ email, totalSpent, orderCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 6. Thß╗æng k├¬ doanh thu (theo th├íng & n─âm) (phß║úi ─æß║╖t tr╞░ß╗¢c /:id)
router.get('/stats/revenue', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear + 1, 0, 1);

    const paidOrders = await Order.find({
      paymentStatus: '─É├ú thanh to├ín',
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

// 7. Top kh├ích h├áng (phß║úi ─æß║╖t tr╞░ß╗¢c /:id)
router.get('/stats/top-customers', async (req, res) => {
  try {
    const pipeline = [
      { $match: { paymentStatus: '─É├ú thanh to├ín' } },
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
        customer: order.customer?.name || 'Kh├ích v├úng lai',
        product: order.items?.[0]?.productName || 'Kh├┤ng c├│ sß║ún phß║⌐m',
        amount: Number(order.totalAmount) || 0,
        status: formatOrderStatus(order.orderStatus),
      }));

    const topCustomersMap = new Map();
    filteredOrders.forEach((order) => {
      const key = order.customer?.email || order.customer?.phone || String(order._id);
      const current = topCustomersMap.get(key) || {
        name: order.customer?.name || 'Kh├ích v├úng lai',
        email: order.customer?.email || 'Kh├ích v├úng lai',
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
        labels: sortedBuckets.length > 0 ? sortedBuckets.map((bucket) => bucket.label) : ['Ch╞░a c├│ dß╗» liß╗çu'],
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
    if (!order) return res.status(404).json({ message: 'Kh├┤ng t├¼m thß║Ñy ─æ╞ín h├áng' });

    const mapOrderStatus = (status) => {
      const normalizedStatus = String(status || '').trim().toLowerCase();

      if (normalizedStatus === 'processing' || normalizedStatus === '─æang xß╗¡ l├╜') return 'processing';
      if (
        normalizedStatus === 'shipped'
        || normalizedStatus === '─æ├ú giao h├áng'
        || normalizedStatus === '─æang giao'
        || normalizedStatus === '─æang vß║¡n chuyß╗ân'
      ) return 'shipped';
      if (normalizedStatus === 'delivered' || normalizedStatus === '─æ├ú gß╗¡i h├áng' || normalizedStatus === 'giao th├ánh c├┤ng') return 'delivered';
      if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled' || normalizedStatus === '─æ├ú hß╗ºy') return 'cancelled';

      return 'processing';
    };
    const mapPaymentStatus = (status) => {
      if (status === '─É├ú thanh to├ín') return 'paid';
      if (status === 'Chß╗¥ thanh to├ín' || status === 'Ch╞░a thanh to├ín') return 'pending';
      return 'failed';
    };

    const formattedOrder = {
      id: order._id.toString(),
      orderNumber: order.orderCode || `ORD-${order._id.toString().slice(-6)}`,
      customerName: order.customer?.name || 'Kh├ích v├úng lai',
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
        category: 'Sß║ún phß║⌐m'
      })),
      notes: order.history?.[0]?.note || ''
    };
    res.json(formattedOrder);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// 1.2 Tß║ío ─æ╞ín h├áng mß╗¢i (D├ánh cho trang Thanh to├ín / Checkout)
router.post('/', async (req, res) => {
  try {
    if (!isDbReady()) {
      return res.status(503).json({ message: 'He thong don hang tam thoi khong san sang' });
    }

    const authUser = await resolveOptionalAuthUser(req);
    const authUserId = authUser?.id || null;
    const requestedUserId = req.body?.userId ? String(req.body.userId).trim() : '';

    if (requestedUserId && (!authUserId || requestedUserId !== authUserId)) {
      return res.status(403).json({ message: 'Kh├┤ng ─æ╞░ß╗úc giß║ú mß║ío userId khi tß║ío ─æ╞ín h├áng' });
    }

    const normalizedItems = normalizeOrderItems(req.body.items);
    const normalizedCustomer = normalizeCustomerForCreate(req.body.customer);
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
            throw createHttpError(404, 'Kh├┤ng t├¼m thß║Ñy sß║ún phß║⌐m trong ─æ╞ín h├áng');
          }

          if (!Number.isFinite(product.stock) || product.stock < item.quantity) {
            throw createHttpError(409, `Sß║ún phß║⌐m ${product.name} kh├┤ng ─æß╗º sß╗æ l╞░ß╗úng tß╗ôn kho`);
          }

          const updateResult = await Product.updateOne(
            { _id: item.productId, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { session }
          );

          if (updateResult.modifiedCount !== 1) {
            throw createHttpError(409, `Sß║ún phß║⌐m ${product.name} ─æ├ú thay ─æß╗òi tß╗ôn kho, vui l├▓ng thß╗¡ lß║íi`);
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
          // userId chß╗ë lß║Ñy tß╗½ JWT ─æ├ú verify ß╗ƒ server.
          user: authUserId,
          userId: authUserId,
          customer: normalizedCustomer,
          items: orderItems,
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
    const statusCode = error?.statusCode || 400;
    res.status(statusCode).json({ message: error.message });
  }
});

// 2. Cß║¡p nhß║¡t trß║íng th├íi ─æ╞ín h├áng
router.put('/:id', async (req, res) => {
  try {
    const authUser = await resolveOptionalAuthUser(req);
    const guestContext = authUser ? null : resolveGuestContext(req);

    if (!authUser && !guestContext) {
      return res.status(401).json({ message: 'Thiß║┐u quyß╗ün truy cß║¡p ─æ╞ín h├áng' });
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
      return res.status(404).json({ message: 'Kh├┤ng t├¼m thß║Ñy ─æ╞ín h├áng' });
    }

    // Kh├ích h├áng (user/guest) chß╗ë ─æ╞░ß╗úc sß╗¡a ─æ╞ín khi ─æang processing.
    if (!isAdmin && formatOrderStatus(order.orderStatus) !== 'processing') {
      return res.status(409).json({ message: 'Chß╗ë c├│ thß╗â cß║¡p nhß║¡t ─æ╞ín h├áng ─æang xß╗¡ l├╜' });
    }

    const updateData = { ...req.body };
    const incomingStatus = updateData.orderStatus ? formatOrderStatus(updateData.orderStatus) : null;

    if (isAdmin) {
      if (updateData.customer && typeof updateData.customer === 'object') {
        const customerPatch = normalizeCustomerPatch(updateData.customer);
        updateData.customer = {
          ...order.customer,
          ...customerPatch,
          email: order.customer?.email,
        };
      }

      if (updateData.orderStatus) {
        updateData.orderStatus = normalizeOrderStatusToVi(updateData.orderStatus);
      }

      if (updateData.paymentStatus) {
        if (formatOrderStatus(order.orderStatus) === 'cancelled') {
          return res.status(409).json({ message: 'Kh├┤ng thß╗â ghi nhß║¡n thanh to├ín cho ─æ╞ín h├áng ─æ├ú hß╗ºy' });
        }

        const mapPaymentToVi = {
          paid: '─É├ú thanh to├ín',
          pending: 'Ch╞░a thanh to├ín',
          failed: 'Thanh to├ín thß║Ñt bß║íi',
        };
        updateData.paymentStatus = mapPaymentToVi[updateData.paymentStatus] || updateData.paymentStatus;
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

      if (incomingStatus === 'cancelled') {
        if (updateData.paymentStatus !== undefined) {
          return res.status(409).json({ message: 'Kh├┤ng thß╗â cß║¡p nhß║¡t thanh to├ín c├╣ng l├║c khi hß╗ºy ─æ╞ín' });
        }

        const cancelResult = await restoreStockAndCancelOrder(order._id);
        const latestOrder = await Order.findById(order._id).lean().maxTimeMS(8000);
        return res.json({
          message: cancelResult.wasAlreadyCancelled
            ? '─É╞ín h├áng ─æ├ú ß╗ƒ tr╞░ß╗¥ng th├íi hß╗ºy'
            : 'Cß║¡p nhß║¡t th├ánh c├┤ng',
          didRestoreStock: cancelResult.didRestore,
          wasAlreadyCancelled: cancelResult.wasAlreadyCancelled,
          order: latestOrder ? mapOrderToFrontend(latestOrder) : null,
        });
      }

      if (Object.keys(updateData).length > 0) {
        await Order.updateOne({ _id: order._id }, { $set: updateData });
      }
    } else {
      if (updateData.paymentStatus !== undefined || updateData.userId !== undefined || updateData.notes !== undefined) {
        return res.status(403).json({ message: 'Bß║ín kh├┤ng c├│ quyß╗ün cß║¡p nhß║¡t tr╞░ß╗¥ng dß╗» liß╗çu n├áy' });
      }

      if (updateData.orderStatus !== undefined) {
        const normalizedStatus = normalizeOrderStatusToVi(updateData.orderStatus);
        if (normalizedStatus !== 'cancelled') {
          return res.status(403).json({ message: 'Kh├ích h├áng chß╗ë ─æ╞░ß╗úc hß╗ºy ─æ╞ín h├áng' });
        }
        const cancelResult = await restoreStockAndCancelOrder(order._id);
        const latestOrder = await Order.findById(order._id).lean().maxTimeMS(8000);

        if (updateData.customer === undefined) {
          return res.json({
            message: cancelResult.wasAlreadyCancelled
              ? '─É╞ín h├áng ─æ├ú ß╗ƒ tr╞░ß╗¥ng th├íi hß╗ºy'
              : 'Cß║¡p nhß║¡t th├ánh c├┤ng',
            didRestoreStock: cancelResult.didRestore,
            wasAlreadyCancelled: cancelResult.wasAlreadyCancelled,
            order: latestOrder ? mapOrderToFrontend(latestOrder) : null,
          });
        }
      }

      if (updateData.customer && typeof updateData.customer === 'object') {
        const customerPatch = normalizeCustomerPatch(updateData.customer);
        const nextCustomer = {
          ...order.customer,
          ...customerPatch,
          // Kh├┤ng cho ─æß╗òi email ─æß╗â tr├ính chiß║┐m quyß╗ün ─æ╞ín kh├íc.
          email: order.customer?.email,
        };

        await Order.updateOne({ _id: order._id }, { $set: { customer: nextCustomer } });
      } else {
        await order.save();
      }
    }

    const latestOrder = await Order.findById(order._id).lean().maxTimeMS(8000);
    res.json({
      message: 'Cß║¡p nhß║¡t th├ánh c├┤ng',
      order: latestOrder ? mapOrderToFrontend(latestOrder) : null,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// 3. X├│a ─æ╞ín h├áng
router.delete('/:id', async (req, res) => {
  try {
    await resolveRequiredAdminUser(req);
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'X├│a ─æ╞ín h├áng th├ánh c├┤ng' });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

// 4. X├íc nhß║¡n ─æ├ú thanh to├ín (Admin)
router.post('/:id/confirm-payment', async (req, res) => {
  try {
    await resolveRequiredAdminUser(req);
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Kh├┤ng t├¼m thß║Ñy ─æ╞ín h├áng' });
    if (formatOrderStatus(order.orderStatus) === 'cancelled') {
      return res.status(409).json({ message: 'Kh├┤ng thß╗â ghi nhß║¡n thanh to├ín cho ─æ╞ín h├áng ─æ├ú hß╗ºy' });
    }

    order.paymentStatus = '─É├ú thanh to├ín';
    order.paidAt = new Date();
    await order.save();

    // T├¡nh tß╗òng chi ti├¬u cß╗ºa kh├ích h├áng (chß╗ë ─æ╞ín ─æ├ú thanh to├ín)
    let customerTotalSpent = 0;
    if (order.customer?.email) {
      const paidOrders = await Order.find({
        'customer.email': order.customer.email,
        paymentStatus: '─É├ú thanh to├ín'
      });
      customerTotalSpent = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    }

    res.json({ message: 'X├íc nhß║¡n thanh to├ín th├ánh c├┤ng', customerTotalSpent });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

module.exports = router;
