import api, { unwrap, cacheInfo } from './axios';

export const fetchMarkets = async ({ page = 1, perPage = 50, ids } = {}) => {
  const res = await api.get('/coins/markets', {
    params: { page, per_page: perPage, ids, sparkline: true },
  });
  return { data: unwrap(res), cache: cacheInfo(res) };
};

export const fetchTrending = async () => {
  const res = await api.get('/coins/trending');
  return { data: unwrap(res), cache: cacheInfo(res) };
};

export const fetchGlobal = async () => {
  const res = await api.get('/coins/global');
  return { data: unwrap(res), cache: cacheInfo(res) };
};

export const fetchCoin = async (id) => {
  const res = await api.get(`/coins/${id}`);
  return { data: unwrap(res), cache: cacheInfo(res) };
};

export const fetchChart = async (id, days = 7) => {
  const res = await api.get(`/coins/${id}/chart`, { params: { days } });
  return { data: unwrap(res), cache: cacheInfo(res) };
};

export const searchCoins = async (q) => {
  const res = await api.get('/coins/search', { params: { q } });
  return { data: unwrap(res), cache: cacheInfo(res) };
};
