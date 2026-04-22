const mongoose = require('mongoose');

const attributeOptionSchema = new mongoose.Schema({
  value: { type: String, required: true, trim: true },
  label: { type: String, required: true, trim: true },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const attributeGroupSchema = new mongoose.Schema({
  key: { type: String, trim: true, lowercase: true, default: '' },
  label: { type: String, trim: true, default: '' },
  options: { type: [attributeOptionSchema], default: [] },
  isActive: { type: Boolean, default: true },
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  label: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  attributeGroup: { type: attributeGroupSchema, default: undefined },
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
