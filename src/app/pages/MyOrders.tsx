import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { orders } from '../data/orders';
import type { OrderStatus } from '../data/orders';
import {
  Package, ChevronRight, Search,
  Clock, Truck, CheckCircle, XCircle, ShoppingBag
} from 'lucide-react';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  processing: { label: 'Đang xử lý', color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',    icon: Clock       },
  shipped:    { label: 'Đang giao',  color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Truck       },
  delivered:  { label: 'Đã giao',   color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: CheckCircle },
  cancelled:  { label: 'Đã hủy',    color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircle     },
};

const FILTER_TABS: { key: 'all' | OrderStatus; label: string }[] = [
  { key: 'all',        label: 'Tất cả'     },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'shipped',    label: 'Đang giao'  },
  { key: 'delivered',  label: 'Đã giao'    },
  { key: 'cancelled',  label: 'Đã hủy'     },
];

export const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]     = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit'
    });

  const filtered = orders.filter((o) => {
    const matchStatus = activeTab === 'all' || o.orderStatus === activeTab;
    const matchSearch =
      searchQuery === '' ||
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.productName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const countByStatus = (key: 'all' | OrderStatus) =>
    key === 'all' ? orders.length : orders.filter((o) => o.orderStatus === key).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Đơn hàng của tôi</h1>
          <p className="text-gray-500 text-sm">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          />
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {countByStatus(tab.key)}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Không có đơn hàng nào</p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery ? 'Thử tìm với từ khóa khác' : 'Bạn chưa có đơn hàng trong mục này'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="mt-6 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              Mua sắm ngay
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.orderStatus];
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-bold text-primary text-sm">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 mt-0.5">Đặt ngày {formatDate(order.orderDate)}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, i) => (
                        <img
                          key={i}
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">
                        {order.items[0].productName}
                        {order.items.length > 1 && ` và ${order.items.length - 1} sản phẩm khác`}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} sản phẩm
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-xs text-gray-400">Tổng tiền</p>
                      <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};