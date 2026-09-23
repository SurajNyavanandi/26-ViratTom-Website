const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  task: { type: String, required: true },
  done: { type: Boolean, default: false },
  date: { type: String, default: '' },
});

const deliverableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, default: '#' },
  locked: { type: Boolean, default: false },
});

const feedbackSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  text: { type: String, required: true },
  time: { type: String, default: 'Just now' },
  resolved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const paymentHistorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, default: 'Milestone Payment' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  paymentMethod: { type: String, default: 'Razorpay Gateway' },
  transactionId: { type: String, required: true },
  orderId: { type: String, default: '' },
  status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' },
  createdAt: { type: Date, default: Date.now },
});

const clientProjectSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    clientPhone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    clientEmail: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    clientName: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      default: 'Web Application',
    },
    status: {
      type: String,
      enum: ['Active', 'In Review', 'Completed', 'On Hold'],
      default: 'Active',
    },
    totalBudget: {
      type: Number,
      required: true,
      default: 25000,
    },
    advancePercentage: {
      type: Number,
      default: 20,
    },
    advanceAmount: {
      type: Number,
      default: 5000,
    },
    advancePaid: {
      type: Boolean,
      default: false,
    },
    finalPaid: {
      type: Boolean,
      default: false,
    },
    clientPortalApproved: {
      type: Boolean,
      default: true,
    },
    clientLockedOut: {
      type: Boolean,
      default: false,
    },
    milestones: [milestoneSchema],
    deliverables: [deliverableSchema],
    feedback: [feedbackSchema],
    techStack: [{ type: String }],
    paymentHistory: [paymentHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.ClientProject || mongoose.model('ClientProject', clientProjectSchema);
