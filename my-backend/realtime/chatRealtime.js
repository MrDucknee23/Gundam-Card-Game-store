const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyGuestAccessToken } = require('../services/guestOtpService');

const isAdminRole = (role) => role === 'admin' || role === 'super_admin';
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

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
};

const getConversationCustomerProfile = (customerUser, message) => {
  if (!customerUser || typeof customerUser !== 'object') {
    if (
      message
      && message.sender
      && message.sender.role === 'customer'
      && message.sender.userId
      && (message.sender.name || message.sender.email)
    ) {
      return {
        name: message.sender.name || '',
        email: message.sender.email || '',
      };
    }

    return null;
  }

  const name = typeof customerUser.name === 'string' ? customerUser.name.trim() : '';
  const email = typeof customerUser.email === 'string' ? customerUser.email.trim() : '';
  if (!name && !email) {
    return null;
  }

  return { name, email };
};

const serializeRealtimeConversation = (conversation, message) => ({
  id: String(conversation._id),
  customerUser: conversation.customerUser
    ? typeof conversation.customerUser === 'object'
      ? String(conversation.customerUser._id)
      : String(conversation.customerUser)
    : null,
  customerProfile: getConversationCustomerProfile(conversation.customerUser, message),
  anonSessionId: conversation.anonSessionId || '',
  customerGuest: conversation.customerGuest || { name: '', email: '', phone: '' },
  subject: conversation.subject || '',
  unreadAdminCount: conversation.unreadAdminCount || 0,
  unreadCustomerCount: conversation.unreadCustomerCount || 0,
  lastMessage: conversation.lastMessage || null,
  lastMessageAt: conversation.lastMessageAt || conversation.updatedAt,
  updatedAt: conversation.updatedAt,
});

const buildActorRooms = (actor) => {
  if (actor.type === 'admin') {
    return ['admins'];
  }

  if (actor.userId) {
    return [`customer:${actor.userId}`];
  }

  if (actor.anonSessionId) {
    return [`anon:${actor.anonSessionId}`];
  }

  return [`guest:${actor.email}:${actor.phone || ''}`];
};

const initChatRealtime = (httpServer) => {
  const allowedOrigin = process.env.FRONTEND_URL || process.env.CLIENT_URL || '*';
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Render proxy: phải handshake qua polling trước, sau đó mới upgrade lên websocket
    transports: ['polling', 'websocket'],
    allowEIO3: true,
  });

  io.use(async (socket, next) => {
    try {
      const authToken = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
      if (authToken) {
        const payload = jwt.verify(authToken, getJwtSecret());
        const user = await User.findById(payload.sub).select('_id email role name status').lean();

        if (!user) {
          return next(new Error('auth_user_not_found'));
        }

        if (user.status === 'blocked') {
          return next(new Error('auth_user_blocked'));
        }

        socket.data.actor = {
          type: isAdminRole(user.role) ? 'admin' : 'customer',
          userId: String(user._id),
          email: user.email,
          name: user.name || user.email,
        };

        return next();
      }

      const guestToken = socket.handshake.auth?.guestAccessToken || socket.handshake.headers['x-guest-access-token'];
      const anonSessionId = sanitizeAnonSessionId(
        socket.handshake.auth?.anonSessionId || socket.handshake.headers['x-anon-session-id']
      );

      if (anonSessionId) {
        socket.data.actor = {
          type: 'customer',
          userId: null,
          anonSessionId,
          email: '',
          phone: '',
          name: socket.handshake.auth?.guestName || 'Khách guest',
        };

        return next();
      }

      if (!guestToken) {
        return next(new Error('auth_token_missing'));
      }

      const guest = verifyGuestAccessToken(String(guestToken).trim());
      socket.data.actor = {
        type: 'customer',
        userId: null,
        anonSessionId: '',
        email: guest.email,
        phone: guest.phone,
        name: socket.handshake.auth?.guestName || guest.email,
      };

      return next();
    } catch (error) {
      return next(new Error('auth_token_invalid'));
    }
  });

  io.on('connection', (socket) => {
    const actor = socket.data.actor;
    buildActorRooms(actor).forEach((room) => socket.join(room));

    socket.on('chat:join-conversation', (conversationId) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('chat:leave-conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      if (!conversationId) {
        return;
      }

      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        conversationId,
        actor: {
          type: actor.type,
          name: actor.name,
        },
        isTyping: Boolean(isTyping),
        serverTime: new Date().toISOString(),
      });
    });

    socket.on('chat:read', ({ conversationId }) => {
      if (!conversationId) {
        return;
      }

      socket.to(`conversation:${conversationId}`).emit('chat:read', {
        conversationId,
        actor: { type: actor.type },
        serverTime: new Date().toISOString(),
      });
    });
  });

  return {
    io,
    emitMessage(conversation, message) {
      const conversationId = String(conversation._id);
      const payload = {
        conversationId,
        conversation: serializeRealtimeConversation(conversation, message),
        message: {
          id: String(message._id),
          conversationId,
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
        },
        serverTime: new Date().toISOString(),
      };

      io.to(`conversation:${conversationId}`).emit('chat:message', payload);
      io.to('admins').emit('chat:conversation-updated', payload);

      if (conversation.customerUser) {
        io.to(`customer:${String(conversation.customerUser)}`).emit('chat:conversation-updated', payload);
      } else if (conversation.anonSessionId) {
        io.to(`anon:${conversation.anonSessionId}`).emit('chat:conversation-updated', payload);
      } else if (conversation.customerGuest?.email) {
        io.to(`guest:${conversation.customerGuest.email}:${conversation.customerGuest.phone || ''}`).emit('chat:conversation-updated', payload);
      }
    },
  };
};

module.exports = { initChatRealtime };