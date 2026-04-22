import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Loader2, Package2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { limitedToast } from '../utils/limitedToast';

export const AuthCallback: React.FC = () => {
  const { completeOAuthLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token')?.trim() || '';

    if (!token) {
      limitedToast.error('Khong nhan duoc token dang nhap mang xa hoi');
      navigate('/login', { replace: true });
      return;
    }

    const finalizeLogin = async () => {
      const success = await completeOAuthLogin(token);

      if (!success) {
        limitedToast.error('Khong the hoan tat dang nhap mang xa hoi');
        navigate('/login', { replace: true });
        return;
      }

      limitedToast.success('Dang nhap thanh cong');
      navigate('/profile', { replace: true });
    };

    void finalizeLogin();
  }, [completeOAuthLogin, navigate, searchParams]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#eff6ff_34%,#ffffff_78%)] px-4">
      <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"></div>
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-100/55 blur-3xl"></div>
      <div className="relative flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md rounded-[32px] border border-white/80 bg-white/90 p-10 text-center shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg">
            <Package2 className="h-5 w-5" />
          </div>
          <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-900">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Đang hoàn tất đăng nhập</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Chúng tôi đang xác thực phiên OAuth và tạo ngữ cảnh đăng nhập an toàn cho tài khoản của bạn.</p>
          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-4 text-left text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-900" />
              <p>Token của bạn sẽ được xác minh trước khi phiên đăng nhập được lưu trong trình duyệt.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};