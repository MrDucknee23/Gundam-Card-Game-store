import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const API_URL = 'http://localhost:5000';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin' | 'super_admin';
  phone?: string;
  address?: string;
  avatar?: string;
  joinDate?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<boolean>;
  register: (email: string, password: string, firstName: string, lastName: string, phone?: string, address?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
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

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const hasValidSession = parsedUser?.id && parsedUser?.email && parsedUser?.role;

          if (hasValidSession) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('user');
          }
        }
      }
    } catch (error) {
      console.error('Error restoring user from localStorage:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, isAdminLogin = false): Promise<boolean> => {
    try {
      if (isAdminLogin) {
        if (email === 'admin@gundamstore.com' && password === 'admin123') {
          const savedAvatar = localStorage.getItem('user_avatar_' + email) || '';
          const adminUser: User = { id: '1', email, fullName: 'System Administrator', role: 'super_admin', avatar: savedAvatar };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.removeItem('guestOrderEmail');
          localStorage.removeItem('guestOrderPhone');
          localStorage.removeItem('guestOrderName');
          return true;
        } else if (email.includes('@admin') && password) {
          const savedAvatar = localStorage.getItem('user_avatar_' + email) || '';
          const adminUser: User = { id: '2', email, fullName: 'Admin User', role: 'admin', avatar: savedAvatar };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.removeItem('guestOrderEmail');
          localStorage.removeItem('guestOrderPhone');
          localStorage.removeItem('guestOrderName');
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
        const savedAvatar = localStorage.getItem('user_avatar_' + data.email) || '';
        const loggedUser: User = {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          phone: data.phone || '',
          address: data.address || '',
          avatar: data.avatar || savedAvatar,
          joinDate: data.joinDate || '',
        };
        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        localStorage.removeItem('guestOrderEmail');
        localStorage.removeItem('guestOrderPhone');
        localStorage.removeItem('guestOrderName');
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
        avatar: data.avatar || '',
        joinDate: data.joinDate || '',
      };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.removeItem('guestOrderEmail');
      localStorage.removeItem('guestOrderPhone');
      localStorage.removeItem('guestOrderName');
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    // avatar is preserved in separate 'user_avatar_<email>' keys
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      if (updates.avatar !== undefined) {
        localStorage.setItem('user_avatar_' + prev.email, updates.avatar || '');
      }
      return updated;
    });
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isAdmin, login, register, logout, updateUser, loading }),
    [user, isAdmin, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};