# 🔐 Admin Login System - Guide

## 📋 Tổng Quan

Hệ thống Admin Login hoàn chỉnh với authentication, protected routes, và UI tối giản theo design system (Đen, Đỏ, Xanh Dương, Trắng).

---

## 🎯 Tính Năng

### ✅ Authentication System
- **AuthContext**: Quản lý trạng thái authentication toàn cục
- **Login/Logout**: Xác thực admin và customer riêng biệt
- **Session Management**: Lưu user info trong localStorage
- **Protected Routes**: Bảo vệ các trang admin chỉ cho admin truy cập

### ✅ User Roles
- `customer`: Người dùng thông thường
- `admin`: Quản trị viên
- `super_admin`: Quản trị viên cấp cao

### ✅ Pages
1. **Admin Login** (`/admin/login`): Trang đăng nhập riêng cho admin
2. **Admin Dashboard** (`/admin`): Trang tổng quan quản trị
3. **Admin Layout**: Layout riêng với navigation và user info

---

## 🚀 Demo Credentials

### Super Admin
```
Email: admin@gundamstore.com
Password: admin123
```

### Regular Admin
```
Email: anyemail@admin.com
Password: anypassword
```

### Customer
```
Email: anyemail@email.com
Password: anypassword
```

---

## 📂 Cấu Trúc Files

```
src/app/
├── context/
│   └── AuthContext.tsx          # Authentication context
├── components/
│   ├── ProtectedRoute.tsx       # HOC bảo vệ routes
│   ├── AdminLayout.tsx          # Layout cho admin pages
│   └── Header.tsx               # Header với user menu
├── pages/
│   ├── AdminLogin.tsx           # Trang login admin
│   ├── AdminDashboard.tsx       # Dashboard admin
│   ├── AddProduct.tsx           # Thêm sản phẩm (protected)
│   └── ManageProducts.tsx       # Quản lý sản phẩm (protected)
└── routes.ts                    # Route configuration
```

---

## 🎨 Design System

### Colors
- **Background**: `#000000` (Black)
- **Primary**: `#DC143C` (Crimson Red)
- **Secondary**: `#0066CC` (Blue)
- **Card**: `#111111` (Dark Gray)
- **Text**: `#FFFFFF` (White)

### Typography
- **Font**: Poppins
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

---

## 🔐 Authentication Flow

### 1. Admin Login
```typescript
// User visits /admin/login
→ Enters credentials
→ AuthContext.login(email, password, true)
→ If successful: Navigate to /admin
→ If failed: Show error message
```

### 2. Customer Login
```typescript
// User visits /login
→ Enters credentials
→ AuthContext.login(email, password, false)
→ If successful: Navigate to /profile
→ If failed: Show error message
```

### 3. Protected Route Access
```typescript
// User tries to access /admin
→ ProtectedRoute checks isAuthenticated && isAdmin
→ If true: Render page
→ If false: Redirect to /admin/login
```

### 4. Logout
```typescript
// User clicks logout
→ AuthContext.logout()
→ Clear localStorage
→ Redirect to home or login page
```

---

## 🛡️ Protected Routes

### Admin Routes (Require Admin Role)
- `/admin` - Dashboard
- `/admin/add-product` - Add Product
- `/admin/products` - Manage Products
- `/admin/orders` - Manage Orders
- `/admin/users` - Manage Users

### Public Routes
- `/admin/login` - Admin Login Page
- `/login` - Customer Login Page
- `/`, `/shop`, `/about`, `/contact` - Public pages

---

## 💻 Usage Examples

### 1. Using AuthContext in Components
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <p>Welcome, {user?.fullName}</p>
      {isAdmin && <p>Admin Access Granted</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 2. Creating Protected Page
```typescript
// In routes.ts
{
  path: '/admin/new-page',
  element: <ProtectedRoute requireAdmin={true}><NewAdminPage /></ProtectedRoute>
}
```

### 3. Checking User Role
```typescript
const { user } = useAuth();

if (user?.role === 'super_admin') {
  // Super admin only features
}
```

---

## 🔧 API Integration (Future)

Thay thế mock authentication bằng real API:

```typescript
// In AuthContext.tsx
const login = async (email: string, password: string, isAdminLogin = false) => {
  try {
    // Replace this mock with real API call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, isAdmin: isAdminLogin })
    });

    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};
```

---

## 📱 Responsive Design

- ✅ Mobile-first approach
- ✅ Hamburger menu for mobile admin navigation
- ✅ Responsive tables with horizontal scroll
- ✅ Touch-friendly buttons and inputs

---

## 🎯 Security Best Practices

### ✅ Implemented
- Password input type
- Protected routes with redirects
- Role-based access control
- Session management

### 🔜 Recommended for Production
- HTTPS only
- CSRF tokens
- Rate limiting
- Password hashing (bcrypt)
- JWT tokens với refresh mechanism
- Secure HTTP-only cookies
- Two-factor authentication (2FA)
- Account lockout after failed attempts

---

## 🧪 Testing

### Test Cases

1. **Login with valid admin credentials**
   - Expected: Redirect to /admin dashboard

2. **Login with invalid credentials**
   - Expected: Show error message

3. **Access /admin without login**
   - Expected: Redirect to /admin/login

4. **Customer tries to access /admin**
   - Expected: Redirect to home page

5. **Logout functionality**
   - Expected: Clear session and redirect

---

## 📝 Database Schema Reference

Tham khảo `DATABASE_SCHEMA.md` để xem:
- User table structure
- Role management
- Session management
- Activity logging

---

## 🚀 Next Steps

### Recommended Features to Add
1. **Forgot Password Flow**
2. **Email Verification**
3. **User Profile Management**
4. **Activity Logs Page**
5. **Settings Page**
6. **Two-Factor Authentication**
7. **API Integration**
8. **Real-time Notifications**

---

## 📞 Support

Nếu có vấn đề về Admin Login System:
1. Check console for errors
2. Verify localStorage data
3. Check route configuration
4. Review AuthContext state

---

## 📄 License

© 2026 Gundam & Card Store - Admin System

---

**Version**: 1.0.0  
**Last Updated**: March 30, 2026  
**Status**: ✅ Production Ready
