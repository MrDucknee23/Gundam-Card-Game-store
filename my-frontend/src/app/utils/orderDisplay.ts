import type { OrderStatus, PaymentMethod, PaymentStatus } from '../data/orders';

const ORDER_STATUS_MAP: Record<string, OrderStatus> = {
  processing: 'processing',
  'đang xử lý': 'processing',
  shipped: 'shipped',
  'đã giao hàng': 'shipped',
  'đang giao': 'shipped',
  'đang vận chuyển': 'shipped',
  delivered: 'delivered',
  'đã gửi hàng': 'delivered',
  'giao thành công': 'delivered',
  cancelled: 'cancelled',
  canceled: 'cancelled',
  'đã hủy': 'cancelled',
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  paid: 'paid',
  'đã thanh toán': 'paid',
  pending: 'pending',
  'chờ thanh toán': 'pending',
  'chưa thanh toán': 'pending',
  failed: 'failed',
  'thanh toán lỗi': 'failed',
  'thanh toán thất bại': 'failed',
};

const PAYMENT_METHOD_MAP: Record<string, PaymentMethod> = {
  cod: 'cod',
  cash: 'cod',
  cash_on_delivery: 'cod',
  bank: 'bank_transfer',
  banking: 'bank_transfer',
  bank_transfer: 'bank_transfer',
  transfer: 'bank_transfer',
  momo: 'momo',
  zalopay: 'zalopay',
  credit_card: 'credit_card',
  card: 'credit_card',
};

const normalizeRawKey = (value: unknown) => String(value || '').trim().toLowerCase();

const decodeViaUtf8Bytes = (value: string) => {
  try {
    const bytes = new Uint8Array(Array.from(value, (char) => char.charCodeAt(0) & 0xff));
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return value;
  }
};

const decodeViaEscape = (value: string) => {
  try {
    return decodeURIComponent(escape(value));
  } catch {
    return value;
  }
};

const scoreVietnameseReadability = (value: string) => {
  const vietnameseChars = (value.match(/[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]/g) || []).length;
  const suspicious = (value.match(/[ÃÂâð]|[\u2500-\u257F]|�/g) || []).length;
  return vietnameseChars * 3 - suspicious * 5;
};

export const sanitizePossiblyMojibakeText = (value: unknown, fallback = '') => {
  const raw = String(value || '').trim();
  if (!raw) {
    return fallback;
  }

  const candidates = [raw, decodeViaEscape(raw), decodeViaUtf8Bytes(raw)]
    .map((candidate) => candidate.trim())
    .filter(Boolean);

  let best = candidates[0];
  let bestScore = scoreVietnameseReadability(best);

  for (const candidate of candidates.slice(1)) {
    const score = scoreVietnameseReadability(candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best.replace(/\s{2,}/g, ' ').trim();
};

export const normalizeOrderStatus = (status: unknown): OrderStatus => {
  const normalized = ORDER_STATUS_MAP[normalizeRawKey(status)];
  return normalized || 'processing';
};

export const normalizePaymentStatus = (status: unknown): PaymentStatus => {
  const normalized = PAYMENT_STATUS_MAP[normalizeRawKey(status)];
  return normalized || 'failed';
};

export const normalizePaymentMethod = (method: unknown): PaymentMethod => {
  const normalized = PAYMENT_METHOD_MAP[normalizeRawKey(method)];
  return normalized || 'cod';
};

export const getOrderStatusLabel = (status: unknown) => {
  const normalizedStatus = normalizeOrderStatus(status);

  if (normalizedStatus === 'processing') return 'Đang xử lý';
  if (normalizedStatus === 'shipped') return 'Đang vận chuyển';
  if (normalizedStatus === 'delivered') return 'Giao thành công';
  return 'Đã hủy';
};

export const getPaymentStatusLabel = (status: unknown) => {
  const normalizedStatus = normalizePaymentStatus(status);

  if (normalizedStatus === 'paid') return 'Đã thanh toán';
  if (normalizedStatus === 'pending') return 'Chờ thanh toán';
  return 'Thanh toán thất bại';
};

export const getPaymentMethodLabel = (method: unknown) => {
  const normalizedMethod = normalizePaymentMethod(method);

  if (normalizedMethod === 'bank_transfer') return 'Chuyển khoản ngân hàng';
  if (normalizedMethod === 'momo') return 'Ví MoMo';
  if (normalizedMethod === 'zalopay') return 'ZaloPay';
  if (normalizedMethod === 'credit_card') return 'Thẻ tín dụng / ghi nợ';
  return 'Thanh toán khi nhận hàng (COD)';
};

export const formatAddressParts = (parts: unknown[]) => {
  return parts
    .map((part) => sanitizePossiblyMojibakeText(part))
    .map((part) => part.replace(/^,+|,+$/g, '').trim())
    .filter(Boolean)
    .join(', ');
};

export const normalizeOrderLike = <T extends Record<string, any>>(order: T): T => {
  const normalizedItems = Array.isArray(order.items)
    ? order.items.map((item: Record<string, unknown>) => ({
      ...item,
      productName: sanitizePossiblyMojibakeText(item.productName, 'Sản phẩm'),
      category: sanitizePossiblyMojibakeText(item.category, 'Sản phẩm'),
    }))
    : [];

  const shippingAddress = order.shippingAddress && typeof order.shippingAddress === 'object'
    ? {
      street: sanitizePossiblyMojibakeText(order.shippingAddress.street),
      ward: sanitizePossiblyMojibakeText(order.shippingAddress.ward),
      district: sanitizePossiblyMojibakeText(order.shippingAddress.district),
      city: sanitizePossiblyMojibakeText(order.shippingAddress.city),
    }
    : {
      street: '',
      ward: '',
      district: '',
      city: '',
    };

  return {
    ...order,
    customerName: sanitizePossiblyMojibakeText(order.customerName, 'Khách hàng'),
    customerEmail: sanitizePossiblyMojibakeText(order.customerEmail),
    customerPhone: sanitizePossiblyMojibakeText(order.customerPhone),
    notes: sanitizePossiblyMojibakeText(order.notes),
    paymentMethod: normalizePaymentMethod(order.paymentMethod),
    paymentStatus: normalizePaymentStatus(order.paymentStatus),
    orderStatus: normalizeOrderStatus(order.orderStatus),
    shippingAddress,
    items: normalizedItems,
  };
};