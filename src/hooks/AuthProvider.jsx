import { useCallback, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from './AuthContext';
import { setUnauthorizedHandler } from '../api';

const EMPTY_SESSION = { token: null, user: null };

const getTokenExpiry = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp ? exp * 1000 : null;
  } catch {
    return null;
  }
};

const clearStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const readStoredSession = () => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    return EMPTY_SESSION;
  }

  const expiry = getTokenExpiry(token);
  if (!expiry || expiry <= Date.now()) {
    clearStorage();
    return EMPTY_SESSION;
  }

  try {
    return { token, user: JSON.parse(userData) };
  } catch {
    clearStorage();
    return EMPTY_SESSION;
  }
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(readStoredSession);

  const login = useCallback((token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setSession({ token, user });
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setSession(EMPTY_SESSION);
  }, []);

  const updateUser = useCallback((user) => {
    setSession((prev) => {
      const merged = { ...prev.user, ...user };
      localStorage.setItem('user', JSON.stringify(merged));
      return { ...prev, user: merged };
    });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!session.token) return;

    const expiry = getTokenExpiry(session.token);
    const timer = setTimeout(logout, Math.max(expiry - Date.now(), 0));
    return () => clearTimeout(timer);
  }, [session.token, logout]);

  const value = useMemo(() => ({
    user: session.user,
    isLoggedIn: Boolean(session.token && session.user),
    login,
    logout,
    updateUser,
  }), [session, login, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
