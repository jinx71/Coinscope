const mongoose = require('mongoose');

// A single portfolio position. P/L is computed on read against live market price,
// so we only persist the cost basis here.
const holdingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    coinId: {
      type: String, // CoinGecko id, e.g. 'bitcoin'
      required: [true, 'coinId is required'],
      trim: true,
      lowercase: true,
    },
    symbol: { type: String, trim: true, uppercase: true },
    name: { type: String, trim: true },
    image: { type: String, trim: true },
    amount: {
      type: Number,
      required: [true, 'amount is required'],
      min: [0, 'amount must be >= 0'],
    },
    avgBuyPrice: {
      type: Number,
      required: [true, 'avgBuyPrice is required'],
      min: [0, 'avgBuyPrice must be >= 0'],
    },
    buyDate: { type: Date, default: Date.now },
    notes: { type: String, maxlength: 280, trim: true },
  },
  { timestamps: true }
);

holdingSchema.index({ user: 1, coinId: 1 });

module.exports = mongoose.model('Holding', holdingSchema);
