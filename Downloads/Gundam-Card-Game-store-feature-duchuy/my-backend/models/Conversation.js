const mongoose = require('mongoose');

const GuestIdentitySchema = new mongoose.Schema({
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
  phone: { type: String, trim: true, default: '' },
}, { _id: false });

const LastMessageSchema = new mongoose.Schema({
  text: { type: String, trim: true, default: '' },
  senderRole: { type: String, enum: ['admin', 'customer'], required: true },
  sentAt: { type: Date, required: true },
}, { _id: false });

const ConversationSchema = new mongoose.Schema({
  customerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  anonSessionId: { type: String, trim: true, default: '', index: true },
  customerGuest: { type: GuestIdentitySchema, default: () => ({}) },
  adminParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null, index: true },
  channel: { type: String, enum: ['website'], default: 'website' },
  status: { type: String, enum: ['open', 'closed'], default: 'open', index: true },
  subject: { type: String, trim: true, default: '' },
  lastMessage: { type: LastMessageSchema, default: null },
  unreadAdminCount: { type: Number, default: 0 },
  unreadCustomerCount: { type: Number, default: 0 },
  lastMessageAt: { type: Date, default: null, index: true },
}, { timestamps: true });

ConversationSchema.index({ customerUser: 1, status: 1, updatedAt: -1 });
ConversationSchema.index({ anonSessionId: 1, status: 1, updatedAt: -1 });
ConversationSchema.index({ 'customerGuest.email': 1, 'customerGuest.phone': 1, updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);