import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export interface User {
  id: string;
  email?: string;
  role?: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('scopeseal_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const storedToken = localStorage.getItem('scopeseal_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiRequest<{ user: User }>('/auth/me');
        setUser(res.user);
      } catch (err) {
        console.warn('Session verification failed, clearing token');
        localStorage.removeItem('scopeseal_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifySession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/session', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      localStorage.setItem('scopeseal_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, fullName })
      });

      localStorage.setItem('scopeseal_token', res.token);
      setToken(res.token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    await login('security.officer@scopeseal.test', 'SecurityKey#2026');
  };

  const logout = () => {
    localStorage.removeItem('scopeseal_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
