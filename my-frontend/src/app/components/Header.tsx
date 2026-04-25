<<<<<<< HEAD
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
=======
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, LogOut, Menu, X } from 'lucide-react';
>>>>>>> main
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
<<<<<<< HEAD

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
=======
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Close mobile menu on route change / resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setShowMobileMenu(false); };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery) {
      navigate(`/shop?search=${encodeURIComponent(normalizedQuery)}`);
    } else {
      navigate('/shop');
    }

    setSearchQuery('');
>>>>>>> main
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
    setShowUserMenu(false);
<<<<<<< HEAD
  };

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">GUNDAM <span className="text-primary">STORE</span></span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-300 hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link to="/shop" className="text-gray-300 hover:text-primary transition-colors">
              Cửa hàng
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-primary transition-colors">
              Giới thiệu
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors">
=======
    setShowMobileMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-black shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={() => setShowMobileMenu(false)}>
            <span className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">GUNDAM <span className="text-primary">STORE</span></span>
          </Link>

          {/* Navigation - desktop */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7">
            <Link to="/" className="text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              Trang chủ
            </Link>
            <Link to="/shop" className="text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              Cửa hàng
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              Giới thiệu
            </Link>
            <Link to="/faq" className="text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
              FAQ
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-primary transition-colors whitespace-nowrap">
>>>>>>> main
              Liên hệ
            </Link>
          </nav>

          {/* Search, Cart, User */}
<<<<<<< HEAD
          <div className="flex items-center space-x-6">
            {/* Search */}
=======
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            {/* Search - desktop only */}
>>>>>>> main
            <form onSubmit={handleSearch} className="relative hidden lg:block group">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
                className="w-64 pl-10 pr-4 py-2 bg-gray-900 border-2 border-gray-700 text-white placeholder:text-gray-400 rounded-lg focus:outline-none focus:border-gray-600 group-hover:border-primary group-hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              {/* Divider line */}
              <div className="absolute left-9 top-1/2 -translate-y-1/2 w-[1px] h-5 bg-gray-700 group-hover:bg-primary transition-colors duration-300"></div>
            </form>

            {/* Cart */}
            <Link to="/cart" className="relative hover:opacity-80 transition-opacity">
              <ShoppingCart className="w-6 h-6 text-white" />
=======
                className="h-11 w-64 xl:w-72 2xl:w-80 rounded-full border border-slate-700 bg-slate-900 pl-5 pr-14 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] placeholder:text-gray-400 transition-all duration-300 focus-visible:ring-0 focus-visible:border-primary/70 focus-visible:shadow-[0_10px_30px_rgba(227,24,55,0.28)] group-hover:border-slate-500"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-1.5 top-1/2 flex h-8.5 w-8.5 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_18px_rgba(227,24,55,0.3)] transition-all duration-300 hover:scale-105 hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Cart */}
            <Link to="/cart" className="relative flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
>>>>>>> main
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center p-0 text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
<<<<<<< HEAD
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <User className="w-6 h-6 text-white" />
                  <span className="hidden md:block text-white text-sm">{user?.fullName}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
=======
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <span className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                  </span>
                  <span className="hidden md:block max-w-[11rem] truncate text-white text-sm whitespace-nowrap">{user?.fullName}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
>>>>>>> main
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Hồ sơ
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Đơn hàng của tôi
                    </Link>
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-primary font-medium hover:bg-gray-50 transition-colors"
                      >
                        ← Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
<<<<<<< HEAD
                  className="hover:opacity-80 transition-opacity"
                >
                  <User className="w-6 h-6 text-white" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
=======
                  className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800"
                >
                  <User className="h-4 w-4 md:h-5 md:w-5" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
>>>>>>> main
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/login', { state: { mode: 'login' } });
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Đăng nhập
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/login', { state: { mode: 'register' } });
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Đăng ký
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/orders');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Xem đơn hàng
                    </button>
                  </div>
                )}
              </div>
            )}
<<<<<<< HEAD
=======

            {/* Hamburger - mobile only */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
              className="flex md:hidden h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800"
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
>>>>>>> main
          </div>
        </div>

        {/* Mobile Search */}
<<<<<<< HEAD
        <form onSubmit={handleSearch} className="pb-4 lg:hidden group">
=======
        <form onSubmit={handleSearch} className="pb-3 lg:hidden group">
>>>>>>> main
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
<<<<<<< HEAD
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border-2 border-gray-700 text-white placeholder:text-gray-400 rounded-lg focus:outline-none focus:border-gray-600 group-hover:border-primary group-hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            {/* Divider line */}
            <div className="absolute left-9 top-1/2 -translate-y-1/2 w-[1px] h-5 bg-gray-700 group-hover:bg-primary transition-colors duration-300"></div>
          </div>
        </form>
=======
              className="h-10 w-full rounded-full border border-slate-700 bg-slate-900 pl-5 pr-12 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] placeholder:text-gray-400 transition-all duration-300 focus-visible:ring-0 focus-visible:border-primary/70 focus-visible:shadow-[0_10px_30px_rgba(227,24,55,0.28)] group-hover:border-slate-500"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_18px_rgba(227,24,55,0.3)] transition-all duration-300 hover:scale-105 hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <nav className="md:hidden border-t border-slate-800 pb-4">
            <div className="flex flex-col gap-1 pt-3">
              {[
                { to: '/', label: 'Trang chủ' },
                { to: '/shop', label: 'Cửa hàng' },
                { to: '/about', label: 'Giới thiệu' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact', label: 'Liên hệ' },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowMobileMenu(false)}
                  className="px-3 py-2.5 text-gray-300 hover:text-primary hover:bg-slate-900 rounded-lg transition-colors text-base font-medium"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>
        )}
>>>>>>> main
      </div>
    </header>
  );
};