const express = require('express');
const jwt = require('jsonwebtoken');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { verifyGuestAccessToken } = require('../services/guestOtpService');

const router = express.Router();
const ANON_SESSION_HEADER = 'x-anon-session-id';
const CHAT_USER_PROFILE_SELECT = 'name email';
const MAX_ANON_MESSAGES_PER_MINUTE = 20;
const anonMessageRateWindowMs = 60 * 1000;
const anonMessageRateState = new Map();

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw Object.assign(new Error('JWT_SECRET is not configured'), { statusCode: 500 });
  }

  return secret;
};

const isAdminRole = (role) => role === 'admin' || role === 'super_admin';

const getBearerToken = (req) => {
  const authorizationHeader = req.headers.authorization || '';
  if (!authorizationHeader.startsWith('Bearer ')) {
    return '';
  }

  return authorizationHeader.slice('Bearer '.length).trim();
};

const sanitizeAnonSessionId = (value) => {
  const rawValue = typeof value === 'string' ? value.trim() : '';
  if (!rawValue) {
    return '';
  }

  if (!/^[a-zA-Z0-9_-]{8,80}$/.test(rawValue)) {
    return '';
  }

  return rawValue;
};

const assertAnonymousRateLimit = (req, actor) => {
  if (!actor.isAnonymous || !actor.anonSessionId) {
    return;
  }

  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const key = `${actor.anonSessionId}:${ip}`;
  const now = Date.now();
  const current = anonMessageRateState.get(key);

  if (!current || now - current.start > anonMessageRateWindowMs) {
    anonMessageRateState.set(key, { start: now, count: 1 });
    return;
  }

  if (current.count >= MAX_ANON_MESSAGES_PER_MINUTE) {
    throw Object.assign(new Error('Bạn gửi tin nhắn quá nhanh, vui lòng thử lại sau ít phút'), { statusCode: 429 });
  }

  current.count += 1;
  anonMessageRateState.set(key, current);
};

const resolveChatActor = async (req) => {
  const authToken = getBearerToken(req);
  if (authToken) {
    const payload = jwt.verify(authToken, getJwtSecret());
    const user = await User.findById(payload.sub).select('_id email role name status').lean();

    if (!user) {
      throw Object.assign(new Error('Phiên đăng nhập không hợp lệ'), { statusCode: 401 });
    }

    if (user.status === 'blocked') {
      throw Object.assign(new Error('Tài khoản đã bị khóa'), { statusCode: 403 });
    }

    return {
      type: isAdminRole(user.role) ? 'admin' : 'customer',
      userId: String(user._id),
      name: user.name || user.email,
      email: user.email,
    };
  }

  const guestAccessToken = typeof req.headers['x-guest-access-token'] === 'string'
    ? req.headers['x-guest-access-token'].trim()
    : '';

  const anonSessionId = sanitizeAnonSessionId(req.headers[ANON_SESSION_HEADER]);

  if (anonSessionId) {
    return {
      type: 'customer',
      userId: null,
      anonSessionId,
      isAnonymous: true,
      name: req.headers['x-guest-name'] ? String(req.headers['x-guest-name']).trim() : 'Khách guest',
      email: '',
      phone: '',
    };
  }

  if (!guestAccessToken) {
    throw Object.assign(new Error('Thiếu token xác thực chat'), { statusCode: 401 });
  }

  const guest = verifyGuestAccessToken(guestAccessToken);
  return {
    type: 'customer',
    userId: null,
    anonSessionId: '',
    isAnonymous: false,
    name: req.headers['x-guest-name'] ? String(req.headers['x-guest-name']).trim() : guest.email,
    email: guest.email,
    phone: guest.phone,
  };
};

const buildConversationFilter = (actor) => {
  if (actor.type === 'admin') {
    return {};
  }

  if (actor.userId) {
    return { customerUser: actor.userId };
  }

  if (actor.anonSessionId) {
    return {
      customerUser: null,
      anonSessionId: actor.anonSessionId,
    };
  }

  return {
    customerUser: null,
    'customerGuest.email': actor.email,
    'customerGuest.phone': actor.phone,
  };
};

const getCustomerProfile = (customerUser) => {
  if (!customerUser || typeof customerUser !== 'object') {
    return null;
  }

  const name = typeof customerUser.name === 'string' ? customerUser.name.trim() : '';
  const email = typeof customerUser.email === 'string' ? customerUser.email.trim() : '';

  if (!name && !email) {
    return null;
  }

  return {
    name,
    email,
  };
};

const serializeConversation = (conversation) => ({
  id: String(conversation._id),
  customerUser: conversation.customerUser
    ? typeof conversation.customerUser === 'object'
      ? String(conversation.customerUser._id)
      : String(conversation.customerUser)
    : null,
  customerProfile: getCustomerProfile(conversation.customerUser),
  anonSessionId: conversation.anonSessionId || '',
  customerGuest: conversation.customerGuest || { name: '', email: '', phone: '' },
  adminParticipants: Array.isArray(conversation.adminParticipants)
    ? conversation.adminParticipants.map((participant) => String(participant))
    : [],
  orderId: conversation.orderId ? String(conversation.orderId) : null,
  channel: conversation.channel,
  status: conversation.status,
  subject: conversation.subject || '',
  lastMessage: conversation.lastMessage,
  unreadAdminCount: conversation.unreadAdminCount || 0,
  unreadCustomerCount: conversation.unreadCustomerCount || 0,
  lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
  createdAt: conversation.createdAt,
  updatedAt: conversation.updatedAt,
});

const serializeMessage = (message) => ({
  id: String(message._id),
  conversationId: String(message.conversationId),
  sender: {
    role: message.sender.role,
    userId: message.sender.userId ? String(message.sender.userId) : null,
    name: message.sender.name || '',
    email: message.sender.email || '',
  },
  text: message.text,
  sentAt: message.sentAt,
  readByAdminAt: message.readByAdminAt,
  readByCustomerAt: message.readByCustomerAt,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt,
});

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const isGuestPlaceholderName = (value) => {
  if (!hasText(value)) {
    return true;
  }

  const normalized = String(value).trim().toLowerCase();
  return normalized === 'khach vang lai' || normalized === 'khách guest';
};

const buildCustomerGuestFromActor = (actor, payload = {}) => ({
  name: hasText(payload.customerName) ? payload.customerName.trim() : (actor.name || ''),
  email: actor.email || '',
  phone: actor.phone || '',
});

const ensureConversationForActor = async (actor, payload = {}) => {
  const baseFilter = buildConversationFilter(actor);
  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  const orderId = typeof payload.orderId === 'string' && payload.orderId.trim() ? payload.orderId.trim() : null;

  let conversation = await Conversation.findOne({
    ...baseFilter,
    status: 'open',
    ...(orderId ? { orderId } : {}),
  }).sort({ updatedAt: -1 }).populate('customerUser', CHAT_USER_PROFILE_SELECT);

  if (!conversation) {
    conversation = await Conversation.create({
      customerUser: actor.userId || null,
      anonSessionId: actor.anonSessionId || '',
      customerGuest: buildCustomerGuestFromActor(actor, payload),
      adminParticipants: [],
      orderId,
      channel: 'website',
      status: 'open',
      subject,
      unreadAdminCount: 0,
      unreadCustomerCount: 0,
      lastMessageAt: new Date(),
    });

    if (actor.userId) {
      await conversation.populate('customerUser', CHAT_USER_PROFILE_SELECT);
    }
  } else if (actor.userId) {
    // Backfill old conversations so admin can always see account name/email for logged-in users
    const nextGuest = buildCustomerGuestFromActor(actor, payload);
    const shouldBackfillName = isGuestPlaceholderName(conversation.customerGuest?.name) && hasText(nextGuest.name);
    const shouldBackfillEmail = !hasText(conversation.customerGuest?.email) && hasText(nextGuest.email);
    const shouldBackfillPhone = !hasText(conversation.customerGuest?.phone) && hasText(nextGuest.phone);
    if (shouldBackfillName || shouldBackfillEmail || shouldBackfillPhone) {
      conversation.customerGuest = {
        ...(conversation.customerGuest || {}),
        ...(shouldBackfillName ? { name: nextGuest.name } : {}),
        ...(shouldBackfillEmail ? { email: nextGuest.email } : {}),
        ...(shouldBackfillPhone ? { phone: nextGuest.phone } : {}),
      };
      await conversation.save();
    }
  }

  return conversation;
};

router.get('/conversations', async (req, res) => {
  try {
    const actor = await resolveChatActor(req);
    const filter = buildConversationFilter(actor);
    const conversations = await Conversation.find(filter)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(actor.type === 'admin' ? 100 : 20)
      .populate('customerUser', CHAT_USER_PROFILE_SELECT)
      .lean();
    res.json(conversations.map(serializeConversation));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.post('/conversations/ensure', async (req, res) => {
  try {
    const actor = await resolveChatActor(req);
    const conversation = await ensureConversationForActor(actor, req.body || {});
    res.status(201).json(serializeConversation(conversation));
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const actor = await resolveChatActor(req);
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      ...buildConversationFilter(actor),
    }).populate('customerUser', CHAT_USER_PROFILE_SELECT).lean();

    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort({ sentAt: 1 }).limit(200).lean();
    return res.json({
      conversation: serializeConversation(conversation),
      messages: messages.map(serializeMessage),
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const actor = await resolveChatActor(req);
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      return res.status(400).json({ message: 'Nội dung tin nhắn không được để trống' });
    }

    assertAnonymousRateLimit(req, actor);

    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      ...buildConversationFilter(actor),
    }).populate('customerUser', CHAT_USER_PROFILE_SELECT);

    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
    }

    const sentAt = new Date();
    if (actor.userId) {
      const nextGuest = buildCustomerGuestFromActor(actor);
      const shouldBackfillName = isGuestPlaceholderName(conversation.customerGuest?.name) && hasText(nextGuest.name);
      const shouldBackfillEmail = !hasText(conversation.customerGuest?.email) && hasText(nextGuest.email);
      if (shouldBackfillName || shouldBackfillEmail) {
        conversation.customerGuest = {
          ...(conversation.customerGuest || {}),
          ...(shouldBackfillName ? { name: nextGuest.name } : {}),
          ...(shouldBackfillEmail ? { email: nextGuest.email } : {}),
        };
      }
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: {
        role: actor.type === 'admin' ? 'admin' : 'customer',
        userId: actor.userId,
        name: actor.name,
        email: actor.email,
      },
      text,
      sentAt,
      readByAdminAt: actor.type === 'admin' ? sentAt : null,
      readByCustomerAt: actor.type === 'customer' ? sentAt : null,
    });

    conversation.lastMessage = {
      text,
      senderRole: actor.type === 'admin' ? 'admin' : 'customer',
      sentAt,
    };
    conversation.lastMessageAt = sentAt;
    if (actor.type === 'admin') {
      conversation.unreadCustomerCount += 1;
      conversation.unreadAdminCount = 0;
      if (actor.userId && !conversation.adminParticipants.some((participant) => String(participant) === actor.userId)) {
        conversation.adminParticipants.push(actor.userId);
      }
    } else {
      conversation.unreadAdminCount += 1;
      conversation.unreadCustomerCount = 0;
    }

    await conversation.save();

    if (req.app.get('chatRealtime')) {
      req.app.get('chatRealtime').emitMessage(conversation, message);
    }

    return res.status(201).json({
      conversation: serializeConversation(conversation),
      message: serializeMessage(message),
      serverTime: sentAt.toISOString(),
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
});

router.post('/conversations/:conversationId/read', async (req, res) => {
  try {
    const actor = await resolveChatActor(req);
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      ...buildConversationFilter(actor),
    }).populate('customerUser', CHAT_USER_PROFILE_SELECT);

    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
    }

    const now = new Date();
    if (actor.type === 'admin') {
      await Message.updateMany(
        { conversationId: conversation._id, 'sender.role': 'customer', readByAdminAt: null },
        { $set: { readByAdminAt: now } }
      );
      conversation.unreadAdminCount = 0;
    } else {
      await Message.updateMany(
        { conversationId: conversation._id, 'sender.role': 'admin', readByCustomerAt: null },
        { $set: { readByCustomerAt: now } }
      );
      conversation.unreadCustomerCount = 0;
    }

    await conversation.save();
    return res.json({ conversation: serializeConversation(conversation), serverTime: now.toISOString() });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
});

module.exports = router;