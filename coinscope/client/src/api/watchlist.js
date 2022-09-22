import api, { unwrap } from './axios';

export const fetchWatchlist = async () => {
  const res = await api.get('/watchlist');
  return unwrap(res);
};

export const addToWatchlist = async (payload) => {
  const res = await api.post('/watchlist', payload);
  return unwrap(res);
};

export const removeFromWatchlist = async (coinId) => {
  const res = await api.delete(`/watchlist/${coinId}`);
  return unwrap(res);
};
