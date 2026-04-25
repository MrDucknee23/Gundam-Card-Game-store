/**
 * 📦 BACKEND MODELS
 * 
 * Định nghĩa Mongoose schemas cho tất cả collections trong MongoDB
 * Mỗi model tương ứng với một collection và định nghĩa structure của dữ liệu
 */

// Product.js
// - Đại diện cho một sản phẩm Gundam Card
// - Fields: name, price, description, image, category, stock, ratings, reviews
// - Methods: validate product data, calculate average rating

// Category.js
// - Danh mục sản phẩm (Rare, Super Rare, Ultra Rare, Secret Rare)
// - Fields: name, description, icon
// - Relationships: Products (1 category -> many products)

// User.js
// - Tài khoản user đã đăng ký
// - Fields: email, password (hashed), firstName, lastName, phone, address
// - Authentication: Google OAuth, Facebook OAuth, Email/Password
// - Cart: array of { productId, quantity }

// Order.js
// - Đơn hàng từ user hoặc guest
// - Fields: orderId, buyerId, items (products + quantities), totalPrice, status, createdAt
// - Status: pending, processing, shipped, delivered
// - Relationships: User (nếu registered), Products

// GuestOtp.js
// - One-Time Password cho khách hàng mua hàng không đăng ký
// - Fields: email, otp, expiresAt, attempts
// - Dùng để xác thực identity khi lookup order

// Conversation.js
// - Lịch sử chat giữa customer và support
// - Fields: conversationId, participants, createdAt, updatedAt
// - Relationships: Messages (1 conversation -> many messages)

// Message.js
// - Tin nhắn trong một conversation
// - Fields: conversationId, senderId, content, timestamp, isRead
// - Real-time: được emit qua Socket.io

// Review.js
// - Đánh giá và comment từ customer cho product
// - Fields: productId, userId, rating (1-5), comment, images
// - Relationships: Product, User
