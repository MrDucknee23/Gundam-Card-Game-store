import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/admin/StatusBadge';
import { Spinner } from '../components/ui/spinner';
import type { Order } from '../data/orders'; // Import interface Order của bạn

export const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useContext(AuthContext);
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        let res;
        if (user && user.token) {
          res = await fetch('http://localhost:5000/api/orders', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } else {
          res = await fetch('http://localhost:5000/api/orders');
        }
        if (!res.ok) throw new Error('Lỗi mạng hoặc không có phản hồi từ server');
        const data = await res.json();
        setOrders(data);
      } catch (error) {
        toast.error('Không thể tải đơn hàng. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau!');
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

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
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Đơn hàng' }]} />
        
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý hóa đơn</h1>
            <p className="text-gray-600">Theo dõi và cập nhật trạng thái các đơn đặt hàng.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Mã ĐH</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Ngày đặt</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Tổng tiền</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Thanh toán</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Spinner size={32} />
                        <span className="text-gray-500 mt-2">Đang tải dữ liệu...</span>
                      </div>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Không có đơn hàng nào.<br />
                      <button onClick={() => window.location.reload()} className="mt-2 text-primary underline">Tải lại trang</button>
                    </td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{order.customerName}</p>
                        <p className="text-xs text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(order.orderDate)}</td>
                      <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(order.total)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.paymentStatus} type="payment" />
                        <p className="text-xs text-gray-500 mt-2 font-medium">
                          {(order as any).paymentMethod === 'bank' ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng (COD)'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={order.orderStatus} type="order" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {/* Nút Xem chi tiết liên kết đến trang OrderDetail.tsx */}
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="inline-flex items-center justify-center p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};