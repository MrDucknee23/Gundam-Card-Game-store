import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Package2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { limitedToast } from '../utils/limitedToast';

export const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      limitedToast.error('Lien ket dat lai mat khau khong hop le');
      return;
    }

    if (password.length < 8) {
      limitedToast.error('Mat khau moi phai co it nhat 8 ky tu');
      return;
    }

    if (password !== confirmPassword) {
      limitedToast.error('Mat khau xac nhan khong khop');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(token, password);
    setIsSubmitting(false);

    if (!result.success) {
      limitedToast.error(result.message);
      return;
    }

    limitedToast.success(result.message);
    navigate('/login', { replace: true, state: { mode: 'login' } });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#eff6ff_34%,#ffffff_78%)] px-4 py-10">
      <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-[0.92fr_1.08fr]">
          <div className="hidden bg-[linear-gradient(165deg,#020617_0%,#0f172a_45%,#0f766e_100%)] p-10 text-white lg:block">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900">
                <Package2 className="h-4 w-4" />
              </div>
              Thiết lập mật khẩu mới
            </div>
            <div className="mt-10 max-w-sm space-y-5">
              <h1 className="text-4xl font-semibold leading-tight">Tạo mật khẩu mới thật mạnh.</h1>
              <p className="text-sm leading-7 text-slate-200/85">Token đặt lại mật khẩu có thời hạn và chỉ dùng được một lần. Hãy chọn mật khẩu riêng biệt cho tài khoản này.</p>
            </div>
            <div className="mt-10 space-y-4 rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-2 text-sm text-slate-100/85"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Tối thiểu 8 ký tự</div>
              <div className="flex items-center gap-2 text-sm text-slate-100/85"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Xác thực token đặt lại có thời hạn</div>
              <div className="flex items-center gap-2 text-sm text-slate-100/85"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Mật khẩu được lưu bằng cơ chế băm bcrypt</div>
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-md">
              <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950">
                <ArrowLeft className="h-4 w-4" />
                Quay lại đăng nhập
              </Link>

              <div className="mt-8 rounded-[28px] border border-slate-200/80 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                <div className="mb-6">
                  <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">Đặt lại mật khẩu</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Thiết lập mật khẩu mới</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Nhập và xác nhận mật khẩu mới để lấy lại quyền truy cập vào tài khoản của bạn.</p>
                </div>

                {!token ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Liên kết đặt lại mật khẩu không hợp lệ hoặc đã bị thiếu token.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="reset-password" className="text-sm font-medium text-slate-700">Mật khẩu mới</Label>
                      <div className="relative mt-2">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="reset-password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Ít nhất 8 ký tự"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 pr-14 focus-visible:ring-slate-300"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-slate-500 transition hover:text-slate-900 focus:outline-none">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="reset-confirm-password" className="text-sm font-medium text-slate-700">Xác nhận mật khẩu</Label>
                      <div className="relative mt-2">
                        <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="reset-confirm-password"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Nhập lại mật khẩu mới"
                          className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 pr-14 focus-visible:ring-slate-300"
                          required
                        />
                        <button type="button" onClick={() => setShowConfirmPassword((current) => !current)} className="absolute inset-y-0 right-3 flex items-center rounded-full p-1 text-slate-500 transition hover:text-slate-900 focus:outline-none">
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      {isSubmitting ? 'Đang cập nhật mật khẩu...' : 'Cập nhật mật khẩu'}
                    </button>
                  </form>
                )}

                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-900" />
                    <p>Liên kết đặt lại mật khẩu sẽ hết hạn sau 15 phút và chỉ có thể sử dụng một lần.</p>
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