const mongoose = require('mongoose');

const SenderSchema = new mongoose.Schema({
  role: { type: String, enum: ['admin', 'customer'], required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  name: { type: String, trim: true, default: '' },
  email: { type: String, trim: true, lowercase: true, default: '' },
}, { _id: false });

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
  sender: { type: SenderSchema, required: true },
  text: { type: String, trim: true, required: true, maxlength: 4000 },
  sentAt: { type: Date, default: Date.now, index: true },
  readByAdminAt: { type: Date, default: null },
  readByCustomerAt: { type: Date, default: null },
}, { timestamps: true });

MessageSchema.index({ conversationId: 1, sentAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);