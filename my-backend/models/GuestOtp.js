const mongoose = require('mongoose');

const guestOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

guestOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
guestOtpSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('GuestOtp', guestOtpSchema);