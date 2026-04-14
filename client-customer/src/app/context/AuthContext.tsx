import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const API_URL = 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin' | 'super_admin';
  phone?: string;
  address?: string;
  joinDate?: string;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<string | null>;
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string, address?: string) => Promise<string | null>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed?.token) {
            setUser(parsed);
          } else {
            localStorage.removeItem('user');
          }
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, isAdminLogin = false): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return err.error || 'Đăng nhập thất bại';
      }
      const data = await res.json();
      if (isAdminLogin && data.role !== 'admin' && data.role !== 'super_admin') {
        return 'Tài khoản không có quyền admin';
      }
      const loggedUser: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone || '',
        address: data.address || '',
        joinDate: data.joinDate || '',
        token: data.token,
      };
      setUser(loggedUser);
      localStorage.setItem('user', JSON.stringify(loggedUser));
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return 'Lỗi kết nối server';
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone = '',
    address = ''
  ): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, phone, address }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return err.error || 'Đăng ký thất bại';
      }
      const data = await res.json();
      const newUser: User = {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        phone: data.phone || '',
        address: data.address || '',
        joinDate: data.joinDate || '',
        token: data.token,
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return null;
    } catch (error) {
      console.error('Register error:', error);
      return 'Lỗi kết nối server';
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  // Helper: fetch with JWT token if available
  const authFetch = useCallback(
    async (input: RequestInfo, init: RequestInit = {}) => {
      const token = user?.token;
      const headers = {
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      return fetch(input, { ...init, headers });
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isAdmin, login, register, logout, loading }),
    [user, isAdmin, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};