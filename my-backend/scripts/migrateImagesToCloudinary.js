const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Product = require('../models/Product');
const { getCloudinary } = require('../config/cloudinary');
const { UPLOADS_DIR, normalizeUploadPublicPath } = require('../utils/imageStorage');

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

const isCloudinaryUrl = (value) => /^https?:\/\/res\.cloudinary\.com\//i.test(String(value || '').trim());

const getLegacyUploadAbsolutePath = (value) => {
  const normalizedPath = normalizeUploadPublicPath(value);
  if (!normalizedPath || !normalizedPath.startsWith('/uploads/')) {
    return '';
  }

  const fileName = path.posix.basename(normalizedPath);
  return path.join(UPLOADS_DIR, fileName);
};

const uploadToCloudinary = async (absolutePath, fileName) => {
  const cloudinary = getCloudinary();
  const folder = process.env.CLOUDINARY_PRODUCT_FOLDER || 'gundam-store/products';

  const result = await cloudinary.uploader.upload(absolutePath, {
    folder,
    resource_type: 'image',
    public_id: `legacy-${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`,
    overwrite: false,
  });

  return result.secure_url;
};

const migrateImages = async () => {
  const mongoUri = buildMongoUri();
  if (!mongoUri) {
    throw new Error('Thieu cau hinh ket noi MongoDB (MONGODB_URI hoac MONGODB_USERNAME/MONGODB_PASSWORD/MONGODB_CLUSTER)');
  }

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;
  let failed = 0;
  let touchedProducts = 0;

  const cursor = Product.find().cursor();

  for await (const product of cursor) {
    const currentImages = Array.isArray(product.images) ? product.images : [];
    if (currentImages.length === 0) {
      skipped += 1;
      continue;
    }

    let hasChanges = false;
    const nextImages = [];

    for (const image of currentImages) {
      const imageValue = String(image || '').trim();
      if (!imageValue) {
        continue;
      }

      if (isCloudinaryUrl(imageValue)) {
        nextImages.push(imageValue);
        skipped += 1;
        continue;
      }

      const absolutePath = getLegacyUploadAbsolutePath(imageValue);
      if (!absolutePath) {
        nextImages.push(imageValue);
        skipped += 1;
        continue;
      }

      const fileExists = fs.existsSync(absolutePath);
      const fileName = path.basename(absolutePath);

      if (!fileExists) {
        console.warn(`File not found: ${fileName}`);
        nextImages.push(imageValue);
        missing += 1;
        continue;
      }

      try {
        const cloudinaryUrl = await uploadToCloudinary(absolutePath, fileName);
        nextImages.push(cloudinaryUrl);
        hasChanges = true;
        uploaded += 1;
        console.log(`Uploaded: ${fileName}`);
      } catch (error) {
        console.error(`Upload failed: ${fileName} - ${error.message || error}`);
        nextImages.push(imageValue);
        failed += 1;
      }
    }

    if (hasChanges) {
      product.images = Array.from(new Set(nextImages));
      await product.save();
      touchedProducts += 1;
    }
  }

  console.log('\nSummary');
  console.log(`Products updated: ${touchedProducts}`);
  console.log(`Uploaded: ${uploaded}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`File not found: ${missing}`);
  console.log(`Failed: ${failed}`);

  await mongoose.disconnect();
};

migrateImages().catch(async (error) => {
  console.error(`Migration failed: ${error.message || error}`);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});
