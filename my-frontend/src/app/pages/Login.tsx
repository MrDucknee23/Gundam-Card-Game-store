import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const EyeClosedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 10 Q7 17 12 17 Q17 17 22 10" />
    <line x1="6"  y1="16"    x2="4.5"  y2="19.5" />
    <line x1="12" y1="17.5"  x2="12"   y2="21"   />
    <line x1="18" y1="16"    x2="19.5" y2="19.5"  />
  </svg>
);

const SharinganEye: React.FC<{ size?: number }> = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#CC0000" />
    <circle cx="50" cy="50" r="48" fill="none" stroke="#1a0000" strokeWidth="4" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="#1a0000" strokeWidth="3" />
    <circle cx="50" cy="50" r="13" fill="#1a0000" />
    <g transform="rotate(0, 50, 50)">
      <circle cx="50" cy="22" r="7" fill="#1a0000" />
      <ellipse cx="50" cy="30" rx="4" ry="7" fill="#1a0000" transform="rotate(0,50,30)" />
    </g>
    <g transform="rotate(120, 50, 50)">
      <circle cx="50" cy="22" r="7" fill="#1a0000" />
      <ellipse cx="50" cy="30" rx="4" ry="7" fill="#1a0000" />
    </g>
    <g transform="rotate(240, 50, 50)">
      <circle cx="50" cy="22" r="7" fill="#1a0000" />
      <ellipse cx="50" cy="30" rx="4" ry="7" fill="#1a0000" />
    </g>
    <circle cx="41" cy="41" r="5" fill="rgba(255,255,255,0.18)" />
  </svg>
);

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  const validateName = (name: string) => /^[A-Za-zÀ-ỹ\s]+$/.test(name);
  const validateAddress = (address: string) => /^[0-9A-Za-zÀ-ỹ\s,./-]+$/.test(address);

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[A-Za-zÀ-ỹ\s]*$/.test(value)) {
      setFormData({ ...formData, [e.target.name]: value });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setFormData({ ...formData, phone: val });
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
      if (!validateName(formData.firstName) || !validateName(formData.lastName)) {
        toast.error('Họ tên không hợp lệ');
        return;
      }
      if (formData.address && !validateAddress(formData.address)) {
        toast.error('Địa chỉ không hợp lệ');
        return;
      }
      if (formData.password.length <= 8) {
        toast.error('Mật khẩu phải có ít nhất 8 ký tự');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Mật khẩu không khớp');
        return;
      }
      if (formData.email && formData.password && formData.firstName && formData.lastName) {
        const success = await register(
          formData.email,
          formData.password,
          formData.firstName.trim(),
          formData.lastName.trim(),
          formData.phone,
          formData.address.trim(),
        );
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
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Họ</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleNameChange} placeholder="Nguyễn" required className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Tên</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleNameChange} placeholder="Văn A" required className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">
                    Số điện thoại
                    <span className="text-gray-400 font-normal text-xs ml-1">(tùy chọn)</span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="0909123456" inputMode="numeric" maxLength={10} className="mt-1" />
                </div>

                <div>
                  <Label htmlFor="address">
                    Địa chỉ
                    <span className="text-gray-400 font-normal text-xs ml-1">(tùy chọn)</span>
                  </Label>
                  <Input
                    id="address" name="address" value={formData.address || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9A-Za-zÀ-ỹ\s,./-]*$/.test(value)) {
                        setFormData({ ...formData, address: value });
                      }
                    }}
                    placeholder="123 Đường Lê Lợi, Quận 1, TP.HCM"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="example@gmail.com" required className="mt-1" />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLogin ? '••••••••' : 'Ít nhất 8 ký tự'}
                  required
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((c) => !c)}
                  className="absolute inset-y-0 right-3 flex items-center hover:scale-110 transition-transform"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <SharinganEye size={22} /> : <EyeClosedIcon />}
                </button>
              </div>

              {!isLogin && formData.password.length > 0 && formData.password.length < 8 && (
                <p className="text-red-500 text-xs mt-1">Cần thêm {8 - formData.password.length} ký tự nữa</p>
              )}
              {!isLogin && formData.password.length >= 8 && (
                <p className="text-green-500 text-xs mt-1">✓ Mật khẩu hợp lệ</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((c) => !c)}
                    className="absolute inset-y-0 right-3 flex items-center hover:scale-110 transition-transform"
                    aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
                  >
                    {showConfirmPassword ? <SharinganEye size={22} /> : <EyeClosedIcon />}
                  </button>
                </div>

                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">✓ Mật khẩu khớp</p>
                )}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-secondary hover:underline">
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>

            {isLogin && (
              <div>
                <button type="button" onClick={() => navigate('/shop')} className="text-sm text-primary hover:underline font-medium">
                  Tiếp tục mua hàng với guest
                </button>
              </div>
            )}
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