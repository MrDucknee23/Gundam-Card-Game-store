import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { limitedToast } from '../utils/limitedToast';
import { PokemonPasswordIcon } from '../components/ui/PokemonPasswordIcon';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      limitedToast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(formData.email, formData.password, true);
      
      if (success) {
        limitedToast.success('Đăng nhập admin thành công!');
        navigate('/admin');
      } else {
        limitedToast.error('Thông tin đăng nhập không đúng');
      }
    } catch (error) {
      limitedToast.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                />
              </svg>
            </div>
          </div>

          <h1 className="text-black mb-2">Cổng quản trị Admin</h1>
          <p className="text-gray-600">Đăng nhập để truy cập trang quản trị</p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-black mb-2 block">
                Địa chỉ Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@gundamstore.com"
                required
                className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-black mb-2 block">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  required
                  className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-primary pr-16"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-2 flex items-center rounded-full bg-transparent p-1 transition-transform hover:scale-110 hover:bg-transparent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <PokemonPasswordIcon isOpen={showPassword} />
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Thông tin đăng nhập Demo:</p>
              <p className="text-sm text-black font-mono">admin@gundamstore.com</p>
              <p className="text-sm text-black font-mono">admin123</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-secondary hover:text-secondary/80 transition-colors"
            >
              ← Quay lại trang đăng nhập khách hàng
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Khu vực bảo mật. Nghiêm cấm truy cập trái phép.
          </p>
        </div>
      </div>
    </div>
  );
};