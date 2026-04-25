/**
 * 🎮 BACKEND ROUTES & CONTROLLERS
 * 
 * Routes: Định nghĩa API endpoints
 * Controllers: Xử lý business logic cho mỗi endpoint
 */

// ═══════════════════════════════════════════════════════════════════════════
// PRODUCTS ROUTES & CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════
// GET    /api/products              - Lấy tất cả products (filter, search, sort)
// GET    /api/products/:id          - Lấy chi tiết 1 product
// POST   /api/products              - Admin: Tạo product mới
// PUT    /api/products/:id          - Admin: Cập nhật product
// DELETE /api/products/:id          - Admin: Xóa product

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORIES ROUTES
// ═══════════════════════════════════════════════════════════════════════════
// GET    /api/categories            - Lấy tất cả categories
// GET    /api/categories/:id        - Lấy chi tiết 1 category
// POST   /api/categories            - Admin: Tạo category mới
// PUT    /api/categories/:id        - Admin: Cập nhật category
// DELETE /api/categories/:id        - Admin: Xóa category

// ═══════════════════════════════════════════════════════════════════════════
// AUTHENTICATION ROUTES
// ═══════════════════════════════════════════════════════════════════════════
// POST   /api/auth/register         - Đăng ký tài khoản email/password
// POST   /api/auth/login            - Đăng nhập email/password → JWT token
// POST   /api/auth/google           - Đăng nhập Google OAuth
// POST   /api/auth/facebook         - Đăng nhập Facebook OAuth
// POST   /api/auth/logout           - Đăng xuất
// POST   /api/auth/refresh          - Làm mới JWT token

// ═══════════════════════════════════════════════════════════════════════════
// USERS ROUTES (Registered User)
// ═══════════════════════════════════════════════════════════════════════════
// GET    /api/user/profile          - Lấy thông tin profile (JWT required)
// PUT    /api/user/profile          - Cập nhật profile
// GET    /api/user/orders           - Lấy lịch sử orders của user
// GET    /api/user/orders/:id       - Lấy chi tiết 1 order
// POST   /api/user/cart/add         - Thêm sản phẩm vào giỏ hàng
// POST   /api/user/cart/remove      - Xóa sản phẩm khỏi giỏ hàng

// ═══════════════════════════════════════════════════════════════════════════
// GUEST ROUTES (Unregistered User)
// ═══════════════════════════════════════════════════════════════════════════
// POST   /api/guest/orders          - Khách tạo đơn hàng
// GET    /api/guest/orders          - Khách xem đơn hàng (email + OTP)
// POST   /api/guest/otp/send        - Gửi OTP đến email
// POST   /api/guest/otp/verify      - Xác minh OTP

// ═══════════════════════════════════════════════════════════════════════════
// ORDERS ROUTES (Admin Management)
// ═══════════════════════════════════════════════════════════════════════════
// GET    /api/orders                - Admin: Lấy tất cả orders
// GET    /api/orders/:id            - Admin: Lấy chi tiết 1 order
// PUT    /api/orders/:id/status     - Admin: Cập nhật status order
// DELETE /api/orders/:id            - Admin: Xóa order

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWS ROUTES
// ═══════════════════════════════════════════════════════════════════════════
// GET    /api/reviews?productId=xxx - Lấy reviews cho 1 product
// POST   /api/reviews               - User thêm review mới
// PUT    /api/reviews/:id           - User cập nhật review
// DELETE /api/reviews/:id           - User xóa review

// ═══════════════════════════════════════════════════════════════════════════
// CHAT ROUTES (Real-time via Socket.io)
// ═══════════════════════════════════════════════════════════════════════════
// POST   /api/chat/conversations    - Lấy danh sách conversations
// POST   /api/chat/messages         - Lấy messages của conversation
// Socket.emit: send-message, receive-message, user-joined, user-left

// ═══════════════════════════════════════════════════════════════════════════
// UPLOAD ROUTES
// ═══════════════════════════════════════════════════════════════════════════
// POST   /api/upload/images         - Upload ảnh lên Cloudinary (multipart/form-data)
