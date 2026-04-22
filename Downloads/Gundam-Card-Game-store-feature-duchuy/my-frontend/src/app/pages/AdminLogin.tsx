import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, Package2, ShieldCheck, Sparkles } from 'lucide-react';
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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#dbeafe_0%,#fee2e2_30%,#ffffff_72%,#f8fafc_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-12 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl"></div>
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-rose-200/35 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-slate-200/35 blur-3xl"></div>
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.14)] backdrop-blur xl:grid-cols-[1.02fr_0.98fr]">
          <div className="relative hidden overflow-hidden border-r border-slate-100 bg-[linear-gradient(160deg,#0f172a_0%,#111827_45%,#1d4ed8_100%)] p-10 text-white xl:flex xl:flex-col xl:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,20,60,0.24),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.28),transparent_38%)]"></div>
            <div className="relative">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm">
                  <Package2 className="h-4 w-4" />
                </div>
                Trung tâm quản trị Gundam Store
              </div>

              <div className="mt-10 max-w-lg space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/30 bg-blue-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-blue-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Không gian vận hành bảo mật
                </div>
                <h2 className="text-4xl font-semibold leading-tight text-white">Điều hành cửa hàng với giao diện quản trị sắc nét, an toàn.</h2>
                <p className="max-w-md text-base leading-7 text-slate-200/90">
                  Đăng nhập để quản lý sản phẩm, đơn hàng, người dùng và toàn bộ dữ liệu hệ thống trong một bảng điều khiển tập trung.
                </p>
              </div>
            </div>

            <div className="relative grid gap-4">
              <div className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-200" />
                  <div>
                    <p className="font-semibold text-white">Truy cập giới hạn cho quản trị viên</p>
                    <p className="mt-1 text-sm leading-6 text-slate-200/80">Khu vực này dành riêng cho tài khoản quản trị, dùng để kiểm soát dữ liệu kinh doanh và vận hành nội bộ.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur">
                <div className="grid gap-3 text-sm text-slate-100/85">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-200" /> Quản lý sản phẩm và tồn kho</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-200" /> Theo dõi đơn hàng và người dùng</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-rose-200" /> Giao diện đồng bộ với hệ thống đăng nhập khách hàng</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-xl">
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-3 rounded-full border border-blue-100 bg-white/95 px-3 py-2 shadow-sm xl:hidden">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                      <Package2 className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Gundam Store Admin</span>
                  </div>
                  <p className="mt-5 text-sm font-medium uppercase tracking-[0.24em] text-secondary/55">Bảng điều khiển quản trị</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Đăng nhập quản trị</h1>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                    Sử dụng tài khoản quản trị để truy cập khu vực vận hành nội bộ của Gundam Store.
                  </p>
                </div>
                <Link to="/login" className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950 sm:inline-flex">
                  Đăng nhập khách hàng
                </Link>
              </div>

              <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">Địa chỉ email quản trị</Label>
                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="admin@gundamstore.com"
                        required
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 focus-visible:border-primary focus-visible:ring-primary/25"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700">Mật khẩu</Label>
                      <span className="text-xs font-medium text-slate-400">Khu vực giới hạn</span>
                    </div>
                    <div className="relative mt-2">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        required
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 pr-16 focus-visible:border-primary focus-visible:ring-primary/25"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-slate-500 transition hover:text-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isLoading}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        <PokemonPasswordIcon isOpen={showPassword} />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-4">
                    <div className="flex items-start gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Thông tin đăng nhập thử nghiệm</p>
                        <p className="mt-2 text-sm text-slate-600 font-mono">admin@gundamstore.com</p>
                        <p className="text-sm text-slate-600 font-mono">admin123</p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#b01032] hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <ArrowRight className="h-4 w-4" />}
                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
                  </button>
                </form>

                <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link 
                    to="/login" 
                    className="text-sm font-medium text-slate-600 transition hover:text-primary"
                  >
                    ← Quay lại đăng nhập khách hàng
                  </Link>

                  <p className="text-xs text-slate-500">
                    Khu vực bảo mật. Nghiêm cấm truy cập trái phép.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};