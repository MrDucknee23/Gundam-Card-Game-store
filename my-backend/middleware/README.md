/**
 * 🔐 BACKEND MIDDLEWARE
 * 
 * Xử lý authentication, authorization, rate limiting, validation
 */

// ═══════════════════════════════════════════════════════════════════════════
// auth.js
// ═══════════════════════════════════════════════════════════════════════════
// Kiểm tra xem request có JWT token không
// Nếu có: extract user info từ token
// Nếu không: return 401 Unauthorized
// Usage: app.use('/api/protected', authMiddleware, controller)

// ═══════════════════════════════════════════════════════════════════════════
// authJwt.js
// ═══════════════════════════════════════════════════════════════════════════
// Verify JWT token từ Authorization header
// Kiểm tra token expiration, signature
// Decode payload → get userId, email, role
// Usage: router.get('/protected', authJwt, handler)

// ═══════════════════════════════════════════════════════════════════════════
// guestOtpRateLimit.js
// ═══════════════════════════════════════════════════════════════════════════
// Rate limiting cho guest OTP requests
// Limit: max 3 OTP requests per email per 5 minutes
// Ngăn chặn brute force attacks
// Usage: router.post('/otp/send', guestOtpRateLimit, handler)

// ═══════════════════════════════════════════════════════════════════════════
// Middleware execution order:
// ═══════════════════════════════════════════════════════════════════════════
// 1. bodyParser    - Parse JSON body
// 2. CORS          - Check cross-origin requests
// 3. compression   - Compress responses
// 4. Passport      - Initialize authentication
// 5. Custom auth   - Check JWT token
// 6. Rate limit    - Check request rate
// 7. Handler       - Process request
// 8. Error handler - Catch errors
