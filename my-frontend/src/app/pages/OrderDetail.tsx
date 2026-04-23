import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import type { OrderStatus, Order } from '../data/orders';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/admin/StatusBadge';
import { EditOrderModal } from '../components/admin/EditOrderModal';
import { formatCurrency } from '../utils/format';
import { buildApiUrl } from '../utils/api';
import {
  formatAddressParts,
  getPaymentMethodLabel,
  normalizeOrderLike,
  normalizeOrderStatus,
  normalizePaymentStatus,
  sanitizePossiblyMojibakeText,
} from '../utils/orderDisplay';
import {
  ArrowLeft,
  Pencil,
  Printer,
  DollarSign,
  Package,
  Truck,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const AUTH_TOKEN_STORAGE_KEY = 'authToken';

const getAuthHeaders = (includeJsonContentType = false) => {
  const authToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)?.trim() || '';

  return {
    ...(includeJsonContentType ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  };
};

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('processing');
  const [adminNotes, setAdminNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [customerTotalSpent, setCustomerTotalSpent] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const isCancelledOrder = orderStatus === 'cancelled' || order?.orderStatus === 'cancelled';

  useEffect(() => {
    let isMounted = true;

    const loadOrderDetail = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const res = await fetch(buildApiUrl(`/orders/${id}`), {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            payload.message || (res.status === 401
              ? 'Phiên đăng nhập admin đã hết hạn hoặc thiếu token xác thực.'
              : res.status === 403
                ? 'Bạn không có quyền xem đơn hàng này.'
                : res.status === 404
                  ? 'Không tìm thấy đơn hàng.'
                  : 'Không thể tải chi tiết đơn hàng.')
          );
        }

        const data = normalizeOrderLike(await res.json());
        if (!isMounted) {
          return;
        }

        setOrder(data);
        setOrderStatus(normalizeOrderStatus(data.orderStatus));
        setPaymentStatus(normalizePaymentStatus(data.paymentStatus));
        setAdminNotes(sanitizePossiblyMojibakeText(data.notes));

        if (data.customerEmail && data.customerEmail !== 'N/A') {
          fetch(buildApiUrl(`/orders/stats/customer?email=${encodeURIComponent(data.customerEmail)}`))
            .then((response) => response.json())
            .then((stats) => {
              if (isMounted) {
                setCustomerTotalSpent(stats.totalSpent || 0);
              }
            })
            .catch(() => {});
        }
      } catch (error) {
        console.error('Lỗi khi fetch chi tiết đơn hàng:', error);
        if (isMounted) {
          setOrder(null);
          setLoadError(error instanceof Error ? error.message : 'Không thể tải chi tiết đơn hàng.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrderDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải dữ liệu...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-gray-600 mb-6">{loadError || 'Đơn hàng bạn đang tìm không tồn tại hoặc đã bị xóa.'}</p>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại danh sách đơn hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleUpdateStatus = async () => {
    try {
      const res = await fetch(buildApiUrl(`/orders/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ orderStatus })
      });
      if (res.ok) {
        setOrder((current: any) => current ? { ...current, orderStatus } : current);
        toast.success('Trạng thái đơn hàng đã được cập nhật!');
      } else {
        const payload = await res.json().catch(() => ({}));
        setOrderStatus(order.orderStatus);
        toast.error(payload.message || 'Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      setOrderStatus(order.orderStatus);
      toast.error('Lỗi kết nối đến máy chủ');
    }
  };

  const handleConfirmPayment = async () => {
    if (paymentStatus === 'paid') return;
    if (isCancelledOrder) {
      toast.error('Không thể ghi nhận thanh toán cho đơn hàng đã hủy.');
      return;
    }

    setIsConfirmingPayment(true);
    try {
      let res = await fetch(buildApiUrl(`/orders/${id}/confirm-payment`), {
        method: 'POST',
        headers: getAuthHeaders(true),
      });

      // Fallback for servers not yet exposing /confirm-payment route.
      if (res.status === 404) {
        res = await fetch(buildApiUrl(`/orders/${id}`), {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify({ paymentStatus: 'paid' }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        setPaymentStatus('paid');
        setCustomerTotalSpent(data.customerTotalSpent ?? customerTotalSpent);
        setOrder((current: any) => current ? { ...current, paymentStatus: 'paid' } : current);
        toast.success('Đã ghi nhận thanh toán thành công!');
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Xác nhận thanh toán thất bại');
      }
    } catch {
      toast.error('Lỗi kết nối đến máy chủ');
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  const handlePrintInvoice = () => {
    toast.success('Đang chuẩn bị in hóa đơn...');
    window.print();
  };

  const handleIssueRefund = () => {
    toast.success('Yêu cầu hoàn tiền đã được gửi!');
    // In real app, open refund modal
  };

  const handleSaveNotes = async () => {
    try {
      const res = await fetch(buildApiUrl(`/orders/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(true),
        body: JSON.stringify({ notes: adminNotes })
      });
      if (res.ok) {
        setIsEditingNotes(false);
        toast.success('Ghi chú đã được lưu!');
      } else {
        toast.error('Lỗi khi lưu ghi chú');
      }
    } catch (error) {
      toast.error('Không thể kết nối đến máy chủ');
    }
  };

  const handleSaveOrderChanges = (updatedOrder: Partial<Order>) => {
    if (updatedOrder.orderStatus) {
      setOrderStatus(updatedOrder.orderStatus);
    }
    toast.success('Đơn hàng đã được cập nhật!');
    // In real app, make API call here to update the order
  };

  // Order timeline stages
  const getTimelineStages = () => {
    const stages = [
      { key: 'processing', label: 'Đang xử lý', icon: Clock },
      { key: 'shipped', label: 'Đang vận chuyển', icon: Truck },
      { key: 'delivered', label: 'Giao thành công', icon: CheckCircle }
    ];

    const statusOrder = ['processing', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(orderStatus);

    return stages.map((stage, index) => ({
      ...stage,
      isCompleted: index <= currentIndex,
      isCurrent: index === currentIndex
    }));
  };

  const timelineStages = getTimelineStages();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Đơn hàng', href: '/admin/orders' },
            { label: order.orderNumber }
          ]}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/orders')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại danh sách</span>
        </button>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xl text-gray-600">{order.orderNumber}</p>
                <StatusBadge status={order.orderStatus} type="order" />
                <StatusBadge status={paymentStatus} type="payment" />
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrintInvoice}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                In hóa đơn
              </button>
              <button
                onClick={handleIssueRefund}
                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Hoàn tiền
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        {order.orderStatus !== 'cancelled' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Tiến trình đơn hàng</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-200">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{
                    width: `${(timelineStages.filter(s => s.isCompleted).length - 1) * 50}%`
                  }}
                />
              </div>

              {/* Timeline Steps */}
              <div className="relative flex justify-between">
                {timelineStages.map((stage, index) => {
                  const Icon = stage.icon;
                  return (
                    <div key={stage.key} className="flex flex-col items-center" style={{ width: '33.33%' }}>
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                          stage.isCompleted
                            ? 'bg-primary border-primary text-white'
                            : stage.isCurrent
                            ? 'bg-white border-primary text-primary'
                            : 'bg-white border-gray-300 text-gray-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <p
                        className={`mt-3 text-sm font-medium text-center ${
                          stage.isCompleted || stage.isCurrent ? 'text-gray-900' : 'text-gray-500'
                        }`}
                      >
                        {stage.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items Ordered */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">{sanitizePossiblyMojibakeText(item.productName, 'Sản phẩm')}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">SKU: {item.productId}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {sanitizePossiblyMojibakeText(item.category, 'Sản phẩm')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {formatCurrency(item.price)} × {item.quantity}
                        </div>
                        <div className="text-base font-bold text-gray-900">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin khách hàng</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer Profile */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Họ và tên</p>
                      <p className="text-sm font-semibold text-gray-900">{sanitizePossiblyMojibakeText(order.customerName, 'Khách hàng')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm text-gray-900">{sanitizePossiblyMojibakeText(order.customerEmail, 'N/A')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                      <p className="text-sm text-gray-900">{sanitizePossiblyMojibakeText(order.customerPhone, 'N/A')}</p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                      <p className="text-sm text-gray-900">
                        {formatAddressParts([
                          order.shippingAddress.street,
                          order.shippingAddress.ward,
                          order.shippingAddress.district,
                          order.shippingAddress.city,
                        ]) || 'Chưa cập nhật địa chỉ giao hàng'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Truck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phương thức vận chuyển</p>
                      <p className="text-sm text-gray-900">Giao hàng nhanh</p>
                      <p className="text-xs text-gray-500 mt-1">Mã vận đơn: #VN{order.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-900">Ghi chú nội bộ (Admin)</h2>
                {!isEditingNotes ? (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    Chỉnh sửa
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNotes}
                    className="text-sm bg-primary text-white px-3 py-1 rounded font-medium hover:bg-primary/90"
                  >
                    Lưu
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Ghi chú này chỉ hiển thị với admin, không hiển thị với khách hàng
              </p>
              {isEditingNotes ? (
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Nhập ghi chú nội bộ..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none"
                  rows={4}
                />
              ) : (
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {adminNotes || 'Chưa có ghi chú nội bộ'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ngày đặt hàng</span>
                  <span className="text-gray-900 font-medium">{formatDate(order.orderDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Số lượng sản phẩm</span>
                  <span className="text-gray-900 font-medium">
                    {order.items.reduce((acc, item) => acc + item.quantity, 0)} sản phẩm
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="text-gray-900">{formatCurrency(order.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Giảm giá</span>
                    <span className="text-green-600">-0 ₫</span>
                  </div>
                </div>
                <div className="border-t-2 border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-2xl font-bold text-primary">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin thanh toán</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phương thức thanh toán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                    <StatusBadge status={paymentStatus} type="payment" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Confirmation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ghi nhận thanh toán</h2>
              {/* Payment method instructions */}
              {paymentStatus !== 'paid' && !isCancelledOrder && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  {order.paymentMethod === 'bank' || order.paymentMethod === 'banking' ? (
                    <>
                      <p className="font-semibold mb-1">Chuyển khoản ngân hàng</p>
                      <p>Kiểm tra tài khoản ngân hàng để xác nhận khách đã chuyển tiền, sau đó nhấn xác nhận bên dưới.</p>
                    </>
                  ) : order.paymentMethod === 'momo' ? (
                    <>
                      <p className="font-semibold mb-1">Ví MoMo</p>
                      <p>Kiểm tra ví MoMo để xác nhận khách đã thanh toán, sau đó nhấn xác nhận.</p>
                    </>
                  ) : order.paymentMethod === 'zalopay' ? (
                    <>
                      <p className="font-semibold mb-1">ZaloPay</p>
                      <p>Kiểm tra tài khoản ZaloPay để xác nhận giao dịch, sau đó nhấn xác nhận.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold mb-1">Thanh toán khi nhận hàng (COD)</p>
                      <p>Xác nhận sau khi đơn hàng đã được giao và thu tiền mặt thành công.</p>
                    </>
                  )}
                </div>
              )}

              {paymentStatus === 'paid' ? (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Đã xác nhận thanh toán</p>
                    <p className="text-xs text-green-700">Số tiền: {formatCurrency(order.total)}</p>
                  </div>
                </div>
              ) : isCancelledOrder ? (
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  Đơn hàng đã bị hủy nên không thể ghi nhận thanh toán.
                </div>
              ) : (
                <button
                  onClick={handleConfirmPayment}
                  disabled={isConfirmingPayment}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  {isConfirmingPayment ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                </button>
              )}

              {/* Customer total spending */}
              {customerTotalSpent !== null && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Tổng chi tiêu của khách hàng</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(customerTotalSpent)}</p>
                  <p className="text-xs text-gray-400">(Tính từ tất cả đơn đã thanh toán)</p>
                </div>
              )}
            </div>

            {/* Update Status */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Cập nhật trạng thái</h2>
              <div className="space-y-3">
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang vận chuyển</option>
                <option value="delivered">Giao thành công</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
                <button
                  onClick={handleUpdateStatus}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Cập nhật trạng thái
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Order Modal */}
      {order && (
        <EditOrderModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          order={order}
          onSave={handleSaveOrderChanges}
        />
      )}
    </div>
  );
};
