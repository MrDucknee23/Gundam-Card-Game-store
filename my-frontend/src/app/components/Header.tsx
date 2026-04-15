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
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
    setShowUserMenu(false);
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
              Liên hệ
            </Link>
          </nav>

          {/* Search, Cart, User */}
          <div className="flex items-center space-x-6">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative hidden lg:block group">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-gray-900 border-2 border-gray-700 text-white placeholder:text-gray-400 rounded-lg focus:outline-none focus:border-gray-600 group-hover:border-primary group-hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] transition-all duration-300"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              {/* Divider line */}
              <div className="absolute left-9 top-1/2 -translate-y-1/2 w-[1px] h-5 bg-gray-700 group-hover:bg-primary transition-colors duration-300"></div>
            </form>

            {/* Cart */}
            <Link to="/cart" className="relative hover:opacity-80 transition-opacity">
              <ShoppingCart className="w-6 h-6 text-white" />
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
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <User className="w-6 h-6 text-white" />
                  <span className="hidden md:block text-white text-sm">{user?.fullName}</span>
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
                  className="hover:opacity-80 transition-opacity"
                >
                  <User className="w-6 h-6 text-white" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2">
                    <Link
                      to="/login"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/login"
                      state={{ mode: 'register' }}
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Đăng ký
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="block px-4 py-2 text-black hover:bg-gray-50 transition-colors"
                    >
                      Xem đơn hàng
                    </Link>
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
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border-2 border-gray-700 text-white placeholder:text-gray-400 rounded-lg focus:outline-none focus:border-gray-600 group-hover:border-primary group-hover:shadow-[0_0_12px_rgba(255,0,0,0.4)] transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            {/* Divider line */}
            <div className="absolute left-9 top-1/2 -translate-y-1/2 w-[1px] h-5 bg-gray-700 group-hover:bg-primary transition-colors duration-300"></div>
          </div>
        </form>
      </div>
    </header>
  );
};