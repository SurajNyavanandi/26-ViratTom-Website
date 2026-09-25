const mongoose = require('mongoose');

const resumeDraftSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    candidateName: {
      type: String,
      default: '',
    },
    resumeData: {
      type: Object,
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    downloadTimestamps: [{
      type: Date,
      default: Date.now,
    }],
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.ResumeDraft || mongoose.model('ResumeDraft', resumeDraftSchema);
