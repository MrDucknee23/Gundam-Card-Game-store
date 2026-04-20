const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
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

orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderCode: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Order', orderSchema);