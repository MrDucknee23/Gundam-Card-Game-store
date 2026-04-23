/**
 * Controller đơn hàng GUEST.
 * Yêu cầu guest access token (đã verify OTP) – lấy context từ verifyGuestAccessToken.
 * KHÔNG nhận email/phone trực tiếp từ query/body client.
 */
const { getGuestOrders, getGuestOrderById } = require('../services/guestOrderService');
const { verifyGuestAccessToken } = require('../services/guestOtpService');

const extractGuestContext = (req) => {
  const authHeader = typeof req.headers.authorization === 'string' ? req.headers.authorization.trim() : '';
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const headerToken = typeof req.headers['x-guest-access-token'] === 'string'
    ? req.headers['x-guest-access-token'].trim()
    : '';
  const token = bearerToken || headerToken;

  // verifyGuestAccessToken sẽ throw nếu token sai/hết hạn
  return verifyGuestAccessToken(token);
};

/** GET /api/guest/orders */
const listOrders = async (req, res) => {
  try {
    // email + phone lấy từ guest token đã verify OTP, KHÔNG từ query string
    const guestContext = extractGuestContext(req);
    const orders = await getGuestOrders(guestContext);
    return res.json(orders);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Không thể tải lịch sử đơn hàng guest',
      error: error.code || 'guest_orders_error',
    });
  }
};

/** GET /api/guest/orders/:id */
const getOrderDetail = async (req, res) => {
  try {
    const guestContext = extractGuestContext(req);
    const order = await getGuestOrderById(guestContext, req.params.id);
    return res.json(order);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Không thể tải chi tiết đơn hàng guest',
      error: error.code || 'guest_order_detail_error',
    });
  }
};

module.exports = { listOrders, getOrderDetail };
