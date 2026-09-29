const mongoose = require('mongoose');

/**
 * Connects to MongoDB when MONGODB_URI is configured.
 * Resolves { ok, driver } — when Mongo is unavailable the API falls back
 * to an in-memory store (src/store/memory.js) so the site always runs.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI && process.env.MONGODB_URI.trim();
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — using in-memory store (data resets on restart).');
    return { ok: false, driver: 'memory' };
  }
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    console.log('[db] MongoDB connected:', mongoose.connection.host);
    return { ok: true, driver: 'mongoose' };
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    return { ok: false, driver: 'memory' };
  }
}

module.exports = connectDB;
