const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance.
 * Fails fast and falls back to in-memory store so the applet boots reliably.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    return { connected: false, reason: 'No MONGO_URI configured' };
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    return { connected: true };
  } catch (err) {
    console.error(`[DB Error] ${err?.message || 'Connection failed'}`);
    return { connected: false, reason: err?.message || 'Connection failed' };
  }
};

module.exports = connectDB;
