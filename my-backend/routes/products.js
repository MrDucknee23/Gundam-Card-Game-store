const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Lấy tất cả sản phẩm
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Lấy 1 sản phẩm theo id
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.json(product);
});

module.exports = router;