import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '../components/Breadcrumb';
import { GuestOrderLookupCard } from '../components/GuestOrderLookupCard';
import { StatusBadge } from '../components/admin/StatusBadge';
import { formatCurrency } from '../utils/format';
import { buildApiUrl } from '../utils/api';
import { getPaymentMethodLabel, normalizeOrderLike, sanitizePossiblyMojibakeText } from '../utils/orderDisplay';
import {
  buildGuestOrderHeaders,
  clearGuestOrderVerification,
  clearPendingGuestOrderCode,
  getPendingGuestOrderCode,
  getStoredGuestOrderAccess,
} from '../utils/guestOrderAccess';

const USER_ORDERS_API_URL = buildApiUrl('/user/orders');
const GUEST_ORDERS_API_URL = buildApiUrl('/guest/orders');

type GuestSession = {
  email: string;
  phone: string;
  accessToken: string;
};

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerEmail, setViewerEmail] = useState('');
  const [isGuestView, setIsGuestView] = useState(false);
  const [isSignedInUser, setIsSignedInUser] = useState(false);
  const [guestSession, setGuestSession] = useState<GuestSession | null>(() => {
    const stored = getStoredGuestOrderAccess();
    if (!stored.email || !stored.phone || !stored.accessToken) {
      return null;
    }

    return {
      email: stored.email,
      phone: stored.phone,
      accessToken: stored.accessToken,
    };
  });

  const redirectToPendingOrder = useCallback((nextOrders: any[]) => {
    const pendingOrderCode = getPendingGuestOrderCode();
    if (!pendingOrderCode) {
      return;
    }

    const matchedOrder = nextOrders.find((order) => String(order.orderNumber || '').toUpperCase() === pendingOrderCode);
    clearPendingGuestOrderCode();

    if (matchedOrder?.id) {
      navigate(`/orders/${matchedOrder.id}`);
      return;
    }

    toast.error('Không tìm thấy mã đơn đã yêu cầu trong danh sách vừa xác thực.');
  }, [navigate]);

  const fetchOrders = useCallback(async (email: string) => {
    try {
      setIsLoading(true);

      const storedToken = localStorage.getItem('authToken') || '';
      if (!storedToken) {
        setIsSignedInUser(false);
        setViewerEmail('');
        setOrders([]);
        setIsGuestView(false);
        return;
      }

      const res = await fetch(USER_ORDERS_API_URL, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          // Token hết hạn/không hợp lệ: hạ về guest mode để người dùng có thể xác thực OTP.
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setIsSignedInUser(false);
          setViewerEmail('');
          setOrders([]);
          setIsGuestView(false);
          return;
        }

        const text = await res.text();
        let msg = 'Không thể tải lịch sử đơn hàng';
        try { msg = JSON.parse(text).message || msg; } catch { /* HTML page */ }
        throw new Error(msg);
      }

      const data = await res.json();

      setOrders(Array.isArray(data) ? data.map((entry) => normalizeOrderLike(entry)) : []);
      setViewerEmail(email.trim());
      setIsGuestView(false);
      redirectToPendingOrder(Array.isArray(data) ? data.map((entry) => normalizeOrderLike(entry)) : []);
    } catch (error) {
      console.error('Lỗi khi fetch đơn hàng:', error);
      setOrders([]);
      toast.error(error instanceof Error ? sanitizePossiblyMojibakeText(error.message, 'Không thể tải lịch sử đơn hàng') : 'Không thể tải lịch sử đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, [redirectToPendingOrder]);

  const fetchGuestOrders = useCallback(async (session: GuestSession) => {
    try {
      setIsLoading(true);

      // GUEST: gọi /api/guest/orders với guest access token
      const response = await fetch(GUEST_ORDERS_API_URL, {
        headers: buildGuestOrderHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearGuestOrderVerification();
          setGuestSession(null);
          throw new Error('Phiên xác thực OTP đã hết hạn. Vui lòng xác thực lại email của bạn.');
        }
        const text = await response.text();
        let msg = 'Không thể tải lịch sử đơn hàng guest';
        try { msg = JSON.parse(text).message || msg; } catch { /* HTML page */ }
        throw new Error(msg);
      }

      const payload = await response.json();
      const nextOrders = Array.isArray(payload) ? payload.map((entry) => normalizeOrderLike(entry)) : [];
      setOrders(nextOrders);
      setViewerEmail(session.email);
      setIsGuestView(true);
      redirectToPendingOrder(nextOrders);
    } catch (error) {
      console.error('Lỗi khi fetch đơn hàng guest:', error);
      setOrders([]);
      toast.error(error instanceof Error ? sanitizePossiblyMojibakeText(error.message, 'Không thể tải lịch sử đơn hàng guest') : 'Không thể tải lịch sử đơn hàng guest');
    } finally {
      setIsLoading(false);
    }
  }, [redirectToPendingOrder]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('authToken') || '';
    const user = userStr ? JSON.parse(userStr) : null;

    if (user?.email && token) {
      setIsSignedInUser(true);
      fetchOrders(user.email);
      return;
    }

    setIsSignedInUser(false);

    if (guestSession?.email && guestSession.phone && guestSession.accessToken) {
      fetchGuestOrders(guestSession);
    } else {
      setIsLoading(false);
    }
  }, [fetchGuestOrders, fetchOrders, guestSession]);

  const storedGuestInfo = getStoredGuestOrderAccess();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Lịch sử đơn hàng' }]} />

        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử đơn hàng</h1>
            <p className="text-gray-600">
              {isSignedInUser
                ? `Đây là lịch sử giao hàng của tài khoản ${viewerEmail}.`
                : viewerEmail
                  ? `Bạn đang xem đơn hàng guest đã xác thực OTP với email ${viewerEmail}.`
                  : 'Xác thực OTP qua email để tra cứu đơn guest an toàn hơn.'}
            </p>
          </div>
        </div>

        {!isSignedInUser && !guestSession && (
          <GuestOrderLookupCard
            initialEmail={storedGuestInfo.email}
            initialPhone={storedGuestInfo.phone}
            onResolved={({ email, phone, accessToken, orders: resolvedOrders }) => {
              const nextSession = { email, phone, accessToken };
              setGuestSession(nextSession);
              setOrders(resolvedOrders);
              setViewerEmail(email);
              setIsGuestView(true);
              setIsLoading(false);
              redirectToPendingOrder(resolvedOrders);
            }}
          />
        )}

        {!isSignedInUser && guestSession && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-900">Email {guestSession.email} đã xác thực OTP.</p>
              <p className="text-sm text-emerald-700">Bạn có thể xem danh sách đơn guest trong phiên hiện tại.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                clearGuestOrderVerification();
                setGuestSession(null);
                setOrders([]);
                setViewerEmail('');
                setIsGuestView(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
            >
              <Search className="w-4 h-4" />
              Xác thực email khác
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : !viewerEmail ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-3">Chưa có lịch sử đơn nào để hiển thị.</p>
              <Link to="/shop" className="text-primary font-medium hover:underline">
                Mua sắm ngay
              </Link>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Không tìm thấy đơn hàng phù hợp với thông tin đã nhập.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {orders.map((order) => (
                <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{order.orderNumber}</h3>
                        <p className="text-sm text-gray-500">Ngày đặt: {formatDate(order.orderDate)}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Thanh toán: <span className="font-medium text-gray-700">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 mb-1">{formatCurrency(order.total)}</p>
                      <StatusBadge status={order.orderStatus} type="order" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-600">{order.items.length} sản phẩm</p>
                    <Link
                      to={`/orders/${order.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};