import React from 'react';
import { Link } from 'react-router';
import { User, Package, MapPin, Heart } from 'lucide-react';

export const Profile: React.FC = () => {
  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2026-03-25',
      total: 1250000,
      status: 'Delivered',
      items: 2
    },
    {
      id: 'ORD-002',
      date: '2026-03-20',
      total: 5500000,
      status: 'Processing',
      items: 1
    },
    {
      id: 'ORD-003',
      date: '2026-03-15',
      total: 850000,
      status: 'Shipped',
      items: 3
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'text-green-600 bg-green-100';
      case 'Processing':
        return 'text-blue-600 bg-blue-100';
      case 'Shipped':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
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
                <h2 className="font-bold text-lg">John Doe</h2>
                <p className="text-gray-600 text-sm">john.doe@example.com</p>
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
                  <p className="font-semibold">John Doe</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Email</p>
                  <p className="font-semibold">john.doe@example.com</p>
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
                {mockOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-gray-600">{order.date}</p>
                      </div>
                      <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <p className="text-gray-600">
                        {order.items} {order.items === 1 ? 'item' : 'items'}
                      </p>
                      <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6">
                <Link to="/shop" className="text-secondary hover:underline">
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
