import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import type { Order, OrderStatus } from '../data/orders';
import {
  ArrowLeft, Clock, Truck, CheckCircle, XCircle,
  MapPin, Phone, User, Package, CreditCard,
  Pencil, X, AlertTriangle, Check
} from 'lucide-react';
import { toast } from 'sonner';

interface EditForm {
  recipientName:  string;
  recipientPhone: string;
  street:   string;
  ward:     string;
  district: string;
  city:     string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  processing: { label: 'Đang xử lý', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    icon: Clock       },
  shipped:    { label: 'Đang vận chuyển', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck       },
  delivered:  { label: 'Giao thành công', color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: CheckCircle },
  cancelled:  { label: 'Đã hủy',    color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircle     },
};

const TIMELINE = [
  { key: 'processing', label: 'Đặt hàng thành công', sub: 'Đơn hàng đang được xử lý',   icon: Clock       },
  { key: 'shipped',    label: 'Đang vận chuyển',     sub: 'Đơn hàng đang trên đường đi', icon: Truck       },
  { key: 'delivered',  label: 'Giao thành công',     sub: 'Bạn đã nhận được hàng',       icon: CheckCircle },
] as const;

const STATUS_ORDER: OrderStatus[] = ['processing', 'shipped', 'delivered'];

const EditOrderModal: React.FC<{
  order:   Order;
  onClose: () => void;
  onSave:  (form: EditForm) => void;
}> = ({ order, onClose, onSave }) => {
  const [form, setForm] = useState<EditForm>({
    recipientName:  order.customerName,
    recipientPhone: order.customerPhone,
    street:   order.shippingAddress.street,
    ward:     order.shippingAddress.ward,
    district: order.shippingAddress.district,
    city:     order.shippingAddress.city,
  });

  const Field = (label: string, key: keyof EditForm, placeholder?: string) => (
    <div key={key}>
      <label className="text-xs font-semibold text-gray-500 mb-1.5 block">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Chỉnh sửa thông tin nhận hàng</h2>
            <p className="text-xs text-gray-400 mt-0.5">Chỉ áp dụng khi đơn hàng chưa được giao</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="pb-4 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Thông tin người nhận</p>
            <div className="space-y-3">
              {Field('Họ và tên', 'recipientName', 'Nhập tên người nhận')}
              {Field('Số điện thoại', 'recipientPhone', 'Nhập số điện thoại')}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Địa chỉ giao hàng</p>
            <div className="space-y-3">
              {Field('Địa chỉ cụ thể', 'street',     'Số nhà, tên đường')}
              {Field('Phường / Xã',    'ward',       'Nhập phường / xã')}
              {Field('Quận / Huyện',   'district',   'Nhập quận / huyện')}
              {Field('Tỉnh / Thành phố', 'city',     'Nhập tỉnh / thành phố')}
            </div>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Hủy bỏ
          </button>
          <button onClick={() => onSave(form)} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
};

const CancelConfirmModal: React.FC<{
  orderNumber: string;
  onClose:     () => void;
  onConfirm:   () => void;
}> = ({ orderNumber, onClose, onConfirm }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
      <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-7 h-7 text-red-600" />
      </div>
      <h2 className="font-bold text-gray-900 text-lg mb-2">Xác nhận hủy đơn hàng?</h2>
      <p className="text-gray-500 text-sm mb-1">
        Bạn có chắc muốn hủy đơn hàng{' '}
        <span className="font-semibold text-gray-800">{orderNumber}</span>?
      </p>
      <p className="text-gray-400 text-xs mb-6">Hành động này không thể hoàn tác.</p>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Quay lại
        </button>
        <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
          Xác nhận hủy
        </button>
      </div>
    </div>
  </div>
);

export const OrderTracking: React.FC = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus,  setOrderStatus]  = useState<OrderStatus>('processing');
  const [showEdit,     setShowEdit]     = useState(false);
  const [showCancel,   setShowCancel]   = useState(false);
  const [isLoading,    setIsLoading]    = useState(true);
  const [shippingInfo, setShippingInfo] = useState({
    recipientName: '', recipientPhone: '', street: '', ward: '', district: '', city: ''
  });

  useEffect(() => {
    fetch(`http://localhost:5000/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setOrderStatus(data.orderStatus);
        setShippingInfo({
          recipientName: data.customerName,
          recipientPhone: data.customerPhone,
          street: data.shippingAddress.street,
          ward: data.shippingAddress.ward,
          district: data.shippingAddress.district,
          city: data.shippingAddress.city
        });
        setIsLoading(false);
      })
      .catch(err => { console.error(err); setIsLoading(false); });
  }, [id]);

  if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Đang tải dữ liệu...</div>;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-10">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy đơn hàng</h2>
          <Link to="/orders" className="text-primary text-sm font-medium hover:underline">
            ← Quay lại đơn hàng của tôi
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });

  const currentStepIndex = STATUS_ORDER.indexOf(orderStatus);
  const canModify        = orderStatus === 'processing';
  const cfg              = STATUS_CONFIG[orderStatus];
  const StatusIcon       = cfg.icon;

  const handleSaveEdit = async (form: EditForm) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: form.recipientName,
            phone: form.recipientPhone,
            email: order.customerEmail, // Giữ nguyên email
            address: `${form.street}, ${form.ward}, ${form.district}, ${form.city}`
          }
        })
      });
      if (res.ok) {
        setShippingInfo(form);
        setShowEdit(false);
        toast.success('Cập nhật thông tin nhận hàng thành công!');
      } else {
        toast.error('Cập nhật thất bại, vui lòng thử lại.');
      }
    } catch (error) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  const handleConfirmCancel = () => {
    fetch(`http://localhost:5000/api/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: 'cancelled' })
    }).then(() => {
      setOrderStatus('cancelled');
      setShowCancel(false);
      toast.success('Đơn hàng đã được hủy thành công.');
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 py-8">

        <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-6 text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          Quay lại đơn hàng của tôi
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Mã đơn hàng</p>
              <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
              <p className="text-sm text-gray-500 mt-1">Đặt lúc {formatDate(order.orderDate)}</p>
            </div>
            <div className={`self-start flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm ${cfg.bg} ${cfg.color}`}>
              <StatusIcon className="w-4 h-4" />
              {cfg.label}
            </div>
          </div>
          {canModify && (
            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
              <button onClick={() => setShowEdit(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                <Pencil className="w-4 h-4" />
                Sửa thông tin nhận hàng
              </button>
              <button onClick={() => setShowCancel(true)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
                <X className="w-4 h-4" />
                Hủy đơn hàng
              </button>
            </div>
          )}
        </div>

        {orderStatus !== 'cancelled' ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-5">
            <h2 className="font-bold text-gray-900 mb-8">Tiến trình đơn hàng</h2>
            <div className="relative">
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200">
                <div className="h-full bg-primary transition-all duration-700" style={{ width: currentStepIndex > 0 ? `${(currentStepIndex / (TIMELINE.length - 1)) * 100}%` : '0%' }} />
              </div>
              <div className="relative flex justify-between">
                {TIMELINE.map((step, i) => {
                  const Icon   = step.icon;
                  const done   = i < currentStepIndex;
                  const active = i === currentStepIndex;
                  return (
                    <div key={step.key} className="flex flex-col items-center gap-2 w-1/3">
                      <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all ${done ? 'bg-primary border-primary text-white' : active ? 'bg-white border-primary text-primary shadow-md shadow-primary/20' : 'bg-white border-gray-200 text-gray-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-center px-1">
                        <p className={`text-xs font-semibold leading-tight ${done || active ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        <p className={`text-xs mt-0.5 leading-tight ${active ? 'text-primary' : 'text-gray-400'}`}>{step.sub}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-5 flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">Đơn hàng đã bị hủy</p>
              <p className="text-sm text-red-500 mt-0.5">Nếu bạn đã thanh toán, hoàn tiền sẽ được xử lý trong 3–5 ngày làm việc.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
          <div className="md:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-gray-100 last:pb-0 last:border-0">
                    <img src={item.productImage} alt={item.productName} className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{item.productName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} × {item.quantity}</p>
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">Thông tin nhận hàng</h2>
                {canModify && (
                  <button onClick={() => setShowEdit(true)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                    <Pencil className="w-3 h-3" /> Chỉnh sửa
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0"><User className="w-4 h-4 text-blue-600" /></div>
                  <div>
                    <p className="text-xs text-gray-400">Người nhận</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{shippingInfo.recipientName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg flex-shrink-0"><Phone className="w-4 h-4 text-green-600" /></div>
                  <div>
                    <p className="text-xs text-gray-400">Số điện thoại</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{shippingInfo.recipientPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-50 rounded-lg flex-shrink-0"><MapPin className="w-4 h-4 text-orange-600" /></div>
                  <div>
                    <p className="text-xs text-gray-400">Địa chỉ giao hàng</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {shippingInfo.street}, {shippingInfo.ward},<br />
                      {shippingInfo.district}, {shippingInfo.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Tạm tính</span><span className="text-gray-800">{formatCurrency(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Phí vận chuyển</span><span className="text-gray-800">{formatCurrency(order.shippingFee)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Giảm giá</span><span className="text-green-600">–0 ₫</span></div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-4">Thanh toán</h2>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg flex-shrink-0"><CreditCard className="w-4 h-4 text-indigo-600" /></div>
                <div>
                  <p className="text-xs text-gray-400">Phương thức</p>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {order.paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}
                </p>
                  <span className={`inline-block mt-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : order.paymentStatus === 'pending' ? 'Chờ thanh toán' : 'Thanh toán lỗi'}
                  </span>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('/shop')} className="w-full py-3 bg-primary text-white rounded-2xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>

      {showEdit && (
        <EditOrderModal
          order={{ ...order, customerName: shippingInfo.recipientName, customerPhone: shippingInfo.recipientPhone, shippingAddress: { street: shippingInfo.street, ward: shippingInfo.ward, district: shippingInfo.district, city: shippingInfo.city } }}
          onClose={() => setShowEdit(false)}
          onSave={handleSaveEdit}
        />
      )}
      {showCancel && (
        <CancelConfirmModal
          orderNumber={order.orderNumber}
          onClose={() => setShowCancel(false)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
};