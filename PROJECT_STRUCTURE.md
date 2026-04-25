# 🤖 Gundam Card Game Store - Cấu Trúc Dự Án

## 📋 Tổng Quan
Đây là một ứng dụng **fullstack** bán thẻ Gundam online với:
- **Backend**: Express.js + MongoDB + Socket.io (chat realtime)
- **Frontend**: React + TypeScript + Vite + Shadcn UI

---

## 📁 Cấu Trúc Thư Mục

### 🔧 **BACKEND** (`my-backend/`)

#### **Core Files**
- **`server.js`** - File khởi động chính (Express app, MongoDB connection, Socket.io)
- **`package.json`** - Dependencies & scripts (dev, build, migrate)

#### **`config/`** - Cấu Hình
- **`passport.js`** - Cấu hình Passport authentication (Google, Facebook)
- **`cloudinary.js`** - Cấu hình upload ảnh lên Cloudinary
- **`env.js`** - Xử lý biến môi trường

#### **`models/`** - Database Schema (Mongoose)
- **`Product.js`** - Schema sản phẩm (tên, giá, ảnh, mô tả)
- **`Category.js`** - Danh mục sản phẩm
- **`User.js`** - User đã đăng ký (email, password hash, cart)
- **`Order.js`** - Đơn hàng (buyer, products, status)
- **`Review.js`** - Đánh giá sản phẩm từ khách
- **`GuestOtp.js`** - OTP cho khách mua hàng (không đăng ký)
- **`Conversation.js`** - Lịch sử chat
- **`Message.js`** - Tin nhắn chat

#### **`routes/`** - API Endpoints
- **`products.js`** - GET, POST, PUT, DELETE products
- **`categories.js`** - Quản lý danh mục
- **`auth.js`** - Đăng ký, đăng nhập (JWT)
- **`users.js`** - Quản lý user (profile, cart)
- **`orders.js`** - API đơn hàng (tạo, xem, cập nhật status)
- **`guest.js`** - API cho khách (OTP, lookup orders)
- **`user.js`** - API user orders
- **`reviews.js`** - API đánh giá
- **`chat.js`** - Chat API
- **`upload.js`** - Upload ảnh endpoint

#### **`controllers/`** - Business Logic
- **`userOrderController.js`** - Xử lý đơn hàng của user đã đăng ký
- **`guestOrderController.js`** - Xử lý đơn hàng khách
- **`guestAuthController.js`** - Xác thực OTP khách

#### **`middleware/`** - Xác Thực & Phân Quyền
- **`auth.js`** - Middleware check JWT
- **`authJwt.js`** - JWT verification
- **`guestOtpRateLimit.js`** - Rate limit OTP requests

#### **`services/`** - Service Logic
- **`userOrderService.js`** - Service xử lý đơn hàng user
- **`guestOrderService.js`** - Service xử lý đơn hàng khách
- **`guestOtpService.js`** - Service OTP (tạo, verify)

#### **`utils/`** - Tiện Ích
- **`mailer.js`** - Gửi email (nodemailer)
- **`imageStorage.js`** - Xử lý lưu trữ ảnh
- **`dbState.js`** - Quản lý trạng thái DB
- **`passwords.js`** - Hash password, verify

#### **`realtime/`** - Real-time Features
- **`chatRealtime.js`** - Socket.io configuration cho chat

#### **`scripts/`** - Utility Scripts
- **`migrateBase64ToFiles.js`** - Chuyển ảnh base64 → files
- **`migrateImagesToCloudinary.js`** - Upload ảnh lên Cloudinary
- **`cleanupLegacyBase64InDb.js`** - Dọn dẹp base64 cũ
- **`migrateLegacyOrdersUserId.js`** - Migrate orders

#### **`seed-*.js`** - Seeding Data
- Tạo dữ liệu giả để test

---

### 🎨 **FRONTEND** (`my-frontend/`)

#### **`src/main.tsx`** - Entry point React app

#### **`src/app/App.tsx`** - Root component

#### **`src/app/routes.ts`** - Định nghĩa tất cả routes (React Router)

#### **`src/app/components/`** - Reusable UI Components
- **`Header.tsx`** - Navigation bar (logo, search, cart, user menu)
- **`Footer.tsx`** - Footer (links, info)
- **`Layout.tsx`** - Main layout wrapper
- **`ProtectedRoute.tsx`** - Route protection (require auth)
- **`CategoryCard.tsx`** - Display category
- **`ProductCard.tsx`** - Display product
- **`EditProductModal.tsx`** - Modal edit product (admin)
- **`FeaturedProducts.tsx`** - Featured products slider
- **`GuestOrderLookupCard.tsx`** - Tìm đơn hàng khách
- **`AdminLayout.tsx`** - Admin layout
- **`ProtectedAdminLayout.tsx`** - Protected admin layout

#### **`src/app/pages/`** - Page Components
- **`Home.tsx`** - Trang chủ (featured, categories)
- **`Shop.tsx`** - Trang cửa hàng (filter, search, sort)
- **`ProductDetail.tsx`** - Chi tiết sản phẩm (ảnh, giá, reviews, add to cart)
- **`Cart.tsx`** - Giỏ hàng
- **`Checkout.tsx`** - Thanh toán (form đặt hàng)
- **`Login.tsx`** - Đăng nhập user
- **`AdminLogin.tsx`** - Đăng nhập admin
- **`AdminDashboard.tsx`** - Dashboard admin
- **`AdminCategories.tsx`** - Quản lý danh mục
- **`ManageProductsEnhanced.tsx`** - Quản lý sản phẩm
- **`AddProduct.tsx`** - Thêm sản phẩm mới
- **`MyOrders.tsx`** - Xem đơn hàng của user
- **`ManageOrders.tsx`** - Admin quản lý tất cả orders
- **`OrderTracking.tsx`** - Theo dõi đơn hàng
- **`OrderDetail.tsx`** - Chi tiết đơn hàng
- **`Profile.tsx`** - Hồ sơ user
- **`FAQ.tsx`** - Câu hỏi thường gặp
- **`About.tsx`** - Về chúng tôi
- **`PurchaseGuide.tsx`** - Hướng dẫn mua hàng

#### **`src/app/context/`** - Global State Management (Context API)
- **`AuthContext.tsx`** - Auth state (user, token, login, logout)
- **`CartContext.tsx`** - Cart state (items, add, remove, total)
- **`ChatContext.tsx`** - Chat state (messages, conversations)

#### **`src/app/hooks/`** - Custom Hooks
- **`useProducts.ts`** - Fetch & manage products
- **`useCategories.ts`** - Fetch & manage categories
- **`useUsers.ts`** - Fetch & manage users
- **`useScrollAnimation.tsx`** - Scroll animation effects

#### **`src/app/utils/`** - Utility Functions
- **`categoryApi.ts`** - API calls cho categories
- **`productApi.ts`** - API calls cho products
- **`reviewApi.ts`** - API calls cho reviews
- **`inboundStorage.ts`** - Local storage helper

#### **`src/app/data/`** - Static Data
- **`products.ts`** - Sample products
- **`orders.ts`** - Sample orders
- **`analytics.ts`** - Sample analytics data

#### **`src/styles/`** - Stylesheets
- **`index.css`** - Global styles
- **`tailwind.css`** - Tailwind imports
- **`theme.css`** - Theme colors
- **`fonts.css`** - Font imports

#### **`vite.config.ts`** - Vite configuration

---

## 🔄 API Flow

### User (Đăng ký/Đăng nhập)
```
POST /api/auth/register → JWT Token
POST /api/auth/login → JWT Token
GET /api/user/profile (JWT) → User data
```

### Products & Categories
```
GET /api/products → Tất cả sản phẩm
GET /api/products/:id → Chi tiết sản phẩm
GET /api/categories → Danh mục
POST /api/products (Admin JWT) → Thêm sản phẩm
PUT /api/products/:id (Admin JWT) → Chỉnh sửa
DELETE /api/products/:id (Admin JWT) → Xóa
```

### Orders (Registered User)
```
POST /api/orders → Tạo đơn hàng
GET /api/user/orders (JWT) → Lịch sử đơn
GET /api/user/orders/:id (JWT) → Chi tiết đơn
```

### Orders (Guest - No Auth)
```
POST /api/guest/orders → Tạo đơn hàng
POST /api/guest/orders/lookup → Tìm đơn hàng (email + OTP)
GET /api/guest/orders → Xem đơn hàng
```

### Chat (Real-time via Socket.io)
```
socket.emit('send-message') → Gửi tin nhắn
socket.on('receive-message') → Nhận tin nhắn
```

---

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **Passport.js** - Authentication (Google, Facebook, JWT)
- **JWT** - Token authentication
- **Multer** - File upload
- **Cloudinary** - Image hosting
- **Socket.io** - Real-time chat
- **Nodemailer** - Email sending
- **Bcrypt** - Password hashing

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Context API** - State management
- **Axios** - HTTP client
- **Recharts** - Charts/Analytics
- **Socket.io-client** - Real-time communication

---

## 🚀 Deployment
- **Render.yaml** - Deployment config (Render hosting)

---

## 📦 Key Features

✅ User authentication (Email, Google, Facebook)  
✅ Product catalog with filtering & search  
✅ Shopping cart & checkout  
✅ Order management (User & Guest)  
✅ Admin dashboard  
✅ Real-time chat (Socket.io)  
✅ Reviews & ratings  
✅ Image upload (Cloudinary)  
✅ Email notifications  
✅ OTP verification for guests  
✅ Analytics & statistics  
✅ Responsive design (Mobile, Tablet, Desktop)  

---

## 🎯 How to Present
1. **Start with the homepage** - Show featured products
2. **Explain user flow** - Registration → Browse → Cart → Checkout
3. **Show admin features** - Product management, order tracking
4. **Demonstrate chat** - Real-time messaging
5. **Show mobile responsiveness** - Mobile view
6. **Explain tech stack** - Backend architecture, Database schema
