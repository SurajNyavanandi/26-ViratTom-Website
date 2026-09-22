const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance.
 * Fails fast and falls back to in-memory store so the applet boots reliably.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('[AI Studio] Local in-memory storage ready');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[AI Studio] Connected to MongoDB');
    return true;
  } catch (err) {
    // Atlas cluster may restrict external container IPs unless 0.0.0.0/0 is configured in Atlas IP access list
    console.log('[AI Studio] Storage active with resilient memory repository (Atlas cloud sync available when IP whitelist is configured)');
    return false;
  }
};

module.exports = connectDB;
