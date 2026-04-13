import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { User, Package, MapPin, Heart } from 'lucide-react';

export const Profile: React.FC = () => {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    setCurrentUser(user);

    if (!user?.email) {
      setIsLoadingOrders(false);
      return;
    }

    fetch(`http://localhost:5000/api/orders?email=${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setRecentOrders(data.slice(0, 3)); // Chỉ lấy 3 đơn hàng mới nhất
        setIsLoadingOrders(false);
      })
      .catch((err) => {
        console.error('Lỗi khi fetch đơn hàng:', err);
        setIsLoadingOrders(false);
      });
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Giao thành công';
      case 'processing': return 'Đang xử lý';
      case 'shipped': return 'Đang vận chuyển';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-600" />
                </div>
                <h2 className="font-bold text-lg">{currentUser?.name || currentUser?.firstName || 'Khách hàng'}</h2>
                <p className="text-gray-600 text-sm">{currentUser?.email || 'Chưa cập nhật email'}</p>
              </div>

              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-primary border border-primary">
                  <Package className="w-5 h-5" />
                  <span>Orders</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span>Addresses</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors">
                  <User className="w-5 h-5" />
                  <span>Account Info</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Personal Information</h2>
                <button className="text-primary hover:underline">Edit</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Full Name</p>
                  <p className="font-semibold">{currentUser?.name || currentUser?.firstName || 'Khách hàng'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-semibold">{currentUser?.email || 'Chưa cập nhật email'}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Phone</p>
                  <p className="font-semibold">+84 123 456 789</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Member Since</p>
                  <p className="font-semibold">January 2026</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Shipping Address</h2>
                <button className="text-primary hover:underline">Add New</button>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold mb-2">Home Address</p>
                    <p className="text-gray-600">123 Main Street</p>
                    <p className="text-gray-600">District 1, Ho Chi Minh City</p>
                    <p className="text-gray-600">Vietnam, 700000</p>
                  </div>
                  <span className="text-xs bg-primary text-white px-2 py-1 rounded">Default</span>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Order History</h2>

              <div className="space-y-4">
                {isLoadingOrders ? (
                  <div className="text-center text-gray-500 py-4">Đang tải đơn hàng...</div>
                ) : recentOrders.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">Chưa có đơn hàng nào</div>
                ) : recentOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-gray-600">
                        {order.items?.length || 0} sản phẩm
                      </p>
                      <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link to="/orders" className="text-secondary hover:underline">
                  View All Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
