const mongoose = require('mongoose');

const failedEmailLogSchema = new mongoose.Schema(
  {
    jobId: {
      type: String,
      required: true,
      index: true,
    },
    to: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      default: 'Email',
    },
    attempts: {
      type: Number,
      default: 0,
    },
    error: {
      type: String,
      default: 'Unknown dispatch error',
    },
    status: {
      type: String,
      enum: ['failed', 'retrying', 'resolved'],
      default: 'failed',
    },
    failedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.FailedEmailLog || mongoose.model('FailedEmailLog', failedEmailLogSchema);
