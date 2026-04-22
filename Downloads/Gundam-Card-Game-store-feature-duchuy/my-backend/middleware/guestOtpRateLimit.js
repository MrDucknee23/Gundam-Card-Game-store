const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 3;

const requestLog = new Map();

const normalizeKey = (email, phone, ip) => {
  const safeEmail = String(email || '').trim().toLowerCase();
  const safePhone = String(phone || '').trim();
  return `${ip || 'unknown'}:${safeEmail}:${safePhone}`;
};

const pruneOldRequests = (timestamps, now) => timestamps.filter((time) => now - time < WINDOW_MS);

const guestOtpRateLimit = (req, res, next) => {
  const now = Date.now();
  const key = normalizeKey(req.body?.email, req.body?.phone, req.ip);
  const timestamps = pruneOldRequests(requestLog.get(key) || [], now);

  if (timestamps.length >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - (now - timestamps[0])) / 1000));
    res.set('Retry-After', String(retryAfterSeconds));
    return res.status(429).json({
      message: 'Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau ít phút.',
      error: 'guest_otp_rate_limited',
      retryAfterSeconds,
    });
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  return next();
};

module.exports = guestOtpRateLimit;