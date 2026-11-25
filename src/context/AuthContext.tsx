import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { apiRequest, setAuthToken } from '../lib/api.ts';
import type { AuthUser } from '../types/index.ts';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  applyAuthSession: (user: AuthUser, token?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiRequest<{ user: AuthUser }>('/api/auth/me');
      setUser(res.user);
    } catch {
      setUser(null);
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const applyAuthSession = useCallback((nextUser: AuthUser, token?: string) => {
    if (token) setAuthToken(token);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest<{ user: AuthUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (input: {
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }) => {
      const res = await apiRequest<{ user: AuthUser; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        darkMode,
        toggleDarkMode,
        login,
        register,
        logout,
        refreshUser,
        applyAuthSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
