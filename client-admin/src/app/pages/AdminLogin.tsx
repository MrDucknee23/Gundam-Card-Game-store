import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);

    try {
      const loginError = await login(formData.email, formData.password, true);
      
      if (!loginError) {
        toast.success('Đăng nhập admin thành công!');
        navigate('/admin');
      } else {
        toast.error(loginError);
      }
    } catch (error) {
      toast.error('Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
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

        {/* Login Form */}
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
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-primary"
                disabled={isLoading}
              />
            </div>

            {/* Demo Credentials Info */}
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

          {/* Back to Customer Login */}
          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-secondary hover:text-secondary/80 transition-colors"
            >
              ← Quay lại trang đăng nhập khách hàng
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Khu vực bảo mật. Nghiêm cấm truy cập trái phép.
          </p>
        </div>
      </div>
    </div>
  );
};
