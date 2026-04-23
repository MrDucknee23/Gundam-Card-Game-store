# Deployment Guide - Render

Hướng dẫn chi tiết để deploy Gundam Card Game Store lên Render.com

## Yêu cầu

- GitHub account (code đã push lên GitHub)
- Render account (free tier có thể dùng được)
- MongoDB URI (MongoDB Atlas)
- Google OAuth credentials (optional)
- Facebook OAuth credentials (optional)

## Bước 1: Chuẩn bị Repository

Đảm bảo code đã được push lên GitHub:

```bash
git status
git push origin main
```

## Bước 2: Tạo Render Account & Connect GitHub

1. Truy cập [render.com](https://render.com)
2. Đăng ký hoặc đăng nhập
3. Kết nối GitHub account:
   - Vào Dashboard → GitHub
   - Click "Connect account"
   - Authorize Render

## Bước 3: Deploy Backend

### 3.1 Tạo Web Service

1. Vào [render.com/dashboard](https://render.com/dashboard)
2. Click **"+ New"** → **"Web Service"**
3. Chọn repository: `Gundam-Card-Game-store`
4. Điền thông tin:
   - **Name**: `gundam-store-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd my-backend && npm install`
   - **Start Command**: `cd my-backend && npm start`
   - **Plan**: Chọn **"Free"** hoặc **"Starter Plus"** (nếu muốn hiệu suất tốt hơn)

### 3.2 Cấu hình Environment Variables

Trong trang tạo Web Service, cuộn xuống tìm mục **"Environment"**:

Thêm các biến sau:

| Key | Value | Ghi chú |
|-----|-------|---------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/gundam-store` | Lấy từ MongoDB Atlas |
| `JWT_SECRET` | Một string dài ngẫu nhiên | Tạo secret mạnh: `openssl rand -base64 32` |
| `GUEST_OTP_JWT_SECRET` | Một string dài ngẫu nhiên khác | Tạo secret mạnh |
| `GOOGLE_CLIENT_ID` | Từ Google Cloud Console | Optional, nếu dùng Google OAuth |
| `GOOGLE_CLIENT_SECRET` | Từ Google Cloud Console | Optional |
| `GOOGLE_CALLBACK_URL` | `https://gundam-store-backend.onrender.com/api/auth/google/callback` | Thay `gundam-store-backend` bằng tên thực tế |
| `FACEBOOK_APP_ID` | Từ Facebook Developers | Optional |
| `FACEBOOK_APP_SECRET` | Từ Facebook Developers | Optional |
| `FACEBOOK_CALLBACK_URL` | `https://gundam-store-backend.onrender.com/api/auth/facebook/callback` | Optional |
| `CLIENT_URL` | `https://gundam-store-frontend.render.com` | URL của frontend (sẽ biết sau) |
| `API_BASE_URL` | `https://gundam-store-backend.onrender.com` | URL của backend |
| `NODE_ENV` | `production` | |

### 3.3 Deploy

Click **"Create Web Service"** và chờ deployment hoàn tất (thường 5-10 phút).

Sau khi xong, ghi lại URL backend:
- Ví dụ: `https://gundam-store-backend.onrender.com`

## Bước 4: Deploy Frontend

### 4.1 Tạo Static Site

1. Vào Dashboard, click **"+ New"** → **"Static Site"**
2. Chọn repository: `Gundam-Card-Game-store`
3. Điền thông tin:
   - **Name**: `gundam-store-frontend`
   - **Build Command**: `cd my-frontend && npm install && npm run build`
   - **Publish Directory**: `my-frontend/dist`

### 4.2 Deploy

Click **"Create Static Site"** và chờ deployment.

Sau xong, ghi lại URL frontend:
- Ví dụ: `https://gundam-store-frontend.render.com`

## Bước 5: Cập nhật Environment Variables

### 5.1 Cập nhật Frontend URL trong Backend

1. Vào Dashboard → Backend Web Service → **"Environment"**
2. Cập nhật:
   - `CLIENT_URL` = URL frontend (vừa lấy)
   - Ví dụ: `https://gundam-store-frontend.render.com`

### 5.2 Cập nhật OAuth Callback URLs

Nếu dùng Google OAuth hoặc Facebook:

1. **Google Cloud Console**:
   - Vào Credentials
   - Chỉnh sửa OAuth Client
   - Thêm Redirect URI: `https://gundam-store-backend.onrender.com/api/auth/google/callback`

2. **Facebook Developers**:
   - Vào App Settings
   - Thêm URL vào "Valid OAuth Redirect URIs": `https://gundam-store-backend.onrender.com/api/auth/facebook/callback`

## Bước 6: Update Frontend API URL

Nếu frontend cứng API URL, cần cập nhật:

1. Tìm file chứa API base URL (thường trong `src/utils/api.ts` hoặc `src/app/utils/api.ts`)
2. Cập nhật:

```typescript
// Cũ:
const API_URL = 'http://localhost:5000';

// Mới:
const API_URL = process.env.VITE_API_URL || 'https://gundam-store-backend.onrender.com';
```

3. Tạo file `.env.production` trong `my-frontend/`:

```
VITE_API_URL=https://gundam-store-backend.onrender.com
```

4. Push code lên GitHub:

```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

## Bước 7: Redeploy (nếu cần)

Sau khi update code, Render sẽ tự động redeploy nếu bạn push lên GitHub.

Nếu muốn redeploy thủ công:
- Vào Web Service/Static Site
- Click **"Manual Deploy"** → **"Deploy latest commit"**

## Troubleshooting

### Build hoặc Start Command Failed

Xem logs:
1. Vào Web Service
2. Click **"Logs"**
3. Xem thông báo lỗi
4. Fix lỗi và push lên GitHub

### Database Connection Error

Kiểm tra:
- MONGODB_URI đúng và có quyền truy cập
- MongoDB Atlas cho phép IP từ Render (thường là Allow All)

### Frontend không gọi được Backend API

Kiểm tra:
- `API_BASE_URL` / `CLIENT_URL` đúng
- CORS cấu hình trong Backend (`cors()` middleware)
- Update env files và redeploy

### Port 5000 bị chiếm

Backend sẽ tự động dùng port được Render gán.
Trong code, luôn dùng: `const PORT = process.env.PORT || 5000`

## Monitoring

Sau deployment, bạn có thể:

1. **Xem Logs**: Dashboard → Service → Logs
2. **Cảnh báo**: Cấu hình email alerts cho failures
3. **Giám sát Uptime**: Render tự động monitor uptime

## Useful Links

- [Render Documentation](https://render.com/docs)
- [Render Deployment Best Practices](https://render.com/docs/deploy-node)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

**Lưu ý**: Render free tier có giới hạn:
- Web service tự động sleep nếu không hoạt động 15 phút
- Bandwidth giới hạn
- Nên upgrade lên Starter Plus hoặc Pro nếu muốn hiệu suất production
