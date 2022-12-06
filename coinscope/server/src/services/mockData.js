// Deterministic mock dataset used when CoinGecko is unreachable or USE_MOCK_DATA=true.
// Keeps the full UX demonstrable with zero external dependencies.

const TOP_COINS = [
  { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', price: 42150.32, change_24h: 2.45, change_7d: 4.1, change_1h: 0.21, mcap: 825_400_000_000, vol: 28_400_000_000, supply: 19_580_000, rank: 1 },
  { id: 'ethereum', symbol: 'eth', name: 'Ethereum', price: 2340.55, change_24h: 1.85, change_7d: 5.3, change_1h: 0.11, mcap: 281_200_000_000, vol: 15_200_000_000, supply: 120_200_000, rank: 2 },
  { id: 'tether', symbol: 'usdt', name: 'Tether', price: 1.0, change_24h: 0.01, change_7d: 0.0, change_1h: 0.0, mcap: 95_300_000_000, vol: 42_100_000_000, supply: 95_300_000_000, rank: 3 },
  { id: 'binancecoin', symbol: 'bnb', name: 'BNB', price: 312.4, change_24h: -0.42, change_7d: 1.8, change_1h: -0.05, mcap: 47_900_000_000, vol: 1_300_000_000, supply: 153_400_000, rank: 4 },
  { id: 'solana', symbol: 'sol', name: 'Solana', price: 98.21, change_24h: 4.65, change_7d: 12.5, change_1h: 0.51, mcap: 43_100_000_000, vol: 2_600_000_000, supply: 438_000_000, rank: 5 },
  { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', price: 1.0, change_24h: -0.01, change_7d: 0.0, change_1h: 0.0, mcap: 25_700_000_000, vol: 6_800_000_000, supply: 25_700_000_000, rank: 6 },
  { id: 'ripple', symbol: 'xrp', name: 'XRP', price: 0.61, change_24h: -1.12, change_7d: 2.4, change_1h: -0.08, mcap: 33_400_000_000, vol: 1_100_000_000, supply: 54_700_000_000, rank: 7 },
  { id: 'cardano', symbol: 'ada', name: 'Cardano', price: 0.48, change_24h: 0.95, change_7d: 3.1, change_1h: 0.04, mcap: 17_100_000_000, vol: 420_000_000, supply: 35_600_000_000, rank: 8 },
  { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', price: 0.085, change_24h: -2.15, change_7d: -1.2, change_1h: -0.12, mcap: 12_300_000_000, vol: 540_000_000, supply: 144_600_000_000, rank: 9 },
  { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', price: 35.21, change_24h: 3.45, change_7d: 8.7, change_1h: 0.18, mcap: 13_800_000_000, vol: 720_000_000, supply: 391_900_000, rank: 10 },
  { id: 'polkadot', symbol: 'dot', name: 'Polkadot', price: 6.85, change_24h: 1.25, change_7d: 2.8, change_1h: 0.05, mcap: 9_100_000_000, vol: 240_000_000, supply: 1_330_000_000, rank: 11 },
  { id: 'tron', symbol: 'trx', name: 'TRON', price: 0.11, change_24h: 0.32, change_7d: 0.9, change_1h: 0.01, mcap: 10_500_000_000, vol: 360_000_000, supply: 95_500_000_000, rank: 12 },
  { id: 'chainlink', symbol: 'link', name: 'Chainlink', price: 14.85, change_24h: 2.15, change_7d: 4.6, change_1h: 0.09, mcap: 8_700_000_000, vol: 410_000_000, supply: 586_000_000, rank: 13 },
  { id: 'polygon', symbol: 'matic', name: 'Polygon', price: 0.82, change_24h: 1.85, change_7d: 3.4, change_1h: 0.07, mcap: 7_900_000_000, vol: 380_000_000, supply: 9_640_000_000, rank: 14 },
  { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', price: 72.45, change_24h: -0.85, change_7d: 1.5, change_1h: -0.03, mcap: 5_400_000_000, vol: 360_000_000, supply: 74_500_000, rank: 15 },
  { id: 'shiba-inu', symbol: 'shib', name: 'Shiba Inu', price: 0.0000095, change_24h: -3.25, change_7d: -2.1, change_1h: -0.15, mcap: 5_600_000_000, vol: 210_000_000, supply: 589_000_000_000_000, rank: 16 },
  { id: 'uniswap', symbol: 'uni', name: 'Uniswap', price: 6.42, change_24h: 1.45, change_7d: 2.6, change_1h: 0.06, mcap: 4_900_000_000, vol: 145_000_000, supply: 763_000_000, rank: 17 },
  { id: 'cosmos', symbol: 'atom', name: 'Cosmos Hub', price: 9.85, change_24h: 2.85, change_7d: 4.9, change_1h: 0.14, mcap: 3_800_000_000, vol: 165_000_000, supply: 386_000_000, rank: 18 },
  { id: 'monero', symbol: 'xmr', name: 'Monero', price: 162.4, change_24h: 0.65, change_7d: 1.2, change_1h: 0.02, mcap: 2_950_000_000, vol: 78_000_000, supply: 18_200_000, rank: 19 },
  { id: 'stellar', symbol: 'xlm', name: 'Stellar', price: 0.12, change_24h: 1.05, change_7d: 2.1, change_1h: 0.03, mcap: 3_400_000_000, vol: 92_000_000, supply: 28_300_000_000, rank: 20 },
];

// Build a deterministic sparkline-like 7d series (168 hourly points) from a seed.
const sparkline = (seedPrice, drift = 0.05) => {
  const arr = [];
  let v = seedPrice * (1 - drift * 0.6);
  for (let i = 0; i < 168; i++) {
    // Pseudo-random but deterministic per index/seed:
    const r = Math.sin(i * 1.317 + seedPrice * 0.001) * 0.5 + 0.5;
    v = v * (1 + (r - 0.5) * 0.02);
    arr.push(Number(v.toFixed(8)));
  }
  arr[arr.length - 1] = seedPrice;
  return arr;
};

const imageFor = (id) =>
  `https://assets.coingecko.com/coins/images/1/large/${id}.png`;

const buildMarkets = (page = 1, perPage = 20) => {
  // For mocks we only serve TOP_COINS; pagination is a no-op past page 1.
  const start = (page - 1) * perPage;
  const slice = TOP_COINS.slice(start, start + perPage);
  return slice.map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: imageFor(c.id),
    current_price: c.price,
    market_cap: c.mcap,
    market_cap_rank: c.rank,
    fully_diluted_valuation: c.mcap,
    total_volume: c.vol,
    high_24h: c.price * 1.03,
    low_24h: c.price * 0.97,
    price_change_24h: c.price * (c.change_24h / 100),
    price_change_percentage_24h: c.change_24h,
    price_change_percentage_1h_in_currency: c.change_1h,
    price_change_percentage_24h_in_currency: c.change_24h,
    price_change_percentage_7d_in_currency: c.change_7d,
    circulating_supply: c.supply,
    total_supply: c.supply,
    max_supply: null,
    ath: c.price * 2.4,
    ath_change_percentage: -45,
    ath_date: '2021-11-10T14:24:11.849Z',
    atl: c.price * 0.1,
    atl_change_percentage: 900,
    atl_date: '2020-03-13T02:22:55.044Z',
    sparkline_in_7d: { price: sparkline(c.price) },
    last_updated: new Date().toISOString(),
  }));
};

const buildCoinDetail = (id) => {
  const c = TOP_COINS.find((x) => x.id === id);
  if (!c) return null;
  return {
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    image: { thumb: imageFor(c.id), small: imageFor(c.id), large: imageFor(c.id) },
    market_cap_rank: c.rank,
    description: {
      en: `${c.name} (${c.symbol.toUpperCase()}) is a major cryptocurrency. This is mock descriptive text used when CoinGecko is unreachable.`,
    },
    links: {
      homepage: [`https://example.com/${c.id}`],
      blockchain_site: [`https://example.com/explorer/${c.id}`],
      official_forum_url: [],
      subreddit_url: `https://reddit.com/r/${c.id}`,
      repos_url: { github: [`https://github.com/example/${c.id}`] },
    },
    market_data: {
      current_price: { usd: c.price },
      market_cap: { usd: c.mcap },
      total_volume: { usd: c.vol },
      high_24h: { usd: c.price * 1.03 },
      low_24h: { usd: c.price * 0.97 },
      price_change_percentage_24h: c.change_24h,
      price_change_percentage_7d: c.change_7d,
      price_change_percentage_30d: c.change_7d * 1.8,
      price_change_percentage_1y: c.change_7d * 10,
      ath: { usd: c.price * 2.4 },
      atl: { usd: c.price * 0.1 },
      circulating_supply: c.supply,
      total_supply: c.supply,
      max_supply: null,
    },
    last_updated: new Date().toISOString(),
  };
};

const buildMarketChart = (id, days = 7) => {
  const c = TOP_COINS.find((x) => x.id === id);
  if (!c) return null;
  const points = Math.max(24, Math.min(365, Number(days) * 24));
  const now = Date.now();
  const stepMs = (Number(days) * 24 * 60 * 60 * 1000) / points;
  const prices = [];
  const market_caps = [];
  const total_volumes = [];
  let v = c.price * 0.92;
  for (let i = 0; i < points; i++) {
    const t = now - (points - i) * stepMs;
    const r = Math.sin(i * 0.21 + c.price * 0.0007) * 0.5 + 0.5;
    v = v * (1 + (r - 0.5) * 0.018);
    prices.push([t, Number(v.toFixed(8))]);
    market_caps.push([t, v * c.supply]);
    total_volumes.push([t, c.vol * (0.7 + r * 0.6)]);
  }
  // Anchor the last point at the current price for visual consistency.
  prices[prices.length - 1] = [now, c.price];
  return { prices, market_caps, total_volumes };
};

const buildTrending = () => ({
  coins: TOP_COINS.slice(0, 7).map((c, i) => ({
    item: {
      id: c.id,
      coin_id: 100 + i,
      name: c.name,
      symbol: c.symbol.toUpperCase(),
      market_cap_rank: c.rank,
      thumb: imageFor(c.id),
      small: imageFor(c.id),
      large: imageFor(c.id),
      score: i,
      price_btc: c.price / 42150,
    },
  })),
});

const buildGlobal = () => ({
  data: {
    active_cryptocurrencies: 12_400,
    upcoming_icos: 0,
    ongoing_icos: 49,
    ended_icos: 3375,
    markets: 870,
    total_market_cap: { usd: 1_640_000_000_000 },
    total_volume: { usd: 78_900_000_000 },
    market_cap_percentage: { btc: 50.3, eth: 17.1 },
    market_cap_change_percentage_24h_usd: 1.85,
    updated_at: Math.floor(Date.now() / 1000),
  },
});

module.exports = {
  TOP_COINS,
  buildMarkets,
  buildCoinDetail,
  buildMarketChart,
  buildTrending,
  buildGlobal,
};
