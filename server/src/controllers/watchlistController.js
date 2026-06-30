const { validationResult } = require('express-validator');
const WatchlistItem = require('../models/WatchlistItem');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const cg = require('../services/coingecko');

// GET /api/watchlist
// Returns the watched coins enriched with live market data (so the page
// can render rich rows in one request — same shape as /coins/markets).
const list = asyncHandler(async (req, res) => {
  const items = await WatchlistItem.find({ user: req.user._id }).sort('-createdAt');
  if (!items.length) return ok(res, { items: [], markets: [] });

  const ids = items.map((i) => i.coinId);
  const markets = await cg.getMarkets({ perPage: ids.length, page: 1, ids: ids.join(',') });

  res.set('X-Cache', markets.status || 'MISS');
  res.set('X-Cache-TTL', String(cg.TTL.markets));
  res.set('X-Data-Source', markets.source || 'live');

  return ok(res, { items, markets: markets.data });
});

// POST /api/watchlist
const add = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return fail(res, 'Validation failed', 400, errors.array());

  const { coinId, symbol, name, image } = req.body;
  const id = String(coinId).toLowerCase();

  try {
    const item = await WatchlistItem.create({
      user: req.user._id,
      coinId: id,
      symbol,
      name,
      image,
    });
    return ok(res, { item }, 'Added to watchlist', 201);
  } catch (e) {
    if (e.code === 11000) {
      // already exists — return the existing item (idempotent add)
      const existing = await WatchlistItem.findOne({ user: req.user._id, coinId: id });
      return ok(res, { item: existing }, 'Already in watchlist');
    }
    throw e;
  }
});

// DELETE /api/watchlist/:coinId
const remove = asyncHandler(async (req, res) => {
  const coinId = String(req.params.coinId || '').toLowerCase();
  const removed = await WatchlistItem.findOneAndDelete({
    user: req.user._id,
    coinId,
  });
  if (!removed) return fail(res, 'Not in watchlist', 404);
  return ok(res, { coinId }, 'Removed from watchlist');
});

module.exports = { list, add, remove };
