/**
 * 🔌 REAL-TIME CHAT VIA SOCKET.IO
 * 
 * chatRealtime.js - Cấu hình WebSocket cho instant messaging
 */

// ═══════════════════════════════════════════════════════════════════════════
// SOCKET.IO EVENTS
// ═══════════════════════════════════════════════════════════════════════════

// CLIENT → SERVER
// ───────────────────────────────────────────────────────────────────────────
// socket.emit('join-conversation', { conversationId, userId })
//   - User tham gia vào 1 conversation
//   - Server add user vào room
//
// socket.emit('send-message', { conversationId, userId, content })
//   - Gửi tin nhắn
//   - Server save to DB
//   - Server broadcast to all users in room
//
// socket.emit('typing', { conversationId })
//   - Notify rằng user đang typing
//   - Show "User is typing..." indicator
//
// socket.emit('user-online', { userId })
//   - Notify user đang online
//   - Show green dot next to name
//
// socket.emit('leave-conversation', { conversationId })
//   - User rời khỏi conversation

// ───────────────────────────────────────────────────────────────────────────
// SERVER → CLIENT
// ───────────────────────────────────────────────────────────────────────────
// socket.on('receive-message', (data) => {
//   // data = { messageId, conversationId, userId, content, timestamp }
//   // Add message to chat UI
// })
//
// socket.on('user-typing', (data) => {
//   // data = { userId, conversationId }
//   // Show "User is typing..."
// })
//
// socket.on('user-online', (data) => {
//   // data = { userId }
//   // Show online status
// })
//
// socket.on('user-offline', (data) => {
//   // data = { userId }
//   // Hide online status
// })
//
// socket.on('message-read', (data) => {
//   // data = { messageId }
//   // Mark message as read
// })

// ═══════════════════════════════════════════════════════════════════════════
// IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════

/*
const io = require('socket.io')(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true
  }
});

const chatRealtime = (io) => {
  io.on('connection', (socket) => {
    console.log(`👤 User connected: ${socket.id}`);
    
    // 1. User joins a conversation
    socket.on('join-conversation', ({ conversationId, userId }) => {
      socket.join(`conversation-${conversationId}`);
      socket.to(`conversation-${conversationId}`).emit('user-joined', { userId });
    });
    
    // 2. User sends a message
    socket.on('send-message', async ({ conversationId, userId, content }) => {
      const message = {
        conversationId,
        senderId: userId,
        content,
        timestamp: new Date()
      };
      
      // Save to DB
      await Message.create(message);
      
      // Broadcast to all users in this conversation
      io.to(`conversation-${conversationId}`).emit('receive-message', message);
    });
    
    // 3. User leaves
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`);
    });
  });
};

module.exports = chatRealtime;
*/

// ═══════════════════════════════════════════════════════════════════════════
// FRONTEND USAGE (React with socket.io-client)
// ═══════════════════════════════════════════════════════════════════════════

/*
import io from 'socket.io-client';
import { useEffect, useState } from 'react';

const ChatComponent = ({ conversationId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    // Connect to Socket.io server
    const newSocket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('token') }
    });
    
    setSocket(newSocket);
    
    // Join conversation
    newSocket.emit('join-conversation', { conversationId, userId });
    
    // Listen for new messages
    newSocket.on('receive-message', (message) => {
      setMessages(prev => [...prev, message]);
    });
    
    return () => newSocket.disconnect();
  }, [conversationId]);
  
  const sendMessage = (content) => {
    socket.emit('send-message', { conversationId, userId, content });
  };
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg._id}>{msg.content}</div>
      ))}
      <input onSend={sendMessage} />
    </div>
  );
};

export default ChatComponent;
*/

// ═══════════════════════════════════════════════════════════════════════════
// BENEFITS
// ═══════════════════════════════════════════════════════════════════════════
// ✅ Real-time bi-directional communication
// ✅ No polling needed (better performance)
// ✅ Low latency (WebSocket)
// ✅ Automatic fallback (HTTP long-polling if WebSocket not supported)
// ✅ Built-in rooms for broadcasting
// ✅ Scalable (with Socket.io Adapter for multiple servers)
