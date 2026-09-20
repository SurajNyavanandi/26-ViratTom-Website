const mongoose = require('mongoose');

/**
 * Example Mongoose Schema
 * Replace or extend this model for your project domain
 */
const exampleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Example || mongoose.model('Example', exampleSchema);
