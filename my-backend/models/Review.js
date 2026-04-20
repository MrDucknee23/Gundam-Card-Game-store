const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  userAvatar: { type: String, default: '' },
  role:       { type: String, enum: ['customer', 'admin', 'super_admin'], default: 'customer' },
  content:    { type: String, required: true },
}, { timestamps: true });

const reviewSchema = new mongoose.Schema({
  productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  userId:     { type: String, required: true },
  userName:   { type: String, required: true },
  userAvatar: { type: String, default: '' },
  stars:      { type: Number, required: true, min: 1, max: 5 },
  content:    { type: String, required: true },
  readByAdmin:{ type: Boolean, default: false },
  replies:    [replySchema],
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
