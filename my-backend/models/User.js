const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  label: { type: String, default: 'Địa chỉ nhà' },
  receiverName: { type: String, default: '' },
  receiverPhone: { type: String, default: '' },
  address: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  addresses: { type: [AddressSchema], default: [] },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  password: String,
  ordersCount: { type: Number, default: 0 },
  totalSpending: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  avatar: String,
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);