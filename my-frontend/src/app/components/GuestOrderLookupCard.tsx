import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Mail, RefreshCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '../utils/api';
import { clearGuestOrderVerification, persistGuestOrderAccess, setGuestLookupContact } from '../utils/guestOrderAccess';

type GuestLookupResult = {
  email: string;
  phone: string;
  accessToken: string;
  orders: any[];
};

type GuestOrderLookupCardProps = {
  initialEmail?: string;
  initialPhone?: string;
  onResolved: (result: GuestLookupResult) => void;
};

const SEND_OTP_API_URL = buildApiUrl('/guest/send-otp');
const VERIFY_OTP_API_URL = buildApiUrl('/guest/verify-otp');
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export const GuestOrderLookupCard: React.FC<GuestOrderLookupCardProps> = ({
  initialEmail = '',
  initialPhone = '',
  onResolved,
}) => {
  const [lookupForm, setLookupForm] = useState({ email: initialEmail, phone: initialPhone });
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [step, setStep] = useState<'lookup' | 'otp'>('lookup');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setLookupForm({ email: initialEmail, phone: initialPhone });
  }, [initialEmail, initialPhone]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setResendCountdown((current) => (current > 1 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCountdown]);

  const otpValue = useMemo(() => otpDigits.join(''), [otpDigits]);

  const resetOtpInputs = () => {
    setOtpDigits(Array(OTP_LENGTH).fill(''));
    window.setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const handleSendOtp = async () => {
    const email = lookupForm.email.trim().toLowerCase();
    const phone = lookupForm.phone.trim();

    if (!email || !phone) {
      setErrorMessage('Vui lòng nhập đầy đủ email và số điện thoại đã dùng khi đặt hàng.');
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage('');

    try {
      const response = await fetch(SEND_OTP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Không thể gửi OTP lúc này');
      }

      clearGuestOrderVerification();
      setGuestLookupContact(email, phone);
      setStep('otp');
      setResendCountdown(payload.resendAfterSeconds || RESEND_SECONDS);
      setStatusMessage(payload.message || 'OTP đã được gửi tới email của bạn.');
      resetOtpInputs();
      toast.success('OTP đã được gửi tới email của bạn');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không thể gửi OTP lúc này';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = lookupForm.email.trim().toLowerCase();
    const phone = lookupForm.phone.trim();

    if (otpValue.length !== OTP_LENGTH) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage('');

    try {
      const response = await fetch(VERIFY_OTP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Xác thực OTP thất bại');
      }

      persistGuestOrderAccess({
        email,
        phone,
        accessToken: payload.accessToken,
      });

      setStatusMessage('Xác thực OTP thành công. Đang hiển thị đơn hàng của bạn.');
      toast.success('Xác thực OTP thành công');
      onResolved({
        email,
        phone,
        accessToken: payload.accessToken,
        orders: Array.isArray(payload.orders) ? payload.orders : [],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Xác thực OTP thất bại';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index: number, nextValue: string) => {
    const digit = nextValue.replace(/\D/g, '').slice(-1);
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);
    setErrorMessage('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) {
      return;
    }

    event.preventDefault();
    const nextDigits = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setOtpDigits(nextDigits);
    const nextFocusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tra cứu đơn guest qua OTP email</h2>
          <p className="text-sm text-gray-600 mt-1">
            Nhập email và số điện thoại đặt hàng. Chúng tôi sẽ gửi OTP tới email trước khi hiển thị danh sách đơn.
          </p>
        </div>
      </div>

      {step === 'lookup' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="email"
            value={lookupForm.email}
            onChange={(event) => setLookupForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email đặt hàng"
            className="md:col-span-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isSendingOtp}
          />
          <input
            type="tel"
            value={lookupForm.phone}
            onChange={(event) => setLookupForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="Số điện thoại"
            className="md:col-span-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            disabled={isSendingOtp}
          />
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isSendingOtp}
            className="md:col-span-1 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 font-semibold flex items-center justify-center gap-2"
          >
            {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Gửi OTP
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-medium text-gray-900">Mã OTP đã được gửi tới {lookupForm.email.trim().toLowerCase()}</p>
              <p className="text-sm text-gray-500">Mã có hiệu lực trong 5 phút. Vui lòng nhập 6 chữ số để tiếp tục.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setStep('lookup');
                setErrorMessage('');
              }}
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Đổi email / số điện thoại
            </button>
          </div>

          <div onPaste={handleOtpPaste} className="flex gap-2 sm:gap-3 mb-4">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                className="w-11 h-12 sm:w-12 sm:h-14 rounded-xl border border-gray-300 text-center text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                disabled={isVerifyingOtp}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifyingOtp || otpValue.length !== OTP_LENGTH}
              className="bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 font-semibold flex items-center justify-center gap-2"
            >
              {isVerifyingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Xác thực OTP
            </button>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSendingOtp || resendCountdown > 0}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              {resendCountdown > 0 ? `Gửi lại sau ${resendCountdown}s` : 'Gửi lại OTP'}
            </button>
          </div>
        </div>
      )}

      {statusMessage && <p className="mt-4 text-sm text-emerald-600">{statusMessage}</p>}
      {errorMessage && <p className="mt-3 text-sm text-red-600">{errorMessage}</p>}
    </div>
  );
};