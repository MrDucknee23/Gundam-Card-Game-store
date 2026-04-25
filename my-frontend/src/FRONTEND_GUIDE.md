/**
 * 🎨 FRONTEND STRUCTURE
 * 
 * React + TypeScript + Vite + Tailwind CSS + Shadcn UI
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTS (Reusable UI)
// ═══════════════════════════════════════════════════════════════════════════

// Layout Components
// Header.tsx       - Navigation bar (logo, search, menu, user icon, cart)
// Footer.tsx       - Footer (links, social media, info)
// Layout.tsx       - Main wrapper layout
// AdminLayout.tsx  - Admin dashboard layout

// Page Components
// Home.tsx              - Trang chủ (hero, featured products, categories)
// Shop.tsx              - Danh sách sản phẩm (filter, search, sort, pagination)
// ProductDetail.tsx     - Chi tiết sản phẩm (images, price, reviews, add-to-cart)
// Cart.tsx              - Giỏ hàng (items, quantity, total, checkout button)
// Checkout.tsx          - Form đặt hàng (shipping, payment info)
// OrderTracking.tsx     - Theo dõi order (status, delivery info)
// Profile.tsx           - Hồ sơ user (info, addresses, preferences)

// Authentication Pages
// Login.tsx             - Đăng nhập user (email, password, Google/FB login)
// AdminLogin.tsx        - Đăng nhập admin (email, password)

// Admin Pages
// AdminDashboard.tsx    - Admin tổng quan (stats, charts, quick actions)
// AdminCategories.tsx   - Quản lý danh mục (CRUD)
// ManageProductsEnhanced.tsx - Quản lý sản phẩm (table, search, edit, delete)
// AddProduct.tsx        - Form thêm sản phẩm mới
// ManageOrders.tsx      - Quản lý orders (update status, view details)

// Customer Pages
// MyOrders.tsx          - Xem lịch sử orders của user
// OrderDetail.tsx       - Chi tiết 1 order

// Info Pages
// FAQ.tsx               - Câu hỏi thường gặp
// About.tsx             - Về chúng tôi
// PurchaseGuide.tsx     - Hướng dẫn mua hàng

// UI Components (from Shadcn)
// CategoryCard.tsx      - Card hiển thị category
// ProductCard.tsx       - Card hiển thị product (image, name, price, rating)
// FeaturedProducts.tsx  - Slider featured products
// GuestOrderLookupCard.tsx - Card tìm order khách hàng
// DeleteConfirmModal.tsx - Modal xác nhận xóa
// EditProductModal.tsx  - Modal chỉnh sửa sản phẩm
// Breadcrumb.tsx        - Breadcrumb navigation
// ProtectedRoute.tsx    - HOC bảo vệ routes (require auth)
// ProtectedAdminLayout.tsx - HOC bảo vệ admin routes

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT (Global State Management)
// ═══════════════════════════════════════════════════════════════════════════

// AuthContext.tsx
// - Quản lý trạng thái authentication
// - State: currentUser, isLoggedIn, token, userRole (user/admin)
// - Methods: login(), logout(), register(), updateProfile()

// CartContext.tsx
// - Quản lý giỏ hàng
// - State: items[], totalPrice, totalQuantity
// - Methods: addToCart(), removeFromCart(), updateQuantity(), clearCart()

// ChatContext.tsx
// - Quản lý chat real-time
// - State: conversations[], messages[], currentConversation
// - Methods: sendMessage(), loadMessages(), createConversation()

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOKS
// ═══════════════════════════════════════════════════════════════════════════

// useProducts.ts
// - Hook fetch & manage products
// - Methods: getProducts(), getProductById(), searchProducts(), filterProducts()

// useCategories.ts
// - Hook fetch & manage categories
// - Methods: getCategories(), getCategoryById()

// useUsers.ts
// - Hook manage user data
// - Methods: getUsers(), getUserById(), updateUser()

// useScrollAnimation.tsx
// - Hook for scroll animations
// - Fade-in, slide-in effects on scroll

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES & API CALLS
// ═══════════════════════════════════════════════════════════════════════════

// productApi.ts
// - API calls: getProducts, getProductById, createProduct, updateProduct, deleteProduct

// categoryApi.ts
// - API calls: getCategories, getCategoryById, createCategory, updateCategory

// reviewApi.ts
// - API calls: getReviews, createReview, updateReview, deleteReview

// inboundStorage.ts
// - Local storage helper: save/get cart, user, theme preferences

// ═══════════════════════════════════════════════════════════════════════════
// STYLING
// ═══════════════════════════════════════════════════════════════════════════

// Tailwind CSS      - Utility-first CSS framework
// Shadcn UI         - Pre-built accessible components
// Custom CSS        - Global styles, animations, themes
// Responsive Design - Mobile-first approach
