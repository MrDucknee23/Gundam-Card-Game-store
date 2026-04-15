import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Package, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/admin/StatusBadge';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewerEmail, setViewerEmail] = useState('');
  const [isGuestView, setIsGuestView] = useState(false);
  const [isSignedInUser, setIsSignedInUser] = useState(false);
  const [lookupForm, setLookupForm] = useState({ email: '', phone: '' });

  const fetchOrders = useCallback(async (email: string, phone = '', guestMode = false) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (email.trim()) params.set('email', email.trim());
      if (phone.trim()) params.set('phone', phone.trim());

      const res = await fetch(`http://localhost:5000/api/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Không thể tải lịch sử đơn hàng');
      }

      setOrders(Array.isArray(data) ? data : []);
      setViewerEmail(email.trim());
      setIsGuestView(guestMode);

      if (guestMode) {
        localStorage.setItem('guestOrderEmail', email.trim());
        localStorage.setItem('guestOrderPhone', phone.trim());
      }
    } catch (error) {
      console.error('Lỗi khi fetch đơn hàng:', error);
      setOrders([]);
      toast.error('Không thể tải lịch sử đơn hàng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const guestEmail = localStorage.getItem('guestOrderEmail') || '';
    const guestPhone = localStorage.getItem('guestOrderPhone') || '';
    const user = userStr ? JSON.parse(userStr) : null;

    if (user?.email) {
      setIsSignedInUser(true);
      setLookupForm({ email: user.email, phone: user.phone || '' });
      fetchOrders(user.email, '', false);
      return;
    }

    setIsSignedInUser(false);
    setLookupForm({ email: guestEmail, phone: guestPhone });

    if (guestEmail) {
      fetchOrders(guestEmail, guestPhone, true);
    } else {
      setIsLoading(false);
    }
  }, [fetchOrders]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lookupForm.email.trim()) {
      toast.error('Vui lòng nhập email đã dùng khi đặt hàng');
      return;
    }

    await fetchOrders(lookupForm.email, lookupForm.phone, true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
                  ? `Bạn đang xem đơn hàng guest với email ${viewerEmail}.`
                  : 'Nhập email và số điện thoại đã dùng khi đặt hàng để tra cứu đơn guest.'}
            </p>
          </div>
        </div>

        {!isSignedInUser && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Tra cứu đơn hàng guest</h2>
            <p className="text-sm text-gray-600 mb-4">
              Lịch sử giao hàng của guest được tách theo email và số điện thoại đã dùng lúc đặt hàng.
            </p>

            <form onSubmit={handleLookup} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="email"
                value={lookupForm.email}
                onChange={(e) => setLookupForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email đặt hàng"
                className="md:col-span-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <input
                type="tel"
                value={lookupForm.phone}
                onChange={(e) => setLookupForm((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Số điện thoại"
                className="md:col-span-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <button
                type="submit"
                className="md:col-span-1 bg-primary hover:bg-primary/90 text-white rounded-lg px-4 py-2.5 font-semibold flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Tra cứu đơn
              </button>
            </form>
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
                          Thanh toán: <span className="font-medium text-gray-700">{order.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}</span>
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