const mongoose = require('mongoose');

const adminNoteSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Note',
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.AdminNote || mongoose.model('AdminNote', adminNoteSchema);
