import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15_000,
});

// Attach JWT from localStorage on every outbound request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coinscope_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Surface a flat error message for the UI; pass the original response through
// so the caller can introspect cache headers if needed.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response && err.response.data;
    const msg =
      (data && data.message) ||
      err.message ||
      'Network error';
    const e = new Error(msg);
    e.status = err.response && err.response.status;
    e.errors = (data && data.errors) || [];
    return Promise.reject(e);
  }
);

// Helpers that expose the cache headers alongside the response body.
export const unwrap = (res) => (res && res.data ? res.data.data : undefined);
export const cacheInfo = (res) => ({
  status: res && res.headers && res.headers['x-cache'],
  ttl: res && res.headers && res.headers['x-cache-ttl'],
  source: res && res.headers && res.headers['x-data-source'],
});

export default api;
