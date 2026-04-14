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
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string, address?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, isAdminLogin = false): Promise<boolean> => {
    try {
      if (isAdminLogin) {
        if (email === 'admin@gundamstore.com' && password === 'admin123') {
          const adminUser: User = { id: '1', email, fullName: 'System Administrator', role: 'super_admin' };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        } else if (email.includes('@admin') && password) {
          const adminUser: User = { id: '2', email, fullName: 'Admin User', role: 'admin' };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        }
        return false;
      } else {
        const res = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        if (!res.ok) return false;
        const data = await res.json();
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
        return true;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone = '',
    address = ''
  ): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, phone, address }),
      });
      if (!res.ok) return false;
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
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
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