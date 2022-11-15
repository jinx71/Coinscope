const asyncHandler = require('../utils/asyncHandler');
const { ok, fail } = require('../utils/apiResponse');
const cg = require('../services/coingecko');

// Helper: send the standard envelope and set X-Cache + X-Cache-TTL headers
// so the cache lesson is visible from devtools / our CacheBadge component.
const sendWithCacheHeaders = (res, result, ttl) => {
  res.set('X-Cache', result.status || 'MISS');
  res.set('X-Cache-TTL', String(ttl || 0));
  res.set('X-Data-Source', result.source || 'live');
  return ok(res, result.data);
};

// GET /api/coins/markets?per_page=20&page=1&ids=bitcoin,ethereum
const getMarkets = asyncHandler(async (req, res) => {
  const perPage = Math.min(Math.max(parseInt(req.query.per_page, 10) || 20, 1), 100);
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const ids = req.query.ids ? String(req.query.ids).trim() : undefined;
  const sparkline = String(req.query.sparkline || 'true') !== 'false';

  const result = await cg.getMarkets({ perPage, page, ids, sparkline });
  return sendWithCacheHeaders(res, result, cg.TTL.markets);
});

// GET /api/coins/trending
const getTrending = asyncHandler(async (req, res) => {
  const result = await cg.getTrending();
  return sendWithCacheHeaders(res, result, cg.TTL.trending);
});

// GET /api/coins/global
const getGlobal = asyncHandler(async (req, res) => {
  const result = await cg.getGlobal();
  return sendWithCacheHeaders(res, result, cg.TTL.global);
});

// GET /api/coins/search?q=bit
const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return ok(res, { coins: [] });
  const result = await cg.search(q);
  return sendWithCacheHeaders(res, result, cg.TTL.search);
});

// GET /api/coins/:id
const getCoin = asyncHandler(async (req, res) => {
  const id = String(req.params.id || '').toLowerCase();
  if (!id) return fail(res, 'Missing coin id', 400);
  const result = await cg.getCoin(id);
  return sendWithCacheHeaders(res, result, cg.TTL.coin);
});

// GET /api/coins/:id/chart?days=7
const getChart = asyncHandler(async (req, res) => {
  const id = String(req.params.id || '').toLowerCase();
  if (!id) return fail(res, 'Missing coin id', 400);
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 365);
  const result = await cg.getMarketChart(id, { days });
  return sendWithCacheHeaders(res, result, cg.TTL.chart);
});

// GET /api/coins/cache/stats — visible for the engineering lesson
const cacheStats = asyncHandler(async (req, res) => {
  return ok(res, { ttls: cg.TTL, ...cg.cacheStats() });
});

module.exports = {
  getMarkets,
  getTrending,
  getGlobal,
  search,
  getCoin,
  getChart,
  cacheStats,
};
