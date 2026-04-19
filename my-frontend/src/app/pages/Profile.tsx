import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { User, Package, MapPin, Heart, ChevronRight, LogOut, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/format';
import { useProducts } from '../hooks/useProducts';
import { resolveWishlistProducts } from '../utils/wishlist';

const API_URL = 'http://localhost:5000';
const WISHLIST_FALLBACK_IMAGE = 'https://placehold.co/160x160?text=No+Image';

// Auto-detect profile images named "profile image1.png", "profile image2.jpg", etc.
// Just drop files with that naming pattern into public/images/ and they appear automatically.
const MAX_PROBE = 20;
const PROBE_EXTS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

const AvatarPickerGrid: React.FC<{
  currentAvatar: string | undefined;
  onSelect: (src: string) => void;
}> = ({ currentAvatar, onSelect }) => {
  const [found, setFound] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let pending = MAX_PROBE;
    const results: string[] = [];

    const done = () => {
      pending--;
      if (pending === 0) {
        setFound([...results]);
        setLoading(false);
      }
    };

    const tryExts = (idx: number, exts: string[]) => {
      if (exts.length === 0) { done(); return; }
      const [ext, ...rest] = exts;
      const src = `/images/profile image${idx}.${ext}`;
      const img = new Image();
      img.onload = () => { results.push(src); done(); };
      img.onerror = () => tryExts(idx, rest);
      img.src = src;
    };

    for (let i = 1; i <= MAX_PROBE; i++) {
      tryExts(i, PROBE_EXTS);
    }
  }, []);

  if (loading) return <p className="font-[Poppins] text-sm text-gray-400 text-center py-4">Đang tải ảnh...</p>;
  if (found.length === 0) return <p className="font-[Poppins] text-sm text-gray-400 text-center py-4">Chưa có ảnh nào. Thêm file đặt tên "profile image1.png", "profile image2.jpg",... vào thư mục public/images/</p>;

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Mặc định — xoá avatar */}
      <button
        onClick={() => onSelect('')}
        className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 focus:outline-none flex flex-col items-center justify-center gap-1 ${
          !currentAvatar ? 'border-primary ring-2 ring-primary/40 bg-primary/5' : 'border-gray-200 hover:border-primary bg-gray-50'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <span className="font-[Poppins] text-[10px] font-semibold text-gray-500">Mặc định</span>
        {!currentAvatar && (
          <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</div>
        )}
      </button>
      {found.map((src) => (
        <button
          key={src}
          onClick={() => onSelect(src)}
          className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all hover:scale-105 focus:outline-none ${currentAvatar === src ? 'border-primary ring-2 ring-primary/40' : 'border-gray-200 hover:border-primary'}`}
        >
          <img src={src} alt="" className="w-full h-full object-cover object-center" />
          {currentAvatar === src && (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

const validateFullName = (name: string) => /^[A-Za-zÀ-ỹ\s]+$/.test(name);
const validatePhone = (phone: string) => /^\d{10}$/.test(phone);
const validateAddress = (address: string) => /^[0-9A-Za-zÀ-ỹ\s,./-]+$/.test(address);

const toAbsoluteImageUrl = (image?: string) => {
  if (!image?.trim()) {
    return WISHLIST_FALLBACK_IMAGE;
  }

  const normalized = image.trim();

  if (
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('data:') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  if (normalized.startsWith('//')) {
    return `https:${normalized}`;
  }

  return `${API_URL}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
};

const getWishlistImage = (item: any) => {
  const candidate = item?.images?.[0] || item?.image || item?.productImage;
  return toAbsoluteImageUrl(candidate);
};

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<'orders' | 'address' | 'wishlist'>('orders');
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
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const getDisplayName = (profile = currentUser) => {
    return profile?.fullName || profile?.name || profile?.firstName || 'Khách hàng';
  };

  useEffect(() => {
    const syncWishlist = () => {
      setWishlist(resolveWishlistProducts(products));
    };

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
    } else {
      fetch(`${API_URL}/api/orders?email=${encodeURIComponent(userEmail)}`)
        .then((res) => res.json())
        .then((data) => {
          setRecentOrders(data);
          setIsLoadingOrders(false);
        })
        .catch((err) => {
          console.error('Lỗi khi fetch đơn hàng:', err);
          setIsLoadingOrders(false);
        });
    }

    syncWishlist();
    window.addEventListener('wishlist-updated', syncWishlist);

    return () => {
      window.removeEventListener('wishlist-updated', syncWishlist);
    };
  }, [products]);

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

  const handleSelectAvatar = async (avatarPath: string) => {
    setShowAvatarPicker(false);
    // avatarPath = '' means reset to default
    const updatedUser = { ...currentUser, avatar: avatarPath || undefined };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    // Sync to backend (best-effort)
    const userId = user?.id || currentUser?.id;
    if (userId) {
      try {
        await fetch(`${API_URL}/api/auth/profile/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: avatarPath }),
        });
      } catch (err) {
        console.error('Lỗi đồng bộ avatar:', err);
      }
    }
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
    <>
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary transition-colors group"
                    onClick={() => setShowAvatarPicker(true)}
                    title="Đổi ảnh đại diện"
                  >
                    {currentUser?.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt="Avatar"
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAvatarPicker(true)}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center shadow hover:bg-primary/90 transition-colors"
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h2 className="font-bold text-lg">{getDisplayName()}</h2>
                <p className="text-gray-600 text-sm">{currentUser?.email || 'Chưa cập nhật email'}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-white text-primary border border-primary' : 'hover:bg-white'}`}
                >
                  <Package className="w-5 h-5" />
                  <span>Đơn hàng</span>
                </button>
                <button
                  onClick={() => setActiveTab('address')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'address' ? 'bg-white text-primary border border-primary' : 'hover:bg-white'}`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Địa chỉ</span>
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'wishlist' ? 'bg-white text-primary border border-primary' : 'hover:bg-white'}`}
                >
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
            {/* Thông tin cá nhân — always visible */}
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
            {/* Tab: Đơn hàng */}
            {activeTab === 'orders' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Lịch sử đơn hàng</h2>
                  <Link to="/orders" className="text-sm text-primary hover:underline font-medium">Xem tất cả</Link>
                </div>
                <div className="space-y-4">
                  {isLoadingOrders ? (
                    <div className="text-center text-gray-500 py-4">Đang tải đơn hàng...</div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">Chưa có đơn hàng nào</p>
                      <Link to="/shop" className="mt-3 inline-block text-sm text-primary hover:underline">Mua sắm ngay</Link>
                    </div>
                  ) : recentOrders.map((order) => (
                    <Link key={order.id} to={`/orders/${order.id}`} className="block bg-white rounded-lg p-4 border border-gray-200 hover:border-primary/40 hover:shadow-sm transition-all">
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
                        <p className="text-gray-600">{order.items?.length || 0} sản phẩm</p>
                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Địa chỉ */}
            {activeTab === 'address' && (
              <div className="bg-gray-50 rounded-xl p-6">
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
            )}

            {/* Tab: Yêu thích */}
            {activeTab === 'wishlist' && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Sản phẩm yêu thích</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-3">Chưa có sản phẩm yêu thích</p>
                    <Link to="/shop" className="inline-block text-sm text-primary hover:underline">Khám phá cửa hàng</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlist.map((item: any) => (
                      <Link key={item.id} to={`/product/${item.id}`} className="bg-white rounded-xl border border-gray-200 hover:border-primary/40 hover:shadow-sm transition-all overflow-hidden flex gap-3 p-3">
                        <img
                          src={getWishlistImage(item)}
                          alt={item.name || item.productName}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => {
                            if (e.currentTarget.src !== WISHLIST_FALLBACK_IMAGE) {
                              e.currentTarget.src = WISHLIST_FALLBACK_IMAGE;
                            }
                          }}
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.name || item.productName}</p>
                          <p className="text-primary font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Avatar Picker Modal */}
    {showAvatarPicker && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowAvatarPicker(false)}>
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full font-[Poppins]" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-bold mb-1">Chọn ảnh đại diện</h3>
          <p className="text-sm text-gray-500 mb-4">Bấm vào hình để áp dụng làm ảnh đại diện của bạn</p>
          <AvatarPickerGrid currentAvatar={currentUser?.avatar} onSelect={handleSelectAvatar} />
          <button
            onClick={() => setShowAvatarPicker(false)}
            className="mt-5 w-full py-2 border border-gray-200 rounded-lg text-gray-600 text-sm hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>
    )}
    </>
  );
};