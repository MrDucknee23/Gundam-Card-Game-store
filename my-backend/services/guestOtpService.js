const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const GuestOtp = require('../models/GuestOtp');
const { sendOTPEmail } = require('../utils/mailer');
const { otpSecret, otpExpire } = require('../config/env');

const OTP_TTL_MS = 5 * 60 * 1000;
const ACCESS_TOKEN_TTL = '15m';
const OTP_LENGTH = 6;

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
    ward: '', district: '', city: '',
  },
  items: (order.items || []).map((item) => ({
    productId: item.productId?.toString() || '',
    productName: item.productName,
    quantity: item.quantity,
    price: item.price,
    productImage: item.productImage || '',
    category: 'Sản phẩm',
  })),
  notes: order.history?.[0]?.note || '',
});

const createHttpError = (statusCode, message, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizePhone = (phone) => String(phone || '').trim();

const assertGuestLookupInput = ({ email, phone }) => {
  const safeEmail = normalizeEmail(email);
  const safePhone = normalizePhone(phone);

  if (!safeEmail) {
    throw createHttpError(400, 'Vui lòng nhập email đặt hàng', 'guest_lookup_email_required');
  }

  if (!safePhone) {
    throw createHttpError(400, 'Vui lòng nhập số điện thoại đặt hàng', 'guest_lookup_phone_required');
  }

  return { email: safeEmail, phone: safePhone };
};

const generateOtp = () => crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, '0');

const getGuestOtpSecret = () => {
  const secret = (otpSecret || process.env.GUEST_OTP_JWT_SECRET)?.trim();
  if (!secret) {
    throw createHttpError(500, 'Thiếu cấu hình GUEST_OTP_JWT_SECRET cho xác thực OTP', 'guest_otp_secret_missing');
  }

  return secret;
};

const createGuestAccessToken = ({ email, phone }) => jwt.sign(
  {
    type: 'guest-order-access',
    email,
    phone,
  },
  getGuestOtpSecret(),
  { expiresIn: otpExpire || ACCESS_TOKEN_TTL }
);

const verifyGuestAccessToken = (token) => {
  if (!token) {
    throw createHttpError(401, 'Thiếu quyền truy cập đơn hàng guest', 'guest_access_token_required');
  }

  try {
    const payload = jwt.verify(token, getGuestOtpSecret());
    if (payload?.type !== 'guest-order-access' || !payload.email) {
      throw new Error('invalid token payload');
    }

    return {
      email: normalizeEmail(payload.email),
      phone: normalizePhone(payload.phone),
    };
  } catch (error) {
    throw createHttpError(401, 'Phiên xác thực guest đã hết hạn hoặc không hợp lệ', 'guest_access_token_invalid');
  }
};

const findGuestOrders = async ({ email, phone }) => Order.find({
  'customer.email': email,
  'customer.phone': phone,
  userId: null,
})
  .sort({ _id: -1 })
  .lean();

const sendGuestOtp = async ({ email, phone }) => {
  const normalized = assertGuestLookupInput({ email, phone });
  const orders = await findGuestOrders(normalized);

  if (!orders.length) {
    throw createHttpError(404, 'Không tìm thấy đơn hàng khớp với email và số điện thoại đã nhập', 'guest_orders_not_found');
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await GuestOtp.deleteMany({ email: normalized.email });
  await GuestOtp.create({
    email: normalized.email,
    phone: normalized.phone,
    otpHash,
    expiresAt,
  });

  await sendOTPEmail(normalized.email, otp);

  return {
    email: normalized.email,
    expiresAt,
    resendAfterSeconds: 60,
  };
};

const verifyGuestOtp = async ({ email, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedOtp = String(otp || '').trim();

  if (!normalizedEmail) {
    throw createHttpError(400, 'Vui lòng nhập email để xác thực OTP', 'guest_verify_email_required');
  }

  if (!/^\d{6}$/.test(normalizedOtp)) {
    throw createHttpError(400, 'Mã OTP phải gồm đúng 6 chữ số', 'guest_verify_otp_invalid');
  }

  const otpEntry = await GuestOtp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

  if (!otpEntry) {
    throw createHttpError(400, 'OTP không tồn tại hoặc đã hết hạn', 'guest_otp_missing');
  }

  if (otpEntry.expiresAt.getTime() < Date.now()) {
    await GuestOtp.deleteOne({ _id: otpEntry._id });
    throw createHttpError(400, 'OTP đã hết hạn. Vui lòng yêu cầu mã mới', 'guest_otp_expired');
  }

  const isValidOtp = await bcrypt.compare(normalizedOtp, otpEntry.otpHash);
  if (!isValidOtp) {
    throw createHttpError(400, 'OTP không chính xác', 'guest_otp_wrong');
  }

  const guestOrders = await findGuestOrders({ email: otpEntry.email, phone: otpEntry.phone });
  await GuestOtp.deleteOne({ _id: otpEntry._id });

  if (!guestOrders.length) {
    throw createHttpError(404, 'Không tìm thấy đơn hàng tương ứng sau khi xác thực', 'guest_orders_not_found_after_verify');
  }

  return {
    email: otpEntry.email,
    phone: otpEntry.phone,
    accessToken: createGuestAccessToken({ email: otpEntry.email, phone: otpEntry.phone }),
    orders: guestOrders.map(mapOrderToFrontend),
  };
};

module.exports = {
  sendGuestOtp,
  verifyGuestOtp,
  verifyGuestAccessToken,
};