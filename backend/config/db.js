const mongoose = require('mongoose');

/**
 * Connect to MongoDB database instance.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) return false;

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    return true;
  } catch {
    return false;
  }
};

module.exports = connectDB;
