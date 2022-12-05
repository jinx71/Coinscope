const axios = require('axios');
const NodeCache = require('node-cache');
const mock = require('./mockData');

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Per-endpoint TTLs (seconds). The lesson here mirrors PitchSide/CricLive:
// cache live data hard enough to survive free-tier rate limits, but not so
// hard that the UI feels stale. CoinGecko's free tier ~10-30 req/min, so even
// 100 concurrent users hitting /markets only generate ~1 upstream call/min.
const TTL = {
  markets: 60,         // markets list (home dashboard)
  search: 120,         // search results
  coin: 120,           // /coins/:id detail
  chart: 300,          // /coins/:id/market_chart
  trending: 300,       // /search/trending
  global: 300,         // /global
  simplePrice: 30,     // /simple/price (portfolio valuation)
};

const cache = new NodeCache({ stdTTL: 60, checkperiod: 30, useClones: false });
const inflight = new Map(); // key -> Promise   (dedupe concurrent identical fetches)

const apiKeyHeader = () => {
  const k = (process.env.COINGECKO_API_KEY || '').trim();
  return k ? { 'x-cg-demo-api-key': k } : {};
};

const isMockMode = () =>
  String(process.env.USE_MOCK_DATA || '').toLowerCase() === 'true';

// Core helper: cache → inflight dedupe → upstream → mock fallback.
const cachedFetch = async (key, ttl, upstream, fallback) => {
  const hit = cache.get(key);
  if (hit) return { data: hit, status: 'HIT', source: 'cache' };

  if (inflight.has(key)) {
    const data = await inflight.get(key);
    return { data, status: 'INFLIGHT', source: 'cache' };
  }

  const promise = (async () => {
    if (isMockMode()) {
      const data = fallback();
      cache.set(key, data, ttl);
      return data;
    }
    try {
      const data = await upstream();
      cache.set(key, data, ttl);
      return data;
    } catch (err) {
      // Soft-fail: serve a stale-but-deterministic mock so the UI never breaks.
      const status = err.response && err.response.status;
      console.warn(`[coingecko] upstream failed (${status || 'network'}): ${err.message}. Serving mock.`);
      const data = fallback();
      // Cache the mock for a *short* TTL so we retry upstream soon.
      cache.set(key, data, Math.min(ttl, 30));
      return data;
    }
  })();

  inflight.set(key, promise);
  try {
    const data = await promise;
    const wasMockFallback = !cache.has(key) || cache.getTtl(key) - Date.now() < ttl * 1000 - 1000;
    return { data, status: 'MISS', source: isMockMode() || wasMockFallback ? 'mock-or-live' : 'live' };
  } finally {
    inflight.delete(key);
  }
};

const get = (path, params) =>
  axios.get(`${BASE_URL}${path}`, {
    params,
    timeout: 8000,
    headers: { Accept: 'application/json', ...apiKeyHeader() },
  }).then((r) => r.data);

// ---- Public service methods ----

const getMarkets = async ({ vs = 'usd', perPage = 20, page = 1, ids, sparkline = true } = {}) => {
  const key = `markets:${vs}:${perPage}:${page}:${ids || 'all'}:sl=${sparkline ? 1 : 0}`;
  return cachedFetch(
    key,
    TTL.markets,
    () =>
      get('/coins/markets', {
        vs_currency: vs,
        order: 'market_cap_desc',
        per_page: perPage,
        page,
        sparkline,
        price_change_percentage: '1h,24h,7d',
        ids: ids || undefined,
      }),
    () => {
      const base = mock.buildMarkets(page, perPage);
      if (!ids) return base;
      const set = new Set(String(ids).split(',').map((s) => s.trim().toLowerCase()));
      // Always rebuild from the full deterministic top list so requested ids
      // resolve regardless of which "page" they would fall on.
      return mock.buildMarkets(1, mock.TOP_COINS.length).filter((c) => set.has(c.id));
    }
  );
};

const getCoin = async (id) =>
  cachedFetch(
    `coin:${id}`,
    TTL.coin,
    () =>
      get(`/coins/${id}`, {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false,
      }),
    () => mock.buildCoinDetail(id) || { id, name: id, symbol: id, market_data: { current_price: { usd: 0 } } }
  );

const getMarketChart = async (id, { vs = 'usd', days = 7 } = {}) =>
  cachedFetch(
    `chart:${id}:${vs}:${days}`,
    TTL.chart,
    () => get(`/coins/${id}/market_chart`, { vs_currency: vs, days }),
    () => mock.buildMarketChart(id, days) || { prices: [], market_caps: [], total_volumes: [] }
  );

const getTrending = async () =>
  cachedFetch('trending', TTL.trending, () => get('/search/trending'), () => mock.buildTrending());

const getGlobal = async () =>
  cachedFetch('global', TTL.global, () => get('/global'), () => mock.buildGlobal());

const search = async (query) => {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return { data: { coins: [] }, status: 'SKIP', source: 'none' };
  return cachedFetch(
    `search:${q}`,
    TTL.search,
    () => get('/search', { query: q }),
    () => {
      const coins = mock.TOP_COINS
        .filter((c) => c.id.includes(q) || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
        .slice(0, 10)
        .map((c, i) => ({
          id: c.id,
          name: c.name,
          api_symbol: c.symbol,
          symbol: c.symbol.toUpperCase(),
          market_cap_rank: c.rank,
          thumb: `https://assets.coingecko.com/coins/images/1/thumb/${c.id}.png`,
          large: `https://assets.coingecko.com/coins/images/1/large/${c.id}.png`,
        }));
      return { coins };
    }
  );
};

// Returns { [coinId]: { usd: number, usd_24h_change: number } }
const getSimplePrices = async (ids, vs = 'usd') => {
  const list = (Array.isArray(ids) ? ids : String(ids || '').split(','))
    .map((s) => String(s || '').trim().toLowerCase())
    .filter(Boolean);
  if (!list.length) return { data: {}, status: 'SKIP', source: 'none' };
  const key = `simple:${vs}:${list.slice().sort().join(',')}`;
  return cachedFetch(
    key,
    TTL.simplePrice,
    () =>
      get('/simple/price', {
        ids: list.join(','),
        vs_currencies: vs,
        include_24hr_change: true,
        include_market_cap: false,
      }),
    () => {
      const out = {};
      const all = mock.buildMarkets(1, mock.TOP_COINS.length);
      for (const id of list) {
        const c = all.find((x) => x.id === id);
        if (c) {
          out[id] = {
            [vs]: c.current_price,
            [`${vs}_24h_change`]: c.price_change_percentage_24h,
          };
        }
      }
      return out;
    }
  );
};

const cacheStats = () => ({
  keys: cache.keys().length,
  hits: cache.getStats().hits,
  misses: cache.getStats().misses,
  ksize: cache.getStats().ksize,
  vsize: cache.getStats().vsize,
});

const flushCache = () => cache.flushAll();

module.exports = {
  getMarkets,
  getCoin,
  getMarketChart,
  getTrending,
  getGlobal,
  getSimplePrices,
  search,
  cacheStats,
  flushCache,
  TTL,
};
