const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  // userId được dùng để phân biệt đơn hàng của user đã đăng nhập và guest.
  // - userId != null → đơn hàng user (chỉ truy vấn qua JWT)
  // - userId == null → đơn hàng guest (chỉ truy vấn qua OTP + guest token)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  orderCode: { type: String },
  customer: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String }
  },
  totalAmount: { type: Number, required: true, default: 0 },
  subtotal: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  paymentStatus: { type: String, default: 'Chưa thanh toán' },
  orderStatus: { type: String, default: 'Đang xử lý' },
  paymentMethod: { type: String, default: 'cod' },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
      productImage: { type: String }
    }
  ],
  history: [{
    note: { type: String },
    date: { type: Date, default: Date.now }
  }],
  paidAt: { type: Date }
}, { timestamps: true });

orderSchema.pre('validate', function syncUserFields(next) {
  if (this.user && !this.userId) {
    this.userId = this.user;
  }

  if (this.userId && !this.user) {
    this.user = this.userId;
  }

  if (!this.user && !this.userId) {
    this.user = null;
    this.userId = null;
  }

  next();
});

orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderCode: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);