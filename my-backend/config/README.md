/**
 * ⚙️ BACKEND CONFIG & UTILS
 * 
 * Cấu hình và tiện ích cho backend
 */

// ═══════════════════════════════════════════════════════════════════════════
// config/passport.js
// ═══════════════════════════════════════════════════════════════════════════
// Cấu hình Passport.js authentication strategies
// 
// Strategies:
// 1. Google OAuth
//    - Strategy: passport-google-oauth20
//    - Callback: Google ID → find/create user → JWT token
//    - Config: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//
// 2. Facebook OAuth
//    - Strategy: passport-facebook
//    - Callback: Facebook ID → find/create user → JWT token
//    - Config: FACEBOOK_APP_ID, FACEBOOK_APP_SECRET
//
// 3. Local (Email/Password)
//    - Strategy: custom
//    - Verify: email exists, password correct → JWT token
//
// Usage in routes:
// passport.authenticate('google')      - start Google OAuth flow
// passport.authenticate('facebook')    - start Facebook OAuth flow

// ═══════════════════════════════════════════════════════════════════════════
// config/cloudinary.js
// ═══════════════════════════════════════════════════════════════════════════
// Cấu hình upload ảnh lên Cloudinary
// 
// Setup:
// - CLOUDINARY_NAME
// - CLOUDINARY_API_KEY
// - CLOUDINARY_API_SECRET
//
// Features:
// - Auto-resize/optimize images
// - Serve from CDN
// - Image transformations (crop, quality, format)
//
// Usage:
// multer + multer-storage-cloudinary → upload ảnh → get secure URL

// ═══════════════════════════════════════════════════════════════════════════
// config/env.js
// ═══════════════════════════════════════════════════════════════════════════
// Quản lý biến môi trường
// - Load từ .env file
// - Validate required variables
// - Provide defaults
// - Error nếu missing critical vars

// ═══════════════════════════════════════════════════════════════════════════
// utils/mailer.js
// ═══════════════════════════════════════════════════════════════════════════
// Gửi email qua Nodemailer
//
// Usage:
// - sendOrderConfirmation(email, orderId)    - Email xác nhận order
// - sendOtpEmail(email, otp)                 - Email OTP cho guest
// - sendResetPasswordEmail(email, token)     - Email reset password
// - sendNotification(email, title, content)  - Email thông báo
//
// Config: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
// hoặc Google Gmail OAuth

// ═══════════════════════════════════════════════════════════════════════════
// utils/imageStorage.js
// ═══════════════════════════════════════════════════════════════════════════
// Xử lý lưu trữ ảnh
//
// Strategies:
// 1. Cloudinary (production) - upload lên cloud
// 2. Local File System (development) - lưu vào /uploads folder
// 3. Base64 (legacy) - encode ảnh thành string
//
// Methods:
// - saveImage(file, folder)       - Lưu ảnh
// - deleteImage(imagePath)        - Xóa ảnh
// - getImageUrl(imagePath)        - Lấy URL ảnh
// - optimizeImage(file)           - Resize/compress

// ═══════════════════════════════════════════════════════════════════════════
// utils/passwords.js
// ═══════════════════════════════════════════════════════════════════════════
// Hash & verify passwords
//
// Methods:
// - hashPassword(plaintext)       - Hash password → store in DB
// - verifyPassword(plaintext, hash) - Kiểm tra password đúng không
// - generateSecurePassword()      - Tạo random password
//
// Lib: bcrypt v6
// Rounds: 10 (salt rounds)

// ═══════════════════════════════════════════════════════════════════════════
// utils/dbState.js
// ═══════════════════════════════════════════════════════════════════════════
// Quản lý trạng thái database connection
//
// Methods:
// - isConnected()                 - Check nếu MongoDB connected
// - getConnectionStatus()         - Status string
// - handleConnectionError(err)    - Error handling
// - reconnect()                   - Kết nối lại

// ═══════════════════════════════════════════════════════════════════════════
// Environment Variables Required:
// ═══════════════════════════════════════════════════════════════════════════
// MONGODB_URI                     - hoặc: MONGODB_USERNAME, PASSWORD, CLUSTER
// JWT_SECRET                      - Secret key cho JWT
// GUEST_OTP_JWT_SECRET            - Secret cho guest OTP
// GOOGLE_CLIENT_ID                - Google OAuth
// GOOGLE_CLIENT_SECRET
// FACEBOOK_APP_ID                 - Facebook OAuth
// FACEBOOK_APP_SECRET
// CLOUDINARY_NAME                 - Cloudinary
// CLOUDINARY_API_KEY
// CLOUDINARY_API_SECRET
// SMTP_HOST                       - Email
// SMTP_PORT
// SMTP_USER
// SMTP_PASSWORD
// PORT                            - Server port (default: 5000)
// NODE_ENV                        - development/production
