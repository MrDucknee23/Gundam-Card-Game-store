const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  password: { type: String, default: '' },
  ordersCount: { type: Number, default: 0 },
  totalSpending: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  avatar: { type: String, default: '' },
  googleId: { type: String, sparse: true, index: true },
  facebookId: { type: String, sparse: true, index: true },
  resetPasswordToken: { type: String, default: '' },
  resetPasswordExpires: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);