import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router';
import { ArrowRight, CheckCircle2, Chrome, Facebook, Loader2, Lock, Mail, Package2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { limitedToast } from '../utils/limitedToast';
import { buildApiUrl } from '../utils/api';
import { PokemonPasswordIcon } from '../components/ui/PokemonPasswordIcon';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
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
  const socialButtons = useMemo(() => ([
    { provider: 'google' as const, label: 'Tiếp tục với Google', icon: Chrome },
    { provider: 'facebook' as const, label: 'Tiếp tục với Facebook', icon: Facebook },
  ]), []);

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
      return;
    }

    if (location.state?.mode === 'login') {
      setIsLogin(true);
    }

    const oauthError = new URLSearchParams(location.search).get('oauthError');
    if (oauthError) {
      const oauthMessages: Record<string, string> = {
        account_blocked: 'Tai khoan cua ban dang bi khoa.',
        oauth_email_missing: 'Nha cung cap OAuth khong tra ve email. Vui long dung email/password hoac thu nha cung cap khac.',
        google_login_failed: 'Dang nhap Google that bai. Vui long thu lai.',
        facebook_login_failed: 'Dang nhap Facebook that bai. Vui long thu lai.',
      };
      limitedToast.error(oauthMessages[oauthError] || 'Dang nhap mang xa hoi that bai. Vui long thu lai.');
      navigate(location.pathname, { replace: true });
    }
  }, [location.pathname, location.search, location.state, navigate]);

  const startSocialLogin = (provider: 'google' | 'facebook') => {
    window.location.assign(buildApiUrl(`/auth/${provider}`));
  };

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
    setFormError('');
    setIsSubmitting(true);

    if (isLogin) {
      if (formData.email && formData.password) {
        const success = await login(formData.email, formData.password, false);
        if (success) {
          limitedToast.success('Đăng nhập thành công!');
          navigate('/profile');
        } else {
          const nextMessage = 'Email hoặc mật khẩu không đúng';
          setFormError(nextMessage);
          limitedToast.error(nextMessage);
        }
      } else {
        const nextMessage = 'Vui lòng điền đầy đủ thông tin';
        setFormError(nextMessage);
        limitedToast.error(nextMessage);
      }
    } else {
      if (!validateName(formData.firstName) || !validateName(formData.lastName)) {
        setIsSubmitting(false);
        limitedToast.error('Họ tên không hợp lệ');
        return;
      }
      if (formData.address && !validateAddress(formData.address)) {
        setIsSubmitting(false);
        limitedToast.error('Địa chỉ không hợp lệ');
        return;
      }
      if (formData.password.length < 8) {
        setIsSubmitting(false);
        limitedToast.error('Mật khẩu phải có ít nhất 8 ký tự');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setIsSubmitting(false);
        limitedToast.error('Mật khẩu không khớp');
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
          limitedToast.success('Đăng ký thành công!');
          navigate('/profile');
        } else {
          const nextMessage = 'Email đã tồn tại hoặc có lỗi xảy ra';
          setFormError(nextMessage);
          limitedToast.error(nextMessage);
        }
      } else {
        const nextMessage = 'Vui lòng điền đầy đủ thông tin';
        setFormError(nextMessage);
        limitedToast.error(nextMessage);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#fee2e2_0%,#eff6ff_32%,#ffffff_68%,#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-rose-200/45 blur-3xl"></div>
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-blue-200/45 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-red-100/45 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur xl:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden overflow-hidden border-r border-slate-100 bg-[linear-gradient(160deg,#0f172a_0%,#111827_45%,#8b1e3f_100%)] p-10 text-white xl:flex xl:flex-col xl:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.32),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(220,20,60,0.28),transparent_38%)]"></div>
            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                  <Package2 className="h-4 w-4" />
                </div>
                Danh tính Gundam Store
              </div>

              <div className="mt-10 max-w-lg space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-blue-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Truy cập an toàn cho khách hàng
                </div>
                <h2 className="text-4xl font-semibold leading-tight text-white">Đăng nhập nhanh, an toàn cho mọi nhà sưu tầm.</h2>
                <p className="max-w-md text-base leading-7 text-slate-200/90">
                  Đăng nhập để quản lý đơn hàng, lưu danh sách yêu thích và tiếp tục thanh toán với hệ thống xác thực đạt chuẩn triển khai thực tế.
                </p>
              </div>
            </div>

            <div className="relative grid gap-4">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-200" />
                  <div>
                    <p className="font-semibold text-white">Bảo mật phiên đăng nhập cấp doanh nghiệp</p>
                    <p className="mt-1 text-sm leading-6 text-slate-200/80">Xác thực JWT, token đặt lại mật khẩu có thời hạn, gộp tài khoản OAuth và lưu trữ thông tin đăng nhập an toàn hơn.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="grid gap-3 text-sm text-slate-100/85">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-200" /> Đăng nhập bằng Google và Facebook</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-200" /> Luồng đặt lại mật khẩu qua Gmail</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-200" /> Giao diện cao cấp, tương thích mọi thiết bị</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-rose-100 bg-white/95 px-3 py-2 shadow-sm xl:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                      <Package2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Gundam Store</span>
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-primary/55">Chào mừng trở lại</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {isLogin ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
                  </h1>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                    {isLogin
                      ? 'Sử dụng email và mật khẩu hoặc tiếp tục với nhà cung cấp OAuth mà bạn muốn.'
                      : 'Tạo tài khoản để quản lý đơn hàng, lưu tùy chọn cá nhân và theo dõi bộ sưu tập tại một nơi.'}
                  </p>
                </div>
                {isLogin && (
                  <Link to="/admin/login" className="hidden rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2 text-sm font-medium text-secondary transition hover:border-secondary/40 hover:bg-blue-50 hover:text-secondary sm:inline-flex">
                    Đăng nhập quản trị
                  </Link>
                )}
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#fff8f8_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
                {isLogin && (
                  <div className="mb-6 grid gap-3 sm:grid-cols-2">
                    {socialButtons.map(({ provider, label, icon: Icon }) => (
                      <button
                        key={provider}
                        type="button"
                        onClick={() => startSocialLogin(provider)}
                        disabled={isSubmitting}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}

                {isLogin && (
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] font-medium uppercase tracking-[0.24em] text-primary/50">
                      <span className="bg-white px-3">Hoặc</span>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-700">Họ</Label>
                    <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleNameChange} placeholder="Nguyễn" required className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:border-primary focus-visible:ring-primary/25" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-700">Tên</Label>
                    <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleNameChange} placeholder="Văn A" required className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:border-primary focus-visible:ring-primary/25" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                    Số điện thoại
                    <span className="ml-1 text-xs font-normal text-slate-400">tùy chọn</span>
                  </Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="0909123456" inputMode="numeric" maxLength={10} className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:border-primary focus-visible:ring-primary/25" />
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-slate-700">
                    Địa chỉ
                    <span className="ml-1 text-xs font-normal text-slate-400">tùy chọn</span>
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
                    className="mt-2 h-12 rounded-xl border-slate-200 bg-slate-50/60 focus-visible:border-primary focus-visible:ring-primary/25"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Địa chỉ email</Label>
              <div className="relative mt-2">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="name@company.com" required className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 focus-visible:border-primary focus-visible:ring-primary/25" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</Label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-xs font-medium text-slate-500 transition hover:text-slate-900 hover:underline">
                    Quên mật khẩu?
                  </Link>
                )}
              </div>
              <div className="relative mt-1">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLogin ? '••••••••' : 'Ít nhất 8 ký tự'}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 pr-14 focus-visible:border-primary focus-visible:ring-primary/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((c) => !c)}
                  className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-slate-500 transition hover:text-primary focus:outline-none"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  <PokemonPasswordIcon isOpen={showPassword} />
                </button>
              </div>

              {!isLogin && formData.password.length > 0 && formData.password.length < 8 && (
                <p className="mt-2 text-xs text-rose-500">Cần thêm {8 - formData.password.length} ký tự nữa</p>
              )}
              {!isLogin && formData.password.length >= 8 && (
                <p className="mt-2 text-xs text-emerald-600">✓ Mật khẩu hợp lệ</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</Label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 pr-14 focus-visible:border-primary focus-visible:ring-primary/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((c) => !c)}
                    className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-slate-500 transition hover:text-primary focus:outline-none"
                    aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
                  >
                    <PokemonPasswordIcon isOpen={showConfirmPassword} />
                  </button>
                </div>

                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-xs text-rose-500">Mật khẩu không khớp</p>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && (
                  <p className="mt-2 text-xs text-emerald-600">✓ Mật khẩu khớp</p>
                )}
              </div>
            )}

            {formError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#b01032] hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {isSubmitting ? 'Vui lòng chờ...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
            </button>
          </form>

                <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormError('');
                    }}
                    className="text-sm font-medium text-slate-600 transition hover:text-primary"
                  >
                    {isLogin ? 'Chưa có tài khoản? Tạo ngay' : 'Đã có tài khoản? Đăng nhập'}
                  </button>

                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {isLogin && (
                      <button type="button" onClick={() => navigate('/shop')} className="font-medium text-slate-500 transition hover:text-secondary">
                        Tiếp tục với tư cách khách
                      </button>
                    )}
                    {isLogin && (
                      <Link to="/admin/login" className="font-medium text-slate-500 transition hover:text-secondary sm:hidden">
                        Đăng nhập quản trị
                      </Link>
                    )}
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,#f8fbff_0%,#fff7f8_100%)] px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                    <p>
                      Tài khoản của bạn sử dụng phiên JWT, băm mật khẩu an toàn và cơ chế gộp tài khoản OAuth để tránh tạo hồ sơ trùng lặp.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};