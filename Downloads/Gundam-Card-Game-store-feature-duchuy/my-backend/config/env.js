module.exports = {
  otpSecret: process.env.GUEST_OTP_JWT_SECRET,
  otpExpire: process.env.OTP_EXPIRES_IN || '5m',
};
