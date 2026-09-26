const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance.
 * Fails fast and falls back to in-memory store so the applet boots reliably with zero downtime.
 */
const connectDB = async () => {
  mongoose.set('bufferCommands', false);

  // Suppress uncaught background connection errors
  mongoose.connection.on('error', (err) => {
    console.warn(`[MongoDB Notice] Runtime connection event: ${err?.message || err}`);
  });

  const rawUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();

  // If not configured or contains unpopulated template placeholders
  if (!rawUri || rawUri.includes('<username>') || rawUri.includes('<password>')) {
    return { connected: false, reason: 'No valid MONGO_URI configured (using in-memory repository)' };
  }

  try {
    await mongoose.connect(rawUri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log('[MongoDB Status] Successfully connected to MongoDB Atlas cluster');
    return { connected: true };
  } catch (err) {
    const msg = err?.message || 'Connection failed';
    if (msg.includes('whitelist') || msg.includes('Could not connect to any servers')) {
      console.warn(`[MongoDB Status] MongoDB Atlas IP restriction: Current IP is not on the Atlas IP Access List. Seamlessly operating on zero-downtime in-memory store.`);
    } else {
      console.warn(`[MongoDB Status] Remote DB unavailable (${msg}). Seamlessly operating on zero-downtime in-memory store.`);
    }
    return { connected: false, reason: msg };
  }
};

module.exports = connectDB;

