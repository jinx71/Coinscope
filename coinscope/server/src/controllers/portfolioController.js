const { validationResult } = require('express-validator');
const Holding = require('../models/Holding');
const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const cg = require('../services/coingecko');

const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    fail(res, 'Validation failed', 400, errors.array());
    return false;
  }
  return true;
};

// Compute live valuation + P/L for an array of holdings.
const valuate = async (holdings) => {
  if (!holdings.length) {
    return {
      holdings: [],
      totals: { costBasis: 0, currentValue: 0, pnl: 0, pnlPercent: 0 },
    };
  }

  const ids = Array.from(new Set(holdings.map((h) => h.coinId)));
  const priced = await cg.getSimplePrices(ids, 'usd');
  const prices = priced.data || {};

  let costBasis = 0;
  let currentValue = 0;

  const enriched = holdings.map((h) => {
    const p = prices[h.coinId] || {};
    const currentPrice = Number(p.usd) || 0;
    const change24h = Number(p.usd_24h_change) || 0;
    const positionCost = h.amount * h.avgBuyPrice;
    const positionValue = h.amount * currentPrice;
    const positionPnl = positionValue - positionCost;
    const positionPnlPct = positionCost > 0 ? (positionPnl / positionCost) * 100 : 0;
    costBasis += positionCost;
    currentValue += positionValue;
    return {
      id: h._id,
      coinId: h.coinId,
      symbol: h.symbol,
      name: h.name,
      image: h.image,
      amount: h.amount,
      avgBuyPrice: h.avgBuyPrice,
      buyDate: h.buyDate,
      notes: h.notes,
      currentPrice,
      change24h,
      costBasis: positionCost,
      currentValue: positionValue,
      pnl: positionPnl,
      pnlPercent: positionPnlPct,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    };
  });

  const totalPnl = currentValue - costBasis;
  const totalPnlPct = costBasis > 0 ? (totalPnl / costBasis) * 100 : 0;

  return {
    holdings: enriched,
    totals: {
      costBasis,
      currentValue,
      pnl: totalPnl,
      pnlPercent: totalPnlPct,
    },
  };
};

// GET /api/portfolio
const list = asyncHandler(async (req, res) => {
  const holdings = await Holding.find({ user: req.user._id }).sort('-createdAt');
  const out = await valuate(holdings);
  return ok(res, out);
});

// POST /api/portfolio
const create = asyncHandler(async (req, res) => {
  if (!validate(req, res)) return;
  const { coinId, symbol, name, image, amount, avgBuyPrice, buyDate, notes } = req.body;

  const holding = await Holding.create({
    user: req.user._id,
    coinId: String(coinId).toLowerCase(),
    symbol,
    name,
    image,
    amount,
    avgBuyPrice,
    buyDate: buyDate || Date.now(),
    notes,
  });

  return ok(res, { holding }, 'Holding added', 201);
});

// PUT /api/portfolio/:id
const update = asyncHandler(async (req, res) => {
  if (!validate(req, res)) return;
  const updates = (({ amount, avgBuyPrice, buyDate, notes }) => ({
    amount,
    avgBuyPrice,
    buyDate,
    notes,
  }))(req.body);

  // Remove undefined keys so we don't overwrite with null.
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);

  const holding = await Holding.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );
  if (!holding) return fail(res, 'Holding not found', 404);
  return ok(res, { holding }, 'Holding updated');
});

// DELETE /api/portfolio/:id
const remove = asyncHandler(async (req, res) => {
  const holding = await Holding.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!holding) return fail(res, 'Holding not found', 404);
  return ok(res, { id: holding._id }, 'Holding removed');
});

module.exports = { list, create, update, remove };
