import React, { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Loader2, Mail, Package2, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { limitedToast } from '../utils/limitedToast';

export const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      limitedToast.error('Vui long nhap email');
      return;
    }

    setIsSubmitting(true);
    const result = await forgotPassword(email.trim());
    if (result.success) {
      limitedToast.success(result.message);
    } else {
      limitedToast.error(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#eff6ff_30%,#ffffff_72%)] px-4 py-10">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl"></div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/80 bg-white/90 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden bg-[linear-gradient(165deg,#0f172a_0%,#111827_48%,#155e75_100%)] p-10 text-white lg:block">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-900">
                <Package2 className="h-4 w-4" />
              </div>
              Khôi phục mật khẩu
            </div>
            <div className="mt-10 max-w-sm space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Luồng đặt lại an toàn
              </div>
              <h1 className="text-4xl font-semibold leading-tight">Khôi phục quyền truy cập nhanh chóng và an toàn.</h1>
              <p className="text-sm leading-7 text-slate-200/85">
                Chúng tôi sẽ gửi liên kết đặt lại một lần với thời hạn 15 phút để bảo vệ tài khoản của bạn.
              </p>
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
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Bạn quên mật khẩu?</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-500">Nhập email gắn với tài khoản, chúng tôi sẽ gửi cho bạn một liên kết đặt lại an toàn.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="forgot-email" className="text-sm font-medium text-slate-700">Địa chỉ email</Label>
                    <div className="relative mt-2">
                      <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="h-12 rounded-xl border-slate-200 bg-slate-50/60 pl-11 focus-visible:ring-slate-300"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                    {isSubmitting ? 'Đang gửi liên kết đặt lại...' : 'Gửi email đặt lại mật khẩu'}
                  </button>
                </form>

                <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-900" />
                    <p>Vì lý do bảo mật, hệ thống sẽ hiển thị cùng một phản hồi dù email đó có tồn tại trong hệ thống hay không.</p>
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