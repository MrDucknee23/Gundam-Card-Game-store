# Google OAuth 2.0 Setup

Tai lieu nay mo ta cach cau hinh va su dung Google OAuth 2.0 cho project Gundam Store.

## Tong quan

Google OAuth da duoc trien khai san trong codebase:

- Backend Passport config: `my-backend/config/passport.js`
- Auth routes: `my-backend/routes/auth.js`
- User model: `my-backend/models/User.js`
- Frontend token completion: `my-frontend/src/app/context/AuthContext.tsx`
- Frontend OAuth callback page: `my-frontend/src/app/pages/AuthCallback.tsx`

He thong hien tai ho tro:

- Dang nhap bang Google
- Phat hanh JWT sau khi dang nhap thanh cong
- Tu dong khoi phuc phien dang nhap bang `/api/auth/me`
- Gop tai khoan theo `googleId` va `email` de tranh tao user trung
- Xu ly loi an toan khi Google khong tra ve email

## Part 1: Google Cloud Setup

### 1. Tao project trong Google Cloud Console

1. Mo Google Cloud Console: `https://console.cloud.google.com/`
2. Bam vao bo chon project tren thanh tren cung.
3. Chon `New Project`.
4. Dat ten project, vi du: `Gundam Store Auth`.
5. Bam `Create`.

### 2. Bat OAuth Consent Screen

1. Trong menu ben trai, vao `APIs & Services` -> `OAuth consent screen`.
2. Chon loai phu hop:
   - `External` neu dung tai khoan Google thong thuong
   - `Internal` neu chi dung trong Google Workspace noi bo
3. Dien thong tin co ban:
   - App name
   - User support email
   - Developer contact email
4. Bam `Save and Continue`.
5. Neu dang o che do `Testing`, them cac email duoc phep dang nhap vao `Test users`.

### 3. Tao OAuth Client ID

1. Vao `APIs & Services` -> `Credentials`.
2. Bam `Create Credentials` -> `OAuth client ID`.
3. Chon `Application type`: `Web application`.
4. Dat ten, vi du: `Gundam Store Local Auth`.
5. Trong phan `Authorized redirect URIs`, them dung gia tri sau:

```text
http://localhost:5000/api/auth/google/callback
```

6. Bam `Create`.
7. Luu lai:
   - `Client ID`
   - `Client Secret`

## Part 2: Environment Configuration

Tao file `my-backend/.env` hoac cap nhat file dang co:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
```

Luu y:

- Yeu cau goc dung `CLIENT_URL=http://localhost:3000`.
- Trong project nay, frontend dang chay bang Vite o `http://localhost:5173`, vi vay can dung:

```env
CLIENT_URL=http://localhost:5173
```

- Neu sau nay frontend cua ban chay o `3000`, ban co the doi lai `CLIENT_URL` thanh `http://localhost:3000`.

Khuyen nghi them cac bien sau de cau hinh day du:

```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_EXPIRES_IN=7d
API_BASE_URL=http://localhost:5000
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

## Part 3: Install Dependencies

Trong repo nay, cac goi can thiet da duoc cai san trong `my-backend/package.json`:

- `passport`
- `passport-google-oauth20`
- `jsonwebtoken`

Neu can cai moi trong project khac, dung:

```bash
npm install passport passport-google-oauth20 jsonwebtoken
```

## Part 4: Passport Configuration

File da ton tai:

`my-backend/config/passport.js`

### GoogleStrategy dang lam gi

Code hien tai trich xuat:

- `profile.id`
- `profile.emails?.[0]?.value`
- `profile.displayName`
- `profile.photos?.[0]?.value`

### Account merge logic

He thong dang su dung dung logic production-ready:

1. Tim user theo `googleId`
2. Neu khong co, tim user theo `email`
3. Neu email da ton tai:
   - cap nhat user hien co bang cach them `googleId`
4. Neu email chua ton tai:
   - tao user moi

Tom tat logic hien tai:

```js
const existingProviderUser = await User.findOne({ googleId: profile.id });

if (!existingProviderUser) {
  const userByEmail = await User.findOne({ email: normalizedEmail });

  if (userByEmail) {
    userByEmail.googleId = profile.id;
    await userByEmail.save();
  } else {
    await User.create({
      email: normalizedEmail,
      googleId: profile.id,
      name,
      avatar,
    });
  }
}
```

Ban thuc te trong repo con bo sung them:

- enrich `name`, `avatar`, `email` neu user cu thieu du lieu
- xu ly loi `oauth_email_missing` an toan

## Part 5: Auth Routes

File da ton tai:

`my-backend/routes/auth.js`

### Routes hien co

- `GET /api/auth/google`
- `GET /api/auth/google/callback`

### `GET /api/auth/google`

- Kiem tra da co `GOOGLE_CLIENT_ID` va `GOOGLE_CLIENT_SECRET` chua
- Neu chua co, tra ve `503`
- Neu da co, redirect user sang Google login voi scope:

```js
['profile', 'email']
```

### `GET /api/auth/google/callback`

Sau khi Google xac thuc thanh cong:

1. Passport xac thuc user
2. He thong tao JWT
3. Redirect ve frontend callback page

Trong repo nay, redirect hien tai la:

```text
http://localhost:5173/auth/callback?token=JWT
```

Dieu nay tot hon cach redirect ve root `/?token=...` vi frontend co trang callback rieng de xu ly an toan va gon hon.

JWT dang duoc tao tai backend bang logic tuong duong:

```js
jwt.sign({ sub: String(user._id), email: user.email, role: user.role }, process.env.JWT_SECRET)
```

Neu ban muon toi gian dung nhu yeu cau co ban:

```js
jwt.sign({ id: user._id }, process.env.JWT_SECRET)
```

nhung ban hien tai trong repo dang tot hon vi token mang them `email` va `role`.

## Part 6: Frontend Integration

Frontend da duoc tich hop san.

### Nut dang nhap Google

Trang login goi:

```js
window.location.assign(buildApiUrl('/auth/google'));
```

tuong duong voi:

```js
window.location.href = 'http://localhost:5000/api/auth/google';
```

### Sau khi redirect ve frontend

Frontend su dung trang:

`my-frontend/src/app/pages/AuthCallback.tsx`

Trang nay se:

1. Doc `token` tu query string
2. Goi `completeOAuthLogin(token)`
3. Goi `/api/auth/me` de xac minh token
4. Luu token vao `localStorage`
5. Luu user vao `localStorage`
6. Dieu huong ve `/profile`

Logic luu phien dang nhap nam trong:

`my-frontend/src/app/context/AuthContext.tsx`

## Part 7: User Model Update

Model hien tai da bao gom day du cac field can thiet:

```js
email: { type: String, unique: true, required: true }
googleId: { type: String, sparse: true, index: true }
name: { type: String }
avatar: { type: String }
```

File:

`my-backend/models/User.js`

## Error Handling

### 1. `redirect_uri_mismatch`

Nguyen nhan:

- Redirect URI trong Google Cloud khong trung khop voi backend callback URL

Can sua:

```text
http://localhost:5000/api/auth/google/callback
```

No phai trung tuyet doi ca:

- protocol
- host
- port
- path

### 2. Missing email

He thong hien tai da xu ly an toan.

Neu Google khong tra ve email:

- backend khong tao user loi
- backend redirect ve frontend voi ma loi `oauth_email_missing`
- frontend hien thong diep that bai phu hop

## Security Notes

- Khong hard-code secret trong code
- Dung `.env` cho `GOOGLE_CLIENT_SECRET` va `JWT_SECRET`
- Khong commit file `.env`
- Xac thuc lai token bang `/api/auth/me` truoc khi tao session frontend
- Gop tai khoan theo email de tranh tao duplicate user

## Final Result

Sau khi dien dung env va cau hinh Google Cloud:

1. User bam `Dang nhap voi Google`
2. He thong redirect sang Google
3. User dang nhap thanh cong
4. Backend tao JWT
5. Frontend nhan token va luu session
6. User duoc dang nhap vao he thong
7. Neu email da ton tai, tai khoan se duoc gop thay vi tao user moi

## Files lien quan

### Backend

- `my-backend/config/passport.js`
- `my-backend/routes/auth.js`
- `my-backend/models/User.js`

### Frontend

- `my-frontend/src/app/pages/Login.tsx`
- `my-frontend/src/app/pages/AuthCallback.tsx`
- `my-frontend/src/app/context/AuthContext.tsx`
