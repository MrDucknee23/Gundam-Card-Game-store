const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const compression = require('compression');
const cors = require('cors');
const multer = require('multer');
const passport = require('passport');
require('dotenv').config();

if (!process.env.GUEST_OTP_JWT_SECRET?.trim()) {
  if (process.env.JWT_SECRET?.trim()) {
    process.env.GUEST_OTP_JWT_SECRET = process.env.JWT_SECRET.trim();
    console.warn('⚠️ GUEST_OTP_JWT_SECRET is missing, fallback to JWT_SECRET');
  } else {
    console.error('❌ Missing GUEST_OTP_JWT_SECRET and JWT_SECRET');
    process.exit(1);
  }
}

const configurePassport = require('./config/passport');
const { initChatRealtime } = require('./realtime/chatRealtime');

const app = express();
const httpServer = http.createServer(app);
const JSON_BODY_LIMIT = '5mb';

configurePassport(passport);

app.use(cors());
app.use(compression());
app.use(express.json({ limit: JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

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
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/guest', require('./routes/guest'));
app.use('/api/user', require('./routes/user'));

// Fallback direct bindings để tránh 404 khi môi trường chạy bị lệch route mount.
// Vẫn dùng đúng controller/middleware hiện tại, KHÔNG đổi logic phân quyền.
const authJwt = require('./middleware/authJwt');
const userOrderController = require('./controllers/userOrderController');
const guestOrderController = require('./controllers/guestOrderController');
app.get('/api/user/orders', authJwt, userOrderController.listOrders);
app.get('/api/user/orders/:id', authJwt, userOrderController.getOrderDetail);
app.get('/api/guest/orders', guestOrderController.listOrders);
app.get('/api/guest/orders/:id', guestOrderController.getOrderDetail);

// Thêm route orders
app.use('/api/orders', require('./routes/orders'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/upload', require('./routes/upload'));

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        message: 'Kich thuoc moi tep anh khong duoc vuot qua 5MB',
        error: 'upload_file_too_large',
      });
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        message: 'Toi da 9 tep anh cho moi lan upload',
        error: 'upload_file_count_exceeded',
      });
    }

    return res.status(400).json({
      message: err.message || 'Upload tep anh that bai',
      error: 'upload_invalid_file',
    });
  }

  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      message: `Du lieu tai len vuot qua gioi han ${JSON_BODY_LIMIT}. Vui long giam kich thuoc hoac so luong hinh anh.`,
      error: 'payload_too_large',
    });
  }

  if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, 'body')) {
    return res.status(400).json({
      message: 'Du lieu JSON khong hop le',
      error: 'invalid_json',
    });
  }

  console.error('Unexpected API error:', {
    path: req.originalUrl,
    method: req.method,
    message: err?.message || err,
  });

  return res.status(500).json({
    message: 'Loi may chu noi bo',
    error: 'internal_server_error',
  });
});

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

    const chatRealtime = initChatRealtime(httpServer);
    app.set('chatRealtime', chatRealtime);

    httpServer.listen(PORT, () => console.log(`🚀 Server tại http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Không thể kết nối MongoDB:', err.message || err);
    logMongoErrorHelp(err);
    process.exit(1);
  }
};

startServer();