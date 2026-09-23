const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    paymentId: {
      type: String,
      required: true,
      index: true,
    },
    signature: {
      type: String,
      default: '',
    },
    projectId: {
      type: String,
      index: true,
    },
    clientPhone: {
      type: String,
      default: '',
    },
    clientEmail: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      default: 'Razorpay',
    },
    status: {
      type: String,
      enum: ['Captured', 'Failed', 'Refunded', 'Pending'],
      default: 'Captured',
    },
    rawPayload: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
