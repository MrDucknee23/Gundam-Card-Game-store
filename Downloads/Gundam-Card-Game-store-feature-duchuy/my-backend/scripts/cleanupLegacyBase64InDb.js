const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { ensureUploadsDirExists, normalizeUploadPublicPath, UPLOADS_DIR } = require('../utils/imageStorage');

const BASE64_IMAGE_REGEX = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/i;
const REMOVE_FROM_ARRAY = Symbol('REMOVE_FROM_ARRAY');

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

const extensionByMimeType = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const isPlainObject = (value) => Object.prototype.toString.call(value) === '[object Object]';
const isMongoSpecialValue = (value) => {
  if (value == null) {
    return false;
  }

  if (value instanceof Date) {
    return true;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return true;
  }

  if (Buffer.isBuffer(value)) {
    return true;
  }

  if (typeof value === 'object' && typeof value._bsontype === 'string') {
    return true;
  }

  return false;
};

const parseBase64Image = (value) => {
  const match = typeof value === 'string' ? value.match(BASE64_IMAGE_REGEX) : null;

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], 'base64'),
  };
};

const writeImageBuffer = async (buffer, mimeType) => {
  const extension = extensionByMimeType[mimeType] || 'bin';
  const filename = `cleanup-${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const absolutePath = path.join(UPLOADS_DIR, filename);
  await fs.promises.writeFile(absolutePath, buffer);
  return `/uploads/${filename}`;
};

const summarizePath = (pathParts) => pathParts.length > 0 ? pathParts.join('.') : '(root)';

const cleanNode = async (value, options) => {
  const { collectionName, pathParts, dryRun, insideArray, touchedPaths } = options;

  if (pathParts[pathParts.length - 1] === '_id' || isMongoSpecialValue(value)) {
    return { nextValue: value, changed: false, findings: 0 };
  }

  if (typeof value === 'string') {
    const normalizedUploadPath = normalizeUploadPublicPath(value);
    if (normalizedUploadPath && normalizedUploadPath !== value) {
      return { nextValue: normalizedUploadPath, changed: true, findings: 0 };
    }

    const parsedImage = parseBase64Image(value);
    if (!parsedImage) {
      return { nextValue: value, changed: false, findings: 0 };
    }

    const currentPath = summarizePath(pathParts);
    touchedPaths.push(currentPath);

    if (collectionName === 'products' && pathParts[0] === 'images') {
      const uploadedPath = dryRun ? '/uploads/dry-run-placeholder.png' : await writeImageBuffer(parsedImage.buffer, parsedImage.mimeType);
      return { nextValue: uploadedPath, changed: true, findings: 1 };
    }

    return { nextValue: insideArray ? REMOVE_FROM_ARRAY : '', changed: true, findings: 1 };
  }

  if (Array.isArray(value)) {
    let changed = false;
    let findings = 0;
    const nextItems = [];

    for (let index = 0; index < value.length; index += 1) {
      const result = await cleanNode(value[index], {
        collectionName,
        pathParts: [...pathParts, String(index)],
        dryRun,
        insideArray: true,
        touchedPaths,
      });

      changed = changed || result.changed;
      findings += result.findings;

      if (result.nextValue !== REMOVE_FROM_ARRAY) {
        nextItems.push(result.nextValue);
      }
    }

    if (collectionName === 'products' && pathParts[0] === 'images') {
      const dedupedItems = Array.from(new Set(nextItems.filter((item) => typeof item === 'string' && item.trim() !== '')));
      const arrayChanged = changed || dedupedItems.length !== value.length;
      return { nextValue: dedupedItems, changed: arrayChanged, findings };
    }

    return { nextValue: nextItems, changed, findings };
  }

  if (isPlainObject(value)) {
    let changed = false;
    let findings = 0;
    const nextObject = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      const result = await cleanNode(nestedValue, {
        collectionName,
        pathParts: [...pathParts, key],
        dryRun,
        insideArray: false,
        touchedPaths,
      });

      nextObject[key] = result.nextValue;
      changed = changed || result.changed;
      findings += result.findings;
    }

    return { nextValue: nextObject, changed, findings };
  }

  return { nextValue: value, changed: false, findings: 0 };
};

const main = async () => {
  const dryRun = process.argv.includes('--dry-run');
  const mongoUri = buildMongoUri();

  if (!mongoUri) {
    throw new Error('Thieu cau hinh ket noi MongoDB trong .env');
  }

  ensureUploadsDirExists();
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  const database = mongoose.connection.db;
  const collections = await database.listCollections({}, { nameOnly: true }).toArray();

  const summary = {
    dryRun,
    scannedCollections: 0,
    scannedDocuments: 0,
    modifiedDocuments: 0,
    base64Findings: 0,
    perCollection: {},
  };

  for (const collectionInfo of collections) {
    const collectionName = collectionInfo.name;
    const collection = database.collection(collectionName);
    const cursor = collection.find({});

    summary.scannedCollections += 1;
    summary.perCollection[collectionName] = {
      scanned: 0,
      modified: 0,
      findings: 0,
      touchedPaths: {},
    };

    while (await cursor.hasNext()) {
      const document = await cursor.next();
      if (!document) {
        continue;
      }

      summary.scannedDocuments += 1;
      summary.perCollection[collectionName].scanned += 1;

      const touchedPaths = [];
      const result = await cleanNode(document, {
        collectionName,
        pathParts: [],
        dryRun,
        insideArray: false,
        touchedPaths,
      });

      if (result.findings === 0) {
        continue;
      }

      summary.base64Findings += result.findings;
      summary.perCollection[collectionName].findings += result.findings;

      touchedPaths.forEach((touchedPath) => {
        summary.perCollection[collectionName].touchedPaths[touchedPath] = (summary.perCollection[collectionName].touchedPaths[touchedPath] || 0) + 1;
      });

      if (result.changed) {
        summary.modifiedDocuments += 1;
        summary.perCollection[collectionName].modified += 1;

        if (!dryRun) {
          await collection.replaceOne({ _id: document._id }, result.nextValue, { upsert: false });
        }
      }
    }
  }

  await mongoose.disconnect();

  console.log(JSON.stringify(summary, null, 2));
};

main().catch(async (error) => {
  console.error(error.message || error);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});