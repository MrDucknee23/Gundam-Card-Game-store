import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'admin' | 'super_admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string, isAdminLogin?: boolean) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string, isAdminLogin = false): Promise<boolean> => {
    try {
      // Mock authentication - Replace with real API call
      if (isAdminLogin) {
        // Admin login validation
        if (email === 'admin@gundamstore.com' && password === 'admin123') {
          const adminUser: User = {
            id: '1',
            email: 'admin@gundamstore.com',
            fullName: 'System Administrator',
            role: 'super_admin'
          };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        } else if (email.includes('@admin') && password) {
          // Regular admin
          const adminUser: User = {
            id: '2',
            email: email,
            fullName: 'Admin User',
            role: 'admin'
          };
          setUser(adminUser);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        }
        return false;
      } else {
        // Customer login
        if (email && password) {
          const customerUser: User = {
            id: '3',
            email: email,
            fullName: 'Customer User',
            role: 'customer'
          };
          setUser(customerUser);
          localStorage.setItem('user', JSON.stringify(customerUser));
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, isAdmin, login, logout, loading }),
    [user, isAdmin, loading, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};