const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

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

  const encodedUser = encodeURIComponent(MONGODB_USERNAME);
  const encodedPass = encodeURIComponent(MONGODB_PASSWORD);
  return `mongodb+srv://${encodedUser}:${encodedPass}@${MONGODB_CLUSTER}/${MONGODB_DB_NAME}?retryWrites=true&w=majority`;
};

const logMongoErrorHelp = (err) => {
  const message = String(err?.message || err);

  if (/bad auth|authentication failed/i.test(message)) {
    console.error('Goi y: Sai username/password MongoDB hoac user chua duoc cap quyen cho database.');
    console.error('Goi y: Neu password co ky tu dac biet (@, :, /, ?, #), hay dung MONGODB_USERNAME/MONGODB_PASSWORD de tu dong encode.');
    return;
  }

  if (/ECONNREFUSED|ENOTFOUND|timed out|ServerSelectionError/i.test(message)) {
    console.error('Goi y: Khong the ket noi den MongoDB host. Hay kiem tra URI, mang, hoac da start MongoDB local/Atlas whitelist IP.');
  }
};

app.get('/', (req, res) => {
  res.json({ message: 'Server đang chạy!' });
});

app.use('/api/products', require('./routes/products'));
app.use('/api/products/:productId/reviews', require('./routes/reviews'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
// Thêm route orders
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoUri = buildMongoUri();
    if (!mongoUri) {
      throw new Error('Thieu MONGODB_URI (hoac bo bien roi MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER)');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => console.log(`🚀 Server tại http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Không thể kết nối MongoDB:', err.message || err);
    logMongoErrorHelp(err);
    process.exit(1);
  }
};

startServer();