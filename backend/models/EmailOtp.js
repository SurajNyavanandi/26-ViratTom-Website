const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '15m' }, // Automatically TTL-expires after 15 minutes
    },
    leadData: {
      type: Object,
      default: {},
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.EmailOtp || mongoose.model('EmailOtp', emailOtpSchema);
