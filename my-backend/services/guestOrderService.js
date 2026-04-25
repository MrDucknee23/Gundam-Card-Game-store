/**
 * Service lấy danh sách đơn hàng của GUEST (chưa đăng nhập).
 *
 * Quy tắc bảo mật CỨNG:
 * - Luôn query theo email + phone đã được xác thực qua OTP
 * - KHÔNG nhận email/phone trực tiếp từ client mà không có guest access token
 * - Luôn thêm điều kiện userId = null để loại trừ đơn của user đã đăng nhập
 * - KHÔNG trả đơn hàng có userId != null
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
  customerName: order.customer?.name || 'Khách vãng lai',
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
 * @param {{ email: string, phone: string }} verifiedGuest – lấy từ guest access token đã verify OTP
 * @returns {Promise<object[]>}
 */
const getGuestOrders = async ({ email, phone }) => {
  if (!email || !phone) {
    throw Object.assign(new Error('Thiếu thông tin xác thực guest'), { statusCode: 401 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  // SECURITY: userId = null → chỉ lấy đơn guest, loại trừ hoàn toàn đơn của user đã đăng nhập
  const orders = await Order.find({
    'customer.email': normalizedEmail,
    'customer.phone': normalizedPhone,
    userId: null,
  })
    .sort({ _id: -1 })
    .lean()
    .maxTimeMS(8000);

  return orders.map(mapOrderToFrontend);
};

/**
 * @param {{ email: string, phone: string }} verifiedGuest – từ guest access token
 * @param {string} orderId
 */
const getGuestOrderById = async ({ email, phone }, orderId) => {
  if (!email || !phone || !orderId) {
    throw Object.assign(new Error('Thiếu thông tin xác thực guest'), { statusCode: 401 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone.trim();

  // SECURITY: đồng thời check email + phone + userId = null
  const order = await Order.findOne({
    _id: orderId,
    'customer.email': normalizedEmail,
    'customer.phone': normalizedPhone,
    userId: null,
  })
    .lean()
    .maxTimeMS(8000);

  if (!order) {
    throw Object.assign(new Error('Không tìm thấy đơn hàng'), { statusCode: 404 });
  }

  return mapOrderToFrontend(order);
};

module.exports = { getGuestOrders, getGuestOrderById };
