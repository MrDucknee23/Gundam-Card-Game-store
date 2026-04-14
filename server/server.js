const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

if (!mongoUri) {
  console.error('❌ Lỗi: MONGODB_URI chưa được cấu hình trong server/.env');
  process.exit(1);
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Server đang chạy!' });
});
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));

// Kết nối MongoDB và khởi động server
const connectWithRetry = async (retryCount = 0) => {
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      family: 4,
    });
    console.log('✅ MongoDB connected');

    const server = app.listen(port, () =>
      console.log(`🚀 Server tại http://localhost:${port}`)
    );

    const shutdown = async () => {
      console.log('🛑 Shutting down server...');
      server.close(async () => {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected. Goodbye.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error(`❌ Lỗi kết nối MongoDB (lần ${retryCount + 1}):`, err.message || err);
    if (retryCount < 2) {
      const delay = 2000 * (retryCount + 1);
      console.log(`⏳ Thử lại sau ${delay / 1000}s...`);
      setTimeout(() => connectWithRetry(retryCount + 1), delay);
    } else {
      console.error('❌ Không thể kết nối MongoDB sau nhiều lần thử.');
      process.exit(1);
    }
  }
};

connectWithRetry();