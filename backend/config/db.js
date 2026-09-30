const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance.
 * Fails fast and falls back to in-memory store so the applet boots reliably with zero downtime.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);

  // Only notify of runtime errors if connection was successfully established
  mongoose.connection.on('error', (err) => {
    if (mongoose.connection.readyState === 1) {
      console.warn(`[MongoDB Notice] Runtime connection event: ${err?.message || err}`);
    }
  });

  const rawUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();

  // If not configured or contains unpopulated template placeholders
  if (!rawUri || rawUri.includes('<username>') || rawUri.includes('<password>')) {
    return { connected: false, reason: 'No valid MONGO_URI configured (using in-memory repository)' };
  }

  try {
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      family: 4, // Force IPv4 for cluster DNS resolution
    });
    console.log('[MongoDB Status] mongodb connected successfully to MongoDB Atlas cluster');
    return { connected: true, message: 'mongodb connected' };
  } catch (err) {
    const msg = err?.message || 'Connection failed';
    // Cleanly disconnect to prevent Mongoose background retry storm & OpenSSL alert noise
    try {
      await mongoose.disconnect();
    } catch (_) {}

    if (msg.includes('whitelist') || msg.includes('Could not connect to any servers') || msg.includes('SSL routines') || msg.includes('alert')) {
      console.warn(`[MongoDB Status] MongoDB Atlas IP restriction: Current IP is not on the Atlas IP Access List. Seamlessly operating on zero-downtime in-memory store.`);
    } else {
      console.warn(`[MongoDB Status] Remote DB unavailable (${msg}). Seamlessly operating on zero-downtime in-memory store.`);
    }
    return { connected: false, reason: msg };
  }
};

module.exports = connectDB;

