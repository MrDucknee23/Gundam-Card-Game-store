const crypto = require('crypto');
const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { isBase64Image } = require('../utils/imageStorage');
const { sendPasswordResetEmail } = require('../utils/mailer');
const { hashPassword, verifyAndUpgradeLegacyPassword } = require('../utils/passwords');

const router = express.Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;
const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;
const DEMO_ADMIN_EMAIL = 'admin@gundamstore.com';
const DEMO_ADMIN_PASSWORD = 'admin123';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const getClientUrl = () => process.env.CLIENT_URL?.trim() || process.env.FRONTEND_URL?.trim() || 'http://localhost:5173';

const normalizeEmail = (value = '') => value.trim().toLowerCase();

const sanitizeUser = (user) => ({
  id: String(user._id),
  email: user.email,
  fullName: user.name || '',
  role: user.role,
  phone: user.phone || '',
  address: user.address || '',
  avatar: user.avatar || '',
  joinDate: user.createdAt,
});

const issueJwt = (user) => jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, getJwtSecret(), {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

const sendAuthResponse = (res, user, statusCode = 200) => {
  const safeUser = sanitizeUser(user);
  const token = issueJwt(user);

  return res.status(statusCode).json({
    token,
    user: safeUser,
    ...safeUser,
  });
};

const getBearerToken = (req) => {
  const authorizationHeader = req.headers.authorization || '';
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

const requireJwtUser = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Thieu token xac thuc' });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ error: 'Phien dang nhap khong hop le' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Tai khoan da bi khoa' });
    }

    req.authUser = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token khong hop le hoac da het han' });
  }
};

const buildSocialSuccessRedirect = (token) => `${getClientUrl()}/auth/callback?token=${encodeURIComponent(token)}`;
const buildSocialFailureRedirect = (reason) => `${getClientUrl()}/login?oauthError=${encodeURIComponent(reason)}`;

const assertValidEmail = (email) => EMAIL_PATTERN.test(normalizeEmail(email));

const ensureDemoAdminUser = async () => {
  const normalizedEmail = normalizeEmail(DEMO_ADMIN_EMAIL);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    let shouldSave = false;

    if (existingUser.role !== 'admin') {
      existingUser.role = 'admin';
      shouldSave = true;
    }

    if (existingUser.status !== 'active') {
      existingUser.status = 'active';
      shouldSave = true;
    }

    if (!existingUser.name) {
      existingUser.name = 'System Administrator';
      shouldSave = true;
    }

    const demoPasswordIsValid = await verifyAndUpgradeLegacyPassword(existingUser, DEMO_ADMIN_PASSWORD);
    if (!demoPasswordIsValid) {
      existingUser.password = await hashPassword(DEMO_ADMIN_PASSWORD);
      shouldSave = true;
    }

    if (shouldSave) {
      await existingUser.save();
    }

    return existingUser;
  }

  const user = new User({
    name: 'System Administrator',
    email: normalizedEmail,
    password: await hashPassword(DEMO_ADMIN_PASSWORD),
    role: 'admin',
    status: 'active',
  });

  await user.save();
  return user;
};

router.get('/me', requireJwtUser, async (req, res) => sendAuthResponse(res, req.authUser));

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!assertValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Email khong hop le' });
    }

    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Mat khau phai co it nhat ${PASSWORD_MIN_LENGTH} ky tu` });
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email da ton tai' });
    }

    const user = new User({
      name: `${firstName || ''} ${lastName || ''}`.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      phone: phone || '',
      address: address || '',
      role: 'customer',
      status: 'active',
    });

    await user.save();
    return sendAuthResponse(res, user, 201);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { password } = req.body;

    if (!assertValidEmail(normalizedEmail) || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Email hoac mat khau khong hop le' });
    }

    if (normalizedEmail === DEMO_ADMIN_EMAIL && password === DEMO_ADMIN_PASSWORD) {
      const demoAdmin = await ensureDemoAdminUser();
      return sendAuthResponse(res, demoAdmin);
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ error: 'Email hoac mat khau khong dung' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ error: 'Tai khoan da bi khoa' });
    }

    const passwordIsValid = await verifyAndUpgradeLegacyPassword(user, password);

    if (!passwordIsValid) {
      return res.status(401).json({ error: 'Email hoac mat khau khong dung' });
    }

    return sendAuthResponse(res, user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Google OAuth chua duoc cau hinh' });
  }

  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (error, user, info) => {
    if (error || !user) {
      const failureReason = error?.oauthReason || info?.message || 'google_login_failed';
      return res.redirect(buildSocialFailureRedirect(failureReason));
    }

    if (user.status === 'blocked') {
      return res.redirect(buildSocialFailureRedirect('account_blocked'));
    }

    const token = issueJwt(user);
    return res.redirect(buildSocialSuccessRedirect(token));
  })(req, res, next);
});

router.get('/facebook', (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(503).json({ error: 'Facebook OAuth chua duoc cau hinh' });
  }

  return passport.authenticate('facebook', { scope: ['email'], session: false })(req, res, next);
});

router.get('/facebook/callback', (req, res, next) => {
  passport.authenticate('facebook', { session: false }, (error, user, info) => {
    if (error || !user) {
      const failureReason = error?.oauthReason || info?.message || 'facebook_login_failed';
      return res.redirect(buildSocialFailureRedirect(failureReason));
    }

    if (user.status === 'blocked') {
      return res.redirect(buildSocialFailureRedirect('account_blocked'));
    }

    const token = issueJwt(user);
    return res.redirect(buildSocialSuccessRedirect(token));
  })(req, res, next);
});

router.post('/forgot-password', async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!assertValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: 'Email khong hop le' });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({ message: 'Neu email ton tai, chung toi da gui huong dan dat lai mat khau.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    await user.save();

    const resetLink = `${getClientUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name || user.email,
      resetLink,
    });

    return res.json({ message: 'Neu email ton tai, chung toi da gui huong dan dat lai mat khau.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Khong the gui email dat lai mat khau luc nay' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (typeof token !== 'string' || token.trim() === '') {
      return res.status(400).json({ error: 'Token dat lai mat khau khong hop le' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `Mat khau moi phai co it nhat ${PASSWORD_MIN_LENGTH} ky tu` });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Token dat lai mat khau khong hop le hoac da het han' });
    }

    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = '';
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({ message: 'Dat lai mat khau thanh cong' });
  } catch (error) {
    return res.status(500).json({ error: 'Khong the dat lai mat khau luc nay' });
  }
});

router.put('/profile/:id', async (req, res) => {
  try {
    const { fullName, phone, address, avatar } = req.body;

    if (avatar !== undefined && typeof avatar === 'string' && isBase64Image(avatar)) {
      return res.status(400).json({ error: 'Avatar base64 khong con duoc ho tro. Vui long su dung duong dan anh hop le hoac de trong.' });
    }

    const updateFields = { phone, address };
    if (fullName !== undefined) updateFields.name = fullName;
    if (avatar !== undefined) updateFields.avatar = avatar;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Khong tim thay nguoi dung' });
    }

    return res.json(sanitizeUser(user));
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;