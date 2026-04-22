const express = require('express');
const { uploadProductImages, normalizeUploadPublicPath } = require('../utils/imageStorage');

const router = express.Router();

router.post('/', uploadProductImages.fields([
  { name: 'image', maxCount: 9 },
  { name: 'images', maxCount: 9 },
]), (req, res) => {
  const requestFiles = req.files && !Array.isArray(req.files)
    ? [...(req.files.image || []), ...(req.files.images || [])]
    : Array.isArray(req.files) ? req.files : [];
  const files = requestFiles.slice(0, 9);
  const uploadedFiles = files
    .map((file) => normalizeUploadPublicPath(`/uploads/${file.filename}`))
    .filter((filePath) => filePath !== '');

  res.status(201).json({
    files: uploadedFiles,
    imageUrl: uploadedFiles[0] || '',
  });
});

module.exports = router;