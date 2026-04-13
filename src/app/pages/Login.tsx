import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      if (formData.email && formData.password) {
        const success = await login(formData.email, formData.password, false);
        if (success) {
          toast.success('Đăng nhập thành công!');
          navigate('/profile');
        } else {
          toast.error('Email hoặc mật khẩu không đúng');
        }
      } else {
        toast.error('Vui lòng điền đầy đủ thông tin');
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu không khớp');
        return;
      }
      if (formData.email && formData.password && formData.firstName && formData.lastName) {
        const success = await register(formData.email, formData.password, formData.firstName, formData.lastName);
        if (success) {
          toast.success('Đăng ký thành công!');
          navigate('/profile');
        } else {
          toast.error('Email đã tồn tại hoặc có lỗi xảy ra');
        }
      } else {
        toast.error('Vui lòng điền đầy đủ thông tin');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            {isLogin ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Đăng nhập vào tài khoản của bạn' : 'Đăng ký tài khoản mới'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Họ</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Tên</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="mt-1" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} required className="mt-1" />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required className="mt-1" />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-secondary hover:underline">
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link to="/admin/login" className="text-sm text-gray-600 hover:text-primary">
                Đăng nhập Admin →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};