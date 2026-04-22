/**
 * Service lấy danh sách đơn hàng của USER đã đăng nhập.
 *
 * Quy tắc bảo mật CỨNG:
 * - Luôn query theo userId lấy từ JWT (req.authUser.id)
 * - KHÔNG nhận userId/email từ bất kỳ input nào của client
 * - KHÔNG trả đơn hàng có userId = null (đơn guest)
 */
const Order = require('../models/Order');

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
  customerName: order.customer?.name || 'Khách hàng',
  customerEmail: order.customer?.email || '',
  customerPhone: order.customer?.phone || '',
  orderDate: order.createdAt || new Date().toISOString(),
  total: order.totalAmount || 0,
  subtotal: order.subtotal || 0,
  shippingFee: order.shippingFee || 0,
  paymentStatus: formatPaymentStatus(order.paymentStatus),
  orderStatus: formatOrderStatus(order.orderStatus),
  paymentMethod: order.paymentMethod || 'cod',
  shippingAddress: {
    street: order.customer?.address || '',
    ward: '',
    district: '',
    city: '',
  },
  items: (order.items || []).map((item) => ({
    productId: item.productId?.toString() || '',
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    productImage: item.productImage || '',
  })),
  notes: order.history?.[0]?.note || '',
});

/**
 * @param {string} userId – MongoDB ObjectId string, lấy từ JWT payload (req.authUser.id)
 * @returns {Promise<object[]>} Danh sách đơn hàng đã được format cho frontend
 */
const getUserOrders = async (userId) => {
  if (!userId) {
    throw Object.assign(new Error('userId bắt buộc để lấy đơn hàng user'), { statusCode: 400 });
  }

  // SECURITY: userId = req.authUser.id (từ JWT), KHÔNG phải từ request body/query
  // SECURITY: Chỉ lấy đơn có userId khớp – guest orders (userId = null) bị loại trừ tự nhiên
  const orders = await Order.find({ userId })
    .sort({ _id: -1 })
    .lean()
    .maxTimeMS(8000);

  return orders.map(mapOrderToFrontend);
};

/**
 * @param {string} userId – MongoDB ObjectId string, lấy từ JWT
 * @param {string} orderId – MongoDB ObjectId string của đơn cần xem
 */
const getUserOrderById = async (userId, orderId) => {
  if (!userId || !orderId) {
    throw Object.assign(new Error('Thiếu thông tin xác thực'), { statusCode: 400 });
  }

  const order = await Order.findOne({ _id: orderId, userId }).lean().maxTimeMS(8000);

  if (!order) {
    throw Object.assign(new Error('Không tìm thấy đơn hàng'), { statusCode: 404 });
  }

  return mapOrderToFrontend(order);
};

module.exports = { getUserOrders, getUserOrderById };
