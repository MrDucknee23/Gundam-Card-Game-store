const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const { UPLOADS_DIR, ensureUploadsDirExists, normalizeUploadPublicPath } = require('../utils/imageStorage');

const buildMongoUri = () => {
  if (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) {
    return process.env.MONGODB_URI.trim();
  }

  const {
    MONGODB_USERNAME,
    MONGODB_PASSWORD,
    MONGODB_CLUSTER,
    MONGODB_DB_NAME = 'gundam-store',
  } = process.env;

  if (!MONGODB_USERNAME || !MONGODB_PASSWORD || !MONGODB_CLUSTER) {
    return '';
  }

  return `mongodb+srv://${encodeURIComponent(MONGODB_USERNAME)}:${encodeURIComponent(MONGODB_PASSWORD)}@${MONGODB_CLUSTER}/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;
};

const parseBase64Image = (image) => {
  const match = image.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
};

const extensionByMimeType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const writeImageBuffer = async (buffer, mimeType) => {
  const extension = extensionByMimeType[mimeType] || 'bin';
  const filename = `migrated-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const absolutePath = path.join(UPLOADS_DIR, filename);

  await fs.promises.writeFile(absolutePath, buffer);
  return `/uploads/${filename}`;
};

const migrate = async () => {
  const mongoUri = buildMongoUri();

  if (!mongoUri) {
    throw new Error('Thieu cau hinh ket noi MongoDB trong .env');
  }

  ensureUploadsDirExists();
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  let migratedProducts = 0;
  let skippedProducts = 0;
  let failedProducts = 0;

  const products = await Product.find().cursor();

  for await (const product of products) {
    try {
      const currentImages = Array.isArray(product.images) ? product.images : [];
      let changed = false;
      const nextImages = [];

      for (const image of currentImages) {
        if (typeof image !== 'string' || image.trim() === '') {
          continue;
        }

        const normalizedPath = normalizeUploadPublicPath(image);
        if (normalizedPath) {
          nextImages.push(normalizedPath);
          continue;
        }

        const parsedImage = parseBase64Image(image.trim());
        if (!parsedImage) {
          continue;
        }

        const uploadedPath = await writeImageBuffer(parsedImage.buffer, parsedImage.mimeType);
        nextImages.push(uploadedPath);
        changed = true;
      }

      const dedupedImages = Array.from(new Set(nextImages));

      if (!changed) {
        skippedProducts += 1;
        continue;
      }

      product.images = dedupedImages;
      await product.save();
      migratedProducts += 1;
      console.log(`Migrated product ${product._id}: ${dedupedImages.length} image(s)`);
    } catch (error) {
      failedProducts += 1;
      console.error(`Failed to migrate product ${product?._id}:`, error.message || error);
    }
  }

  await mongoose.disconnect();

  console.log('\nMigration summary');
  console.log(`Migrated: ${migratedProducts}`);
  console.log(`Skipped: ${skippedProducts}`);
  console.log(`Failed: ${failedProducts}`);
};

migrate().catch(async (error) => {
  console.error('Migration failed:', error.message || error);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});