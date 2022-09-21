import api, { unwrap } from './axios';

export const fetchPortfolio = async () => {
  const res = await api.get('/portfolio');
  return unwrap(res);
};

export const addHolding = async (payload) => {
  const res = await api.post('/portfolio', payload);
  return unwrap(res);
};

export const updateHolding = async (id, payload) => {
  const res = await api.put(`/portfolio/${id}`, payload);
  return unwrap(res);
};

export const deleteHolding = async (id) => {
  const res = await api.delete(`/portfolio/${id}`);
  return unwrap(res);
};
