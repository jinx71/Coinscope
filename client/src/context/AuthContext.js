// AuthContext: persists the JWT in localStorage and exposes login/register/logout.
// NOTE: For portfolio simplicity we use localStorage. In production an httpOnly,
// SameSite=Lax cookie is the more secure choice — it removes XSS exfiltration
// of the token entirely.

import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth';

const TOKEN_KEY = 'coinscope_token';
const USER_KEY = 'coinscope_user';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  // Validate the persisted token against the backend on mount.
  useEffect(() => {
    let cancelled = false;
    const verify = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await authApi.me();
        if (!cancelled && data && data.user) {
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }
      } catch (_) {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persist = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
    else localStorage.removeItem(TOKEN_KEY);
    if (nextUser) localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(USER_KEY);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (creds) => {
      const data = await authApi.login(creds);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      persist(data.token, data.user);
      return data.user;
    },
    [persist]
  );

  const logout = useCallback(() => {
    persist(null, null);
  }, [persist]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
