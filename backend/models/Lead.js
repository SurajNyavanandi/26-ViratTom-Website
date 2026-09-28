const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: 'N/A',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    budget: {
      type: Number,
      default: 0,
    },
    scope: {
      type: String,
      default: '',
    },
    projectType: {
      type: String,
      default: 'Static Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'In Progress', 'Converted', 'Archived'],
      default: 'New',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    whatsappVerified: {
      type: Boolean,
      default: false,
    },
    waId: {
      type: String,
      default: '',
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    downloadTimestamps: [{
      type: Date,
      default: Date.now,
    }],
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ email: 1, createdAt: -1 });
leadSchema.index({ phone: 1 });

module.exports = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
