const fs = require('fs');
const path = require('path');
const multer = require('multer');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const ensureUploadsDirExists = () => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
};

const sanitizeFilenamePart = (value) => value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'image';

const buildStoredFilename = (originalName = 'image') => {
  const extension = path.extname(originalName).toLowerCase() || '.bin';
  const nameWithoutExtension = path.basename(originalName, extension);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${sanitizeFilenamePart(nameWithoutExtension)}-${uniqueSuffix}${extension}`;
};

ensureUploadsDirExists();

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    ensureUploadsDirExists();
    callback(null, UPLOADS_DIR);
  },
  filename: (_req, file, callback) => {
    callback(null, buildStoredFilename(file.originalname));
  },
});

const fileFilter = (_req, file, callback) => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    const error = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
    error.message = 'Chi ho tro tep anh JPG, PNG, WEBP hoac GIF';
    callback(error);
    return;
  }

  callback(null, true);
};

const uploadProductImages = multer({
  storage,
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

  const uploadsSegmentIndex = trimmedValue.indexOf('/uploads/');
  const normalizedValue = uploadsSegmentIndex >= 0
    ? trimmedValue.slice(uploadsSegmentIndex)
    : trimmedValue;

  const withoutQuery = normalizedValue.split('?')[0].split('#')[0].replace(/\\/g, '/');
  const dedupedSlashes = withoutQuery.replace(/\/+/g, '/');

  if (!dedupedSlashes.startsWith('/uploads/')) {
    return '';
  }

  const filename = path.posix.basename(dedupedSlashes);
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    return '';
  }

  return `/uploads/${filename}`;
};

const isBase64Image = (value) => typeof value === 'string' && /^data:image\//i.test(value.trim());

const isStoredUploadPath = (value) => normalizeUploadPublicPath(value) !== '';

const getAbsoluteUploadPath = (publicPath) => {
  const normalizedPath = normalizeUploadPublicPath(publicPath);

  if (!normalizedPath) {
    return '';
  }

  return path.join(UPLOADS_DIR, path.posix.basename(normalizedPath));
};

const deleteUploadFile = async (publicPath) => {
  const absolutePath = getAbsoluteUploadPath(publicPath);

  if (!absolutePath) {
    return;
  }

  try {
    await fs.promises.unlink(absolutePath);
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
};

module.exports = {
  MAX_IMAGE_FILE_SIZE_BYTES,
  UPLOADS_DIR,
  ensureUploadsDirExists,
  uploadProductImages,
  normalizeUploadPublicPath,
  isBase64Image,
  isStoredUploadPath,
  deleteUploadFile,
};