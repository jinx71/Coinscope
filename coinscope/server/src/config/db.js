const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.warn('[db] MONGO_URI not set — skipping Mongo connection (auth/portfolio/watchlist will fail).');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    console.log(`[db] Mongo connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error(`[db] Mongo connection error: ${err.message}`);
    // Don't crash — the public coin endpoints still work without Mongo.
  }
};

module.exports = connectDB;
