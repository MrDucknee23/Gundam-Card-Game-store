import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedQuery = searchQuery.trim();

    if (normalizedQuery) {
      navigate(`/shop?search=${encodeURIComponent(normalizedQuery)}`);
    } else {
      navigate('/shop');
    }

    setSearchQuery('');
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-black shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white whitespace-nowrap">GUNDAM <span className="text-primary">STORE</span></span>
          </Link>

          {/* Navigation */}
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
              Liên hệ
            </Link>
          </nav>

          {/* Search, Cart, User */}
          <div className="flex items-center gap-4 lg:gap-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative hidden lg:block group">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <Link to="/cart" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800">
              <ShoppingCart className="h-5 w-5" />
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
                  className="flex items-center gap-2 transition-opacity hover:opacity-80"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800">
                    <User className="h-5 w-5" />
                  </span>
                  <span className="hidden md:block max-w-[11rem] truncate text-white text-sm whitespace-nowrap">{user?.fullName}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
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
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-white transition-all duration-300 hover:border-slate-500 hover:bg-slate-800"
                >
                  <User className="h-5 w-5" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
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
          </div>
        </div>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="pb-4 lg:hidden group">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border border-slate-700 bg-slate-900 pl-5 pr-14 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.28)] placeholder:text-gray-400 transition-all duration-300 focus-visible:ring-0 focus-visible:border-primary/70 focus-visible:shadow-[0_10px_30px_rgba(227,24,55,0.28)] group-hover:border-slate-500"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="absolute right-1.5 top-1/2 flex h-8.5 w-8.5 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_18px_rgba(227,24,55,0.3)] transition-all duration-300 hover:scale-105 hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </header>
  );
};