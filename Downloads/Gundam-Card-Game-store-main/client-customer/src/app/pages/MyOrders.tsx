import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { Package, ChevronRight } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { StatusBadge } from '../components/admin/StatusBadge';

export const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // Nếu chưa đăng nhập, không tải đơn hàng
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    fetch(`http://localhost:5000/api/orders?email=${user.email}`)
      .then((res) => {
        if (!res.ok) throw new Error('Lỗi mạng hoặc không có phản hồi từ server');
        return res.json();
      })
      .then((data) => {
        setOrders(data);
        setIsLoading(false);
      })
      .catch((error) => {
        toast.error('Không thể tải đơn hàng. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau!');
        setOrders([]);
        setIsLoading(false);
      });
  }, []);

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
            <p className="text-gray-600">Xem lại các đơn hàng bạn đã đặt.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Bạn chưa có đơn hàng nào.<br />
              <button onClick={() => window.location.reload()} className="mt-2 text-primary underline">Tải lại trang</button>
            </div>
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
                    <p className="text-sm text-gray-600">
                      {order.items.length} sản phẩm
                    </p>
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