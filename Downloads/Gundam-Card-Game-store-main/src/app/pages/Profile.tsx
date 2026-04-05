import React from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Package, MapPin, Heart, ChevronRight } from 'lucide-react';

export const Profile: React.FC = () => {
  const navigate = useNavigate();

  const mockOrders = [
    { id: 'ORD-001', date: '2026-03-25', total: 1250000, status: 'delivered',  items: 2 },
    { id: 'ORD-002', date: '2026-03-20', total: 5500000, status: 'processing', items: 1 },
    { id: 'ORD-003', date: '2026-03-15', total: 850000,  status: 'shipped',    items: 3 },
  ];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':  return { label: 'Đã giao',    color: 'text-green-700 bg-green-100'   };
      case 'processing': return { label: 'Đang xử lý', color: 'text-blue-700 bg-blue-100'     };
      case 'shipped':    return { label: 'Đang giao',  color: 'text-purple-700 bg-purple-100' };
      case 'cancelled':  return { label: 'Đã hủy',     color: 'text-red-700 bg-red-100'       };
      default:           return { label: status,       color: 'text-gray-600 bg-gray-100'     };
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
                </div>
                <h2 className="font-bold text-lg text-gray-900">Nguyễn Văn A</h2>
                <p className="text-gray-500 text-sm">nguyenvana@email.com</p>
              </div>
              <nav className="space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white text-primary border border-primary font-medium text-sm">
                  <Package className="w-5 h-5" />
                  Đơn hàng
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white transition-colors text-gray-600 text-sm">
                  <MapPin className="w-5 h-5" />
                  Địa chỉ giao hàng
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white transition-colors text-gray-600 text-sm">
                  <Heart className="w-5 h-5" />
                  Sản phẩm yêu thích
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white transition-colors text-gray-600 text-sm">
                  <User className="w-5 h-5" />
                  Thông tin tài khoản
                </button>
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
                <button className="text-primary text-sm hover:underline font-medium">Chỉnh sửa</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-500 text-sm mb-1">Họ và tên</p>
                  <p className="font-semibold text-gray-900">Nguyễn Văn A</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="font-semibold text-gray-900">nguyenvana@email.com</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Số điện thoại</p>
                  <p className="font-semibold text-gray-900">+84 123 456 789</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-1">Thành viên từ</p>
                  <p className="font-semibold text-gray-900">Tháng 1, 2026</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                <button className="text-primary text-sm hover:underline font-medium">Thêm mới</button>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Địa chỉ nhà</p>
                    <p className="text-gray-600 text-sm">123 Đường Lê Lợi</p>
                    <p className="text-gray-600 text-sm">Quận 1, TP. Hồ Chí Minh</p>
                    <p className="text-gray-600 text-sm">Việt Nam, 700000</p>
                  </div>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded-lg">Mặc định</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Lịch sử đơn hàng</h2>
                <Link to="/orders" className="text-primary text-sm font-medium hover:underline">
                  Xem tất cả
                </Link>
              </div>

              <div className="space-y-3">
                {mockOrders.map((order) => {
                  const { label, color } = getStatusConfig(order.status);
                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-all group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-primary text-sm">{order.id}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{order.date}</p>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${color}`}>
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <p className="text-sm text-gray-500">{order.items} sản phẩm</p>
                        <div className="flex items-center gap-1">
                          <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</p>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-5">
                <Link to="/orders" className="inline-block text-sm text-primary font-semibold hover:underline">
                  Xem tất cả đơn hàng →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};