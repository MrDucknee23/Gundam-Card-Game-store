import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
<<<<<<< HEAD

const API_URL = 'http://localhost:5000';
=======
import { buildApiUrl } from '../utils/api';
import { clearGuestOrderAccess } from '../utils/guestOrderAccess';
>>>>>>> main

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
<<<<<<< HEAD
=======
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  completeOAuthLogin: (token: string) => Promise<boolean>;
>>>>>>> main
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

<<<<<<< HEAD
=======
const TOKEN_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'user';

const isAdminRole = (role?: string) => role === 'admin' || role === 'super_admin';

const normalizeUserPayload = (data: any): User | null => {
  const source = data?.user ?? data;

  if (!source?.id || !source?.email || !source?.role) {
    return null;
  }

  return {
    id: source.id,
    email: source.email,
    fullName: source.fullName,
    role: source.role,
    phone: source.phone || '',
    address: source.address || '',
    avatar: source.avatar || '',
    joinDate: source.joinDate || '',
  };
};

const clearGuestCheckoutCache = () => {
  clearGuestOrderAccess();
};

const persistSession = (nextUser: User, token?: string) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
  clearGuestCheckoutCache();
};

const CART_STORAGE_KEY = 'cart_items';
export const CART_CLEAR_EVENT = 'cart-clear';
export const CART_USER_LOGIN_EVENT = 'cart-user-login';

const dispatchCartUserLogin = (userId: string) => {
  window.dispatchEvent(new CustomEvent(CART_USER_LOGIN_EVENT, { detail: { userId } }));
};

const clearStoredSession = () => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(CART_STORAGE_KEY);
  window.dispatchEvent(new Event(CART_CLEAR_EVENT));
};

>>>>>>> main
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
<<<<<<< HEAD
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
=======
    const restoreSession = async () => {
      try {
        if (typeof window === 'undefined' || !window.localStorage) {
          return;
        }

        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
          const response = await fetch(buildApiUrl('/auth/me'), {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            const restoredUser = normalizeUserPayload(data);

            if (restoredUser) {
              setUser(restoredUser);
              localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(restoredUser));
              dispatchCartUserLogin(restoredUser.id);
              return;
            }
          }

          clearStoredSession();
        }

        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          const parsedUser = normalizeUserPayload(JSON.parse(storedUser));
          if (parsedUser) {
            setUser(parsedUser);
            dispatchCartUserLogin(parsedUser.id);
          } else {
            localStorage.removeItem(USER_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Error restoring user from localStorage:', error);
        clearStoredSession();
      } finally {
        setLoading(false);
      }
    };

    void restoreSession();
>>>>>>> main
  }, []);

  const login = useCallback(async (email: string, password: string, isAdminLogin = false): Promise<boolean> => {
    try {
<<<<<<< HEAD
      if (isAdminLogin) {
        if (email === 'admin@gundamstore.com' && password === 'admin123') {
          const adminUser: User = { id: '1', email, fullName: 'System Administrator', role: 'super_admin', avatar: '' };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.removeItem('guestOrderEmail');
          localStorage.removeItem('guestOrderPhone');
          localStorage.removeItem('guestOrderName');
          return true;
        } else if (email.includes('@admin') && password) {
          const adminUser: User = { id: '2', email, fullName: 'Admin User', role: 'admin', avatar: '' };
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
        const loggedUser: User = {
          id: data.id,
          email: data.email,
          fullName: data.fullName,
          role: data.role,
          phone: data.phone || '',
          address: data.address || '',
          avatar: data.avatar || '',
          joinDate: data.joinDate || '',
        };
        setUser(loggedUser);
        localStorage.setItem('user', JSON.stringify(loggedUser));
        localStorage.removeItem('guestOrderEmail');
        localStorage.removeItem('guestOrderPhone');
        localStorage.removeItem('guestOrderName');
        return true;
      }
=======
      const res = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) return false;

      const data = await res.json();
      const loggedUser = normalizeUserPayload(data);
      if (!loggedUser || typeof data.token !== 'string' || data.token.trim().length === 0) {
        return false;
      }

      if (isAdminLogin && !isAdminRole(loggedUser.role)) {
        clearStoredSession();
        setUser(null);
        return false;
      }

      setUser(loggedUser);
      persistSession(loggedUser, data.token);
      dispatchCartUserLogin(loggedUser.id);
      return true;
>>>>>>> main
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
<<<<<<< HEAD
      const res = await fetch(`${API_URL}/api/auth/register`, {
=======
      const res = await fetch(buildApiUrl('/auth/register'), {
>>>>>>> main
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, phone, address }),
      });
      if (!res.ok) return false;
      const data = await res.json();
<<<<<<< HEAD
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
=======
      const newUser = normalizeUserPayload(data);
      if (!newUser) return false;
      setUser(newUser);
      persistSession(newUser, data.token);
      dispatchCartUserLogin(newUser.id);
>>>>>>> main
      return true;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, []);

<<<<<<< HEAD
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
=======
  const forgotPassword = useCallback(async (email: string) => {
    try {
      const response = await fetch(buildApiUrl('/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        message: data.message || data.error || 'Khong the gui yeu cau dat lai mat khau',
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, message: 'Khong the gui yeu cau dat lai mat khau' };
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      const response = await fetch(buildApiUrl('/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json().catch(() => ({}));
      return {
        success: response.ok,
        message: data.message || data.error || 'Khong the dat lai mat khau',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Khong the dat lai mat khau' };
    }
  }, []);

  const completeOAuthLogin = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(buildApiUrl('/auth/me'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return false;
      const data = await response.json();
      const oauthUser = normalizeUserPayload(data);
      if (!oauthUser) return false;
      setUser(oauthUser);
      persistSession(oauthUser, token);
      dispatchCartUserLogin(oauthUser.id);
      return true;
    } catch (error) {
      console.error('OAuth completion error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearStoredSession();
>>>>>>> main
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const value = useMemo(
<<<<<<< HEAD
    () => ({ user, isAuthenticated: !!user, isAdmin, login, register, logout, loading }),
    [user, isAdmin, loading, login, register, logout]
=======
    () => ({ user, isAuthenticated: !!user, isAdmin, login, register, forgotPassword, resetPassword, completeOAuthLogin, logout, loading }),
    [user, isAdmin, loading, login, register, forgotPassword, resetPassword, completeOAuthLogin, logout]
>>>>>>> main
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};