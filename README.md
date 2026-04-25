
  # Gundam Card Game E-commerce

  This is a code bundle for Gundam Card Game E-commerce. The original project is available at https://www.figma.com/design/KRdoaTqSA5ncwpQ6T7Ial6/Gundam-Card-Game-E-commerce.

  ## Running the code

  Run `npx pnpm install` to install the dependencies.

  Run `npm run dev` to start both the frontend and backend in development mode.

  Optional commands:

  - `npm run dev:frontend` to start only the Vite frontend.
  - `npm run dev:backend` to start only the Express backend.

  ## Product image uploads

  Product images are now uploaded as files and stored under `my-backend/uploads` instead of being embedded as base64 JSON.

  Upload one or more images first:

  ```bash
  curl -X POST http://localhost:5000/api/upload \
    -F "images=@C:/path/to/main-image.jpg" \
    -F "images=@C:/path/to/sub-image.png"
  ```

  Example upload response:

  ```json
  {
    "files": [
      "/uploads/main-image-1713647400000-123456789.jpg",
      "/uploads/sub-image-1713647400001-987654321.png"
    ]
  }
  ```

  Then create or update the product by sending those returned paths in `images`:

  ```json
  {
    "name": "RX-78-2 Gundam",
    "category": "gundam",
    "price": 1250000,
    "description": "Master Grade kit",
    "stock": 12,
    "images": [
      "/uploads/main-image-1713647400000-123456789.jpg",
      "/uploads/sub-image-1713647400001-987654321.png"
    ],
    "grade": "MG",
    "subCategoryKey": "grade",
    "subCategoryValue": "MG",
    "scale": "1/100",
    "material": "Plastic",
    "featured": true
  }
  ```

  To migrate existing product records that still contain base64 images, run:

  ```bash
  cd my-backend
  npm run migrate:product-images
  ```

  ## Authentication enhancements

  The existing `/api/auth` email/password flow is still supported and now returns a JWT together with the user payload.

  Additional auth routes:

  - `GET /api/auth/google`
  - `GET /api/auth/google/callback`
  - `GET /api/auth/facebook`
  - `GET /api/auth/facebook/callback`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `GET /api/auth/me`

  Passwords are hashed with `bcrypt`. Existing legacy users with plain-text passwords are automatically upgraded to bcrypt hashes after their first successful login.

  Backend environment variables are documented in `my-backend/.env.example`:

  ```env
  PORT=5000
  MONGODB_URI=your_mongodb_uri
  JWT_SECRET=replace_with_a_long_random_secret
  JWT_EXPIRES_IN=7d
  API_BASE_URL=http://localhost:5000
  FRONTEND_URL=http://localhost:5173
  CLIENT_URL=http://localhost:5173
  GOOGLE_CLIENT_ID=your_google_client_id
  GOOGLE_CLIENT_SECRET=your_google_client_secret
  GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
  FACEBOOK_APP_ID=your_facebook_app_id
  FACEBOOK_APP_SECRET=your_facebook_app_secret
  FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_gmail_app_password
  EMAIL_FROM=Gundam Store <your_email@gmail.com>
  ```

  Frontend environment variables are documented in `my-frontend/.env.example`:

  ```env
  VITE_API_URL=http://localhost:5000/api
  ```

  If Google/Facebook or Gmail credentials are missing, the email/password login still works. Social auth routes return `503` until OAuth credentials are configured, and forgot-password email delivery remains unavailable until valid Gmail SMTP credentials are provided.

  ## Google OAuth setup guide

  Huong dan cau hinh Google OAuth 2.0 production-ready cho project nay nam tai:

  - `GOOGLE_OAUTH_SETUP.md`

  Luu y quan trong: project frontend hien tai dang chay bang Vite o `http://localhost:5173`, vi vay `CLIENT_URL` nen dung `http://localhost:5173` thay vi `http://localhost:3000` khi chay local trong repo nay.
  