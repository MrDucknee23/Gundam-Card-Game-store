/**
 * Controller đơn hàng USER đã đăng nhập.
 * Yêu cầu middleware authJwt chạy trước – req.authUser.id là nguồn userId DUY NHẤT.
 */
const { getUserOrders, getUserOrderById } = require('../services/userOrderService');

/** GET /api/user/orders */
const listOrders = async (req, res) => {
  try {
    // userId lấy từ JWT (authJwt middleware), KHÔNG từ client
    const orders = await getUserOrders(req.authUser.id);
    return res.json(orders);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Không thể tải lịch sử đơn hàng',
      error: 'user_orders_error',
    });
  }
};

/** GET /api/user/orders/:id */
const getOrderDetail = async (req, res) => {
  try {
    const order = await getUserOrderById(req.authUser.id, req.params.id);
    return res.json(order);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Không thể tải chi tiết đơn hàng',
      error: 'user_order_detail_error',
    });
  }
};

module.exports = { listOrders, getOrderDetail };
