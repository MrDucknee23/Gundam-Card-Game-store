const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true }, // gundam, pokemon, onepiece
  images: [{ type: String }],
  brand: { type: String },
  scale: { type: String },
  grade: { type: String },
  cardType: { type: String },
  series: { type: String },
  rarity: { type: String },
  condition: { type: String },
  featured: { type: Boolean, default: false },
  isPreorder: { type: Boolean, default: false },
  releaseDate: { type: String },
  specifications: [{ name: String, value: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);