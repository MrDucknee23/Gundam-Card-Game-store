import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Boxes,
  PackageSearch,
  ReceiptText,
  Users,
  Truck,
  MessageCircleMore,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/categories', label: 'Danh mục sản phẩm', icon: Boxes },
    { path: '/admin/products', label: 'Quản lý sản phẩm', icon: PackageSearch },
    { path: '/admin/orders', label: 'Quản lý đơn hàng', icon: ReceiptText },
    { path: '/admin/users', label: 'Người dùng', icon: Users },
    { path: '/admin/inventory/inbound', label: 'Nhập hàng', icon: Truck },
    { path: '/admin/chat', label: 'Chat', icon: MessageCircleMore },
  ];

  const isActiveMenuItem = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f5f7fb_40%,#edf2f9_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[26rem] bg-[radial-gradient(circle_at_top_left,rgba(220,20,60,0.14),transparent_32%),radial-gradient(circle_at_top_right,rgba(0,102,204,0.10),transparent_28%)]" />
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-white/70 bg-white/72 backdrop-blur-2xl shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#ff4f74_0%,#dc143c_100%)] shadow-[0_12px_30px_rgba(220,20,60,0.28)]">
                  <span className="text-white font-bold text-lg">G</span>
                </div>
                <div>
                  <h1 className="text-slate-950 font-semibold text-lg leading-tight">Admin Portal</h1>
                  <p className="text-xs text-slate-500">Gundam & Card Store</p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden xl:grid flex-1 grid-cols-7 gap-3 px-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-[26px] border px-3 py-3 text-center transition-all duration-300 ${
                    isActiveMenuItem(item.path)
                      ? 'border-primary/20 bg-[linear-gradient(180deg,#ff4b72_0%,#dc143c_100%)] text-white shadow-[0_18px_40px_rgba(220,20,60,0.24)]'
                      : 'border-white/80 bg-white/65 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_8px_24px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:text-slate-950 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isActiveMenuItem(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-primary'}`} />
                  <span className="text-sm font-semibold leading-tight">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              {/* View Store Link */}
              <Link
                to="/"
                className="hidden rounded-full border border-white/80 bg-white/70 px-4 py-2 text-sm font-medium text-secondary shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-colors hover:text-secondary/80 md:block"
              >
                View Store →
              </Link>

              {/* User Info & Logout */}
              <div className="hidden items-center gap-3 rounded-full border border-white/80 bg-white/70 px-3 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.05)] md:flex">
                <div className="text-right">
                  <p className="text-sm text-slate-950 font-medium">{user?.fullName}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition-all duration-200 hover:bg-slate-200"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-2xl border border-white/80 bg-white/70 p-2 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition-colors hover:bg-white xl:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="xl:hidden mt-4 pt-4 border-t border-slate-200/80">
              <nav className="grid gap-2 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex min-h-[60px] items-center gap-3 rounded-[22px] border px-4 py-3 font-medium transition-all duration-200 ${
                      isActiveMenuItem(item.path)
                        ? 'border-primary/20 bg-[linear-gradient(180deg,#ff4b72_0%,#dc143c_100%)] text-white'
                        : 'border-white/80 bg-white/70 text-slate-700 hover:bg-white hover:text-slate-950'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
                <div className="pt-2 border-t border-gray-200 mt-2 sm:col-span-2">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 text-secondary hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    View Store →
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-black rounded-lg transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1920px] mx-auto px-6 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-white/70 bg-white/72 backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © 2026 Gundam & Card Store Admin Panel
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link to="/admin" className="hover:text-black transition-colors">
                Help
              </Link>
              <Link to="/admin" className="hover:text-black transition-colors">
                Documentation
              </Link>
              <Link to="/admin" className="hover:text-black transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};