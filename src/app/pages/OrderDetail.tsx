import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import type { OrderStatus, Order } from '../data/orders';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/admin/StatusBadge';
import { EditOrderModal } from '../components/admin/EditOrderModal';
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

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('processing');
  const [adminNotes, setAdminNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    // Gọi API lấy chi tiết đơn hàng
    fetch(`http://localhost:5000/api/orders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy đơn hàng');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setOrderStatus(data.orderStatus);
        setAdminNotes(data.notes || '');
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi fetch chi tiết đơn hàng:', error);
        setIsLoading(false);
      });
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
            <p className="text-gray-600 mb-6">Đơn hàng bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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
      const res = await fetch(`http://localhost:5000/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus })
      });
      if (res.ok) {
        toast.success('Trạng thái đơn hàng đã được cập nhật!');
      } else {
        toast.error('Cập nhật trạng thái thất bại');
      }
    } catch (error) {
      toast.error('Lỗi kết nối đến máy chủ');
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

  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    toast.success('Ghi chú đã được lưu!');
    // In real app, make API call here
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
      { key: 'shipped', label: 'Đã giao hàng', icon: Truck },
      { key: 'delivered', label: 'Đã gửi hàng', icon: CheckCircle }
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
                <StatusBadge status={order.paymentStatus} type="payment" />
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
                      <h3 className="font-semibold text-gray-900 mb-1">{item.productName}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500">SKU: {item.productId}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                          {item.category}
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
                      <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-sm text-gray-900">{order.customerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                      <p className="text-sm text-gray-900">{order.customerPhone}</p>
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
                        {order.shippingAddress.street}<br />
                        {order.shippingAddress.ward}, {order.shippingAddress.district}<br />
                        {order.shippingAddress.city}
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
                      {order.paymentMethod === 'bank' 
                        ? 'Chuyển khoản ngân hàng' 
                        : 'Thanh toán khi nhận hàng (COD)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                    <StatusBadge status={order.paymentStatus} type="payment" />
                  </div>
                </div>
              </div>
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
                <option value="shipped">Đã giao hàng</option>
                <option value="delivered">Đã gửi hàng</option>
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
