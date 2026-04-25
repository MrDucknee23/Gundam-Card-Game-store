const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { getCloudinary, hasCloudinaryEnv } = require('../config/cloudinary');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const ensureUploadsDirExists = () => {
  // Local upload storage is intentionally disabled in production.
  return UPLOADS_DIR;
};

const toCloudinaryPublicId = (originalName = 'image') => {
  const extension = path.extname(originalName).toLowerCase();
  const nameWithoutExtension = path.basename(originalName, extension);
  const safeName = nameWithoutExtension.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'image';
  return `${safeName}-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
};

const storage = hasCloudinaryEnv()
  ? new CloudinaryStorage({
    cloudinary: getCloudinary(),
    params: async (_req, file) => ({
      folder: process.env.CLOUDINARY_PRODUCT_FOLDER || 'gundam-store/products',
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: toCloudinaryPublicId(file.originalname),
    }),
  })
  : null;

const fileFilter = (_req, file, callback) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
    error.message = 'Chi ho tro tep anh JPG, PNG hoac WEBP';
    callback(error);
    return;
  }

  callback(null, true);
};

const uploadProductImages = multer({
  storage: storage || multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_FILE_SIZE_BYTES,
    files: 9,
  },
});

const normalizeUploadPublicPath = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return '';
  }

  if (/^data:image\//i.test(trimmedValue)) {
    return '';
  }

  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  const uploadsSegmentIndex = trimmedValue.indexOf('/uploads/');
  if (uploadsSegmentIndex < 0) {
    return '';
  }

  const withoutQuery = trimmedValue
    .slice(uploadsSegmentIndex)
    .split('?')[0]
    .split('#')[0]
    .replace(/\\/g, '/');

  const dedupedSlashes = withoutQuery.replace(/\/+/g, '/');
  if (!dedupedSlashes.startsWith('/uploads/')) {
    return '';
  }

  const filename = path.posix.basename(dedupedSlashes);
  return /^[a-zA-Z0-9._-]+$/.test(filename) ? `/uploads/${filename}` : '';
};

const isBase64Image = (value) => typeof value === 'string' && /^data:image\//i.test(value.trim());

const isStoredUploadPath = (value) => normalizeUploadPublicPath(value) !== '';

const getAbsoluteUploadPath = (publicPath) => {
  const normalizedPath = normalizeUploadPublicPath(publicPath);

  if (!normalizedPath || !normalizedPath.startsWith('/uploads/')) {
    return '';
  }

  return path.join(UPLOADS_DIR, path.posix.basename(normalizedPath));
};

const deleteUploadFile = async (publicPath) => {
  // Local delete is intentionally disabled (no ephemeral filesystem dependency).
  return publicPath;
};

module.exports = {
  MAX_IMAGE_FILE_SIZE_BYTES,
  UPLOADS_DIR,
  ALLOWED_IMAGE_MIME_TYPES,
  hasCloudinaryEnv,
  ensureUploadsDirExists,
  uploadProductImages,
  normalizeUploadPublicPath,
  isBase64Image,
  isStoredUploadPath,
  deleteUploadFile,
};