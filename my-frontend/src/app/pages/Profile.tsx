import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Package, MapPin, Heart, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';

const API_URL = 'http://localhost:5000';
const validateFullName = (name: string) => /^[A-Za-zÀ-ỹ\s]+$/.test(name);
const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
const validateAddress = (address: string) => /^[0-9A-Za-zÀ-ỹ\s,./-]+$/.test(address);

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const getDisplayName = (profile = currentUser) => {
    return profile?.fullName || profile?.name || profile?.firstName || 'Khách hàng';
  };

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);
      setEditData({
        fullName: parsed.fullName || parsed.name || parsed.firstName || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        address: parsed.address || '',
      });
    }

    const userEmail = stored ? JSON.parse(stored).email : null;
    if (!userEmail) {
      setIsLoadingOrders(false);
      return;
    }

    fetch(`${API_URL}/api/orders?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        setRecentOrders(data.slice(0, 3));
        setIsLoadingOrders(false);
      })
      .catch((err) => {
        console.error('Lỗi khi fetch đơn hàng:', err);
        setIsLoadingOrders(false);
      });
  }, []);

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSaveEdit = async () => {
    if (!validateFullName(editData.fullName)) {
      alert('Họ tên không được chứa số hoặc ký tự đặc biệt');
      return;
    }

    if (editData.phone && !validatePhone(editData.phone)) {
      alert('Số điện thoại phải gồm đúng 10 chữ số và không chứa ký tự đặc biệt');
      return;
    }

    if (editData.address && !validateAddress(editData.address)) {
      alert('Địa chỉ không hợp lệ');
      return;
    }

    if (!user?.id && !currentUser?.id) {
      alert('Không tìm thấy thông tin tài khoản để cập nhật');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/profile/${user?.id || currentUser?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editData.fullName.trim(),
          phone: editData.phone,
          address: editData.address.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedUser = {
          ...currentUser,
          ...data,
          name: data.fullName,
        };

        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);

        setEditData({
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          address: data.address,
        });
      } else {
        const error = await res.json().catch(() => null);
        alert(error?.error || 'Cập nhật thông tin thất bại');
        return;
      }
    } catch (err) {
      console.error('Lỗi cập nhật:', err);
      alert('Có lỗi xảy ra khi cập nhật thông tin');
      return;
    }

    setIsEditingProfile(false);
    setIsEditingAddress(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      fullName: currentUser?.fullName || currentUser?.name || currentUser?.firstName || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      address: currentUser?.address || '',
    });
    setIsEditingProfile(false);
    setIsEditingAddress(false);
  };

  const getRoleLabel = () => {
    const role = user?.role || currentUser?.role;
    if (role === 'customer') return 'Khách hàng';
    if (role === 'admin') return 'Quản trị viên';
    return 'Super Admin';
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
                <h2 className="font-bold text-lg">{getDisplayName()}</h2>
                <p className="text-gray-600 text-sm">{currentUser?.email || 'Chưa cập nhật email'}</p>
              </div>

              <nav className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-primary border border-primary">
                  <Package className="w-5 h-5" />
                  <span>Đơn hàng</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span>Địa chỉ</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>Yêu thích</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors mt-8">
                  <LogOut className="w-5 h-5" />
                  <span>Đăng xuất</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Thông tin cá nhân */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-primary text-sm hover:underline font-medium">Sửa thông tin</button>
                )}
              </div>

              {!isEditingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-600 mb-1">Họ tên</p>
                    <p className="font-semibold">{getDisplayName()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Email</p>
                    <p className="font-semibold">{currentUser?.email || 'Chưa cập nhật email'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Điện thoại</p>
                    <p className="font-semibold">{currentUser?.phone || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Quyền hạn</p>
                    <p className="font-semibold">{getRoleLabel()}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Họ tên</p>
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                      placeholder="Nhập họ tên"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Email</p>
                    <input
                      type="email"
                      value={editData.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Điện thoại</p>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      value={editData.phone}
                      onChange={(e) => {
                        const phoneValue = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setEditData({...editData, phone: phoneValue});
                      }}
                      placeholder="Nhập số điện thoại"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Quyền hạn</p>
                    <div className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm font-semibold">{getRoleLabel()}</div>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <button onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">Lưu thông tin</button>
                  </div>
                </div>
              )}
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Địa chỉ giao hàng</h2>
                {!isEditingAddress && (
                  <button onClick={() => setIsEditingAddress(true)} className="text-primary text-sm hover:underline font-medium">Chỉnh sửa</button>
                )}
              </div>

              {!isEditingAddress ? (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Địa chỉ nhà</p>
                      {editData.address ? (
                        <p className="text-gray-600 text-sm">{editData.address}</p>
                      ) : (
                        <p className="text-gray-400 text-sm italic">Chưa có địa chỉ — bấm Chỉnh sửa để thêm</p>
                      )}
                    </div>
                    {editData.address && (
                      <span className="text-xs bg-primary text-white px-2 py-1 rounded-lg">Mặc định</span>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 text-sm mb-2">Địa chỉ</p>
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                    placeholder="123 Đường Lê Lợi, Quận 1, TP.HCM"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                  <div className="flex gap-2 mt-3">
                    <button onClick={handleCancelEdit} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">Hủy</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">Lưu địa chỉ</button>
                  </div>
                </div>
              )}
            </div>

            {/* Lịch sử đơn hàng */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-bold mb-6">Lịch sử đơn hàng</h2>

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
                  Xem tất cả đơn hàng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};