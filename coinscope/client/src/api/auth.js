import api, { unwrap } from './axios';

export const register = async ({ name, email, password }) => {
  const res = await api.post('/auth/register', { name, email, password });
  return unwrap(res);
};

export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password });
  return unwrap(res);
};

export const me = async () => {
  const res = await api.get('/auth/me');
  return unwrap(res);
};
