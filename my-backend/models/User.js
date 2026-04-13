const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  password: String,
  ordersCount: { type: Number, default: 0 },
  totalSpending: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  avatar: String,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);