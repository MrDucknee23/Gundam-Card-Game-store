import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';
import { Eye, Search } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { RefreshButton } from '../components/RefreshButton';
import { StatusBadge } from '../components/admin/StatusBadge';
import type { Order, PaymentStatus, OrderStatus } from '../data/orders';
import { formatCurrency } from '../utils/format';

export const ManageOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Lỗi khi fetch đơn hàng:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPaymentMethodLabel = (paymentMethod?: string) => {
    switch (paymentMethod) {
      case 'bank':
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'momo':
        return 'Ví MoMo';
      case 'zalopay':
        return 'ZaloPay';
      case 'credit_card':
        return 'Thẻ tín dụng';
      default:
        return 'Thanh toán khi nhận hàng (COD)';
    }
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchableContent = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        ...order.items.map((item) => item.productName),
      ].join(' ').toLowerCase();

      const matchesSearch = normalizedSearchQuery === '' || searchableContent.includes(normalizedSearchQuery);
      const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
      const matchesOrderStatus = orderStatusFilter === 'all' || order.orderStatus === orderStatusFilter;

      return matchesSearch && matchesPayment && matchesOrderStatus;
    });
  }, [orders, normalizedSearchQuery, paymentFilter, orderStatusFilter]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={[{ label: 'Admin', href: '/admin' }, { label: 'Đơn hàng' }]} />
        
        <div className="flex items-center justify-between mb-8 mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý hóa đơn</h1>
            <p className="text-gray-600">Theo dõi và cập nhật trạng thái các đơn đặt hàng.</p>
          </div>
          <RefreshButton onRefresh={fetchOrders} />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã đơn, khách hàng, SĐT..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as 'all' | PaymentStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="failed">Thất bại</option>
            </select>

            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value as 'all' | OrderStatus)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">Tất cả trạng thái đơn</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipped">Đang giao</option>
              <option value="delivered">Hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Mã ĐH</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Khách hàng</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Ngày đặt</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Tổng tiền</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Thanh toán</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-700 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">Không tìm thấy đơn hàng phù hợp.</td>
                  </tr>
                ) : (
                  filteredOrders.map(order => (
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
                          {getPaymentMethodLabel(order.paymentMethod)}
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