const { sendGuestOtp, verifyGuestOtp } = require('../services/guestOtpService');

const sendOtp = async (req, res) => {
  try {
    const result = await sendGuestOtp(req.body || {});
    return res.json({
      message: 'OTP đã được gửi tới email của bạn. Vui lòng kiểm tra hộp thư.',
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Không thể gửi OTP',
      error: error.code || 'guest_send_otp_failed',
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const result = await verifyGuestOtp(req.body || {});
    return res.json({
      message: 'Xác thực OTP thành công',
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Không thể xác thực OTP',
      error: error.code || 'guest_verify_otp_failed',
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};