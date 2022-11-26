const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coinId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    symbol: { type: String, trim: true, uppercase: true },
    name: { type: String, trim: true },
    image: { type: String, trim: true },
  },
  { timestamps: true }
);

// Each user can watch a coin at most once.
watchlistItemSchema.index({ user: 1, coinId: 1 }, { unique: true });

module.exports = mongoose.model('WatchlistItem', watchlistItemSchema);
