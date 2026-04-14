import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  cleanAddressInput,
  cleanNameInput,
  cleanPhoneInput,
  isValidAddress,
  isValidName,
  isValidPhone,
} from '../utils/validators';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });

  // ✅ VALIDATE
  const validateName = (name: string) => /^[A-Za-zÀ-ỹ\s]+$/.test(name);
  const validateAddress = (address: string) => /^[0-9A-Za-zÀ-ỹ\s,./-]+$/.test(address);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: cleanNameInput(e.target.value),
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      phone: cleanPhoneInput(e.target.value),
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      address: cleanAddressInput(e.target.value),
    });
  };
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
<<<<<<< HEAD
    } else {

      // ✅ FIX: validate tên
      if (!validateName(formData.firstName) || !validateName(formData.lastName)) {
        toast.error('Họ tên không hợp lệ');
        return;
      }

      // ✅ FIX: validate địa chỉ
      if (formData.address && !validateAddress(formData.address)) {
        toast.error('Địa chỉ không hợp lệ');
        return;
      }

      if (formData.password.length < 8) {
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
=======

      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Vui lòng nhập đầy đủ họ và tên');
      return;
    }

    if (!isValidName(formData.firstName) || !isValidName(formData.lastName)) {
      toast.error('Họ tên không được chứa số hoặc ký tự đặc biệt');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }

    if (!isValidPhone(formData.phone)) {
      toast.error('Số điện thoại chỉ được nhập số và phải từ 9 đến 11 chữ số');
      return;
    }

    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }

    if (!isValidAddress(formData.address)) {
      toast.error('Địa chỉ không được chứa ký tự đặc biệt');
      return;
    }

    if (formData.password.length < 8) {
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
        formData.phone.trim(),
        formData.address.trim()
      );

      if (success) {
        toast.success('Đăng ký thành công!');
        navigate('/profile');
>>>>>>> c27dcdde (Update user validation and address management)
      } else {
        toast.error('Email đã tồn tại hoặc có lỗi xảy ra');
      }
    } else {
      toast.error('Vui lòng điền đầy đủ thông tin');
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
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleNameChange}
                      placeholder="Nguyễn"
                      required
                      className="mt-1"
                    />
                  </div>
<<<<<<< HEAD
=======

>>>>>>> c27dcdde (Update user validation and address management)
                  <div>
                    <Label htmlFor="lastName">Tên</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleNameChange}
                      placeholder="Văn A"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
<<<<<<< HEAD
                  <Label htmlFor="phone">
                    Số điện thoại
                    <span className="text-gray-400 font-normal text-xs ml-1">(tùy chọn)</span>
                  </Label>
=======
                  <Label htmlFor="phone">Số điện thoại</Label>
>>>>>>> c27dcdde (Update user validation and address management)
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="0909123456"
                    inputMode="numeric"
<<<<<<< HEAD
                    maxLength={10}
=======
                    maxLength={11}
                    required
>>>>>>> c27dcdde (Update user validation and address management)
                    className="mt-1"
                  />
                </div>

                <div>
<<<<<<< HEAD
                  <Label htmlFor="address">
                    Địa chỉ
                    <span className="text-gray-400 font-normal text-xs ml-1">(tùy chọn)</span>
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address || ''} // ✅ FIX undefined
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^[0-9A-Za-zÀ-ỹ\s,./-]*$/.test(value)) {
                        setFormData({ ...formData, address: value });
                      }
                    }}
                    placeholder="123 Đường Lê Lợi, Quận 1, TP.HCM"
=======
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleAddressChange}
                    placeholder="123 Đường Lê Lợi Quận 1 TP Hồ Chí Minh"
                    required
>>>>>>> c27dcdde (Update user validation and address management)
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="example@gmail.com"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isLogin ? '••••••••' : 'Ít nhất 8 ký tự'}
                required
                className="mt-1"
              />
<<<<<<< HEAD
=======

>>>>>>> c27dcdde (Update user validation and address management)
              {!isLogin && formData.password.length > 0 && formData.password.length < 8 && (
                <p className="text-red-500 text-xs mt-1">
                  Cần thêm {8 - formData.password.length} ký tự nữa
                </p>
              )}
<<<<<<< HEAD
              {!isLogin && formData.password.length >= 8 && (
                <p className="text-green-500 text-xs mt-1">✓ Mật khẩu hợp lệ</p>
=======

              {!isLogin && formData.password.length >= 8 && (
                <p className="text-green-500 text-xs mt-1">Mật khẩu hợp lệ</p>
>>>>>>> c27dcdde (Update user validation and address management)
              )}
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu"
                  required
                  className="mt-1"
                />
<<<<<<< HEAD
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">✓ Mật khẩu khớp</p>
=======

                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Mật khẩu không khớp</p>
                )}

                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className="text-green-500 text-xs mt-1">Mật khẩu khớp</p>
>>>>>>> c27dcdde (Update user validation and address management)
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

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-secondary hover:underline">
              {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <Link to="/admin/login" className="text-sm text-gray-600 hover:text-primary">
                Đăng nhập Admin
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};