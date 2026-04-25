/**
 * 🛠️ BACKEND SERVICES
 * 
 * Business logic layer - độc lập với routes/controllers
 * Dùng cho operations phức tạp, reusable
 */

// ═══════════════════════════════════════════════════════════════════════════
// userOrderService.js
// ═══════════════════════════════════════════════════════════════════════════
// Exports:
// - createOrder(userId, items, shippingInfo)      - Tạo order mới
// - getOrders(userId, filter)                     - Lấy orders của user
// - getOrderDetail(orderId, userId)               - Lấy chi tiết order
// - updateOrderStatus(orderId, newStatus)         - Cập nhật status
// - calculateTotalPrice(items)                    - Tính tổng giá
// - validateOrder(items)                          - Kiểm tra hợp lệ
// - sendOrderConfirmation(userId, orderId)        - Gửi email xác nhận

// ═══════════════════════════════════════════════════════════════════════════
// guestOrderService.js
// ═══════════════════════════════════════════════════════════════════════════
// Giống userOrderService nhưng cho guest (không có account)
// Exports:
// - createGuestOrder(guestEmail, items, shippingInfo)
// - getGuestOrders(guestEmail, otp)
// - getGuestOrderDetail(orderId, guestEmail, otp)
// - generateOrderTrackingLink(orderId)
// - sendGuestOrderConfirmation(guestEmail, orderId)

// ═══════════════════════════════════════════════════════════════════════════
// guestOtpService.js
// ═══════════════════════════════════════════════════════════════════════════
// Quản lý One-Time Password cho guest
// Exports:
// - generateOtp()                    - Tạo OTP 6 digits
// - sendOtpEmail(email)              - Gửi OTP qua email
// - verifyOtp(email, otp)            - Kiểm tra OTP đúng không
// - isOtpExpired(email)              - Kiểm tra OTP hết hạn không
// - incrementAttempts(email)         - Tăng số lần nhập sai
// - maxAttemptsReached(email)        - Kiểm tra quá số lần tối đa

// ═══════════════════════════════════════════════════════════════════════════
// Service vs Controller:
// ═══════════════════════════════════════════════════════════════════════════
// Service:
// - Chứa business logic thuần (không HTTP-specific)
// - Không truy cập req, res
// - Có thể tái sử dụng ở nhiều controller
// - Dễ test (unit tests)

// Controller:
// - Xử lý HTTP request/response
// - Gọi services để xử lý logic
// - Trả về JSON response
// - Tập trung vào HTTP aspects (validation, error handling)

// Example:
// router.post('/orders', authJwt, (req, res) => {
//   userOrderService.createOrder(req.user.id, req.body.items)
//     .then(order => res.json(order))
//     .catch(err => res.status(400).json({ error: err.message }))
// })
