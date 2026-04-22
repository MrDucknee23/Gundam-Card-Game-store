/**
 * Middleware xác thực JWT cho user đã đăng nhập.
 * Đặt cả req.user và req.authUser từ JWT đã verify.
 * Route dùng middleware này KHÔNG được nhận userId/email từ client.
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const authJwt = async (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization || '';
    if (!authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Thiếu token xác thực', error: 'auth_token_missing' });
    }

    const token = authorizationHeader.slice('Bearer '.length).trim();
    const payload = jwt.verify(token, getJwtSecret());

    const user = await User.findById(payload.sub).lean();
    if (!user) {
      return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ', error: 'auth_user_not_found' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Tài khoản đã bị khóa', error: 'auth_user_blocked' });
    }

    const normalizedUser = {
      userId: String(user._id),
      id: String(user._id),
      email: user.email,
      role: user.role,
    };

    // Chuẩn hóa theo 2 convention để code cũ và code mới cùng hoạt động.
    req.user = normalizedUser;
    req.authUser = normalizedUser;

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn', error: 'auth_token_invalid' });
  }
};

module.exports = authJwt;
