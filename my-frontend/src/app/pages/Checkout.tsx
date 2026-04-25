import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { formatPrice } from '../utils/format';
<<<<<<< HEAD
=======
import { buildApiUrl } from '../utils/api';
import { clearGuestOrderVerification, setGuestLookupContact } from '../utils/guestOrderAccess';
import { syncCachedProductStocks } from '../utils/productApi';
import { resolveProductImageUrl, withImageFallback } from '../utils/imageUrl';
import { CheckCircle } from 'lucide-react';

const ORDERS_API_URL = buildApiUrl('/orders');
const MONGODB_OBJECT_ID_REGEX = /^[a-fA-F0-9]{24}$/;
>>>>>>> main

export const Checkout: React.FC = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
<<<<<<< HEAD
    postalCode: '',
    paymentMethod: 'cod'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
=======
    paymentMethod: 'cod'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
>>>>>>> main

  // Redirect to cart if empty - moved to useEffect to avoid setState during render
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }

    // Tự động điền thông tin nếu người dùng đã đăng nhập
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const fullNameParts = (user.fullName || '').trim().split(/\s+/).filter(Boolean);
      const inferredLastName = fullNameParts.length > 1 ? fullNameParts.pop() || '' : '';
      const inferredFirstName = fullNameParts.join(' ');

      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.firstName || inferredFirstName || prev.firstName,
        lastName: user.lastName || inferredLastName || prev.lastName,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [items.length, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.address || !formData.city) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

<<<<<<< HEAD
    setIsSubmitting(true);

    try {
      // Đóng gói dữ liệu đúng với Schema của Backend
      const orderData = {
        customer: {
          name: `${formData.lastName} ${formData.firstName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}${formData.postalCode ? `, ${formData.postalCode}` : ''}`
=======
    if (items.length === 0) {
      toast.error('Giỏ hàng đang trống, không thể tạo đơn hàng');
      return;
    }

    const hasInvalidProductId = items.some((item) => !MONGODB_OBJECT_ID_REGEX.test(String(item.product.id || '').trim()));
    if (hasInvalidProductId) {
      toast.error('Giỏ hàng chứa sản phẩm không hợp lệ. Vui lòng làm mới trang và thêm lại sản phẩm.');
      return;
    }

    const invalidStockItem = items.find((item) => item.product.stock <= 0 || item.quantity > item.product.stock);
    if (invalidStockItem) {
      toast.error(`Sản phẩm ${invalidStockItem.product.name} không còn đủ tồn kho`);
      return;
    }

    setIsSubmitting(true);

    try {
      const authToken = localStorage.getItem('authToken') || '';
      // userId: có giá trị → đơn user đã đăng nhập; null → đơn guest
      const loggedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      const normalizedStreet = formData.address.trim();
      const normalizedCity = formData.city.trim();

      if (!normalizedStreet || !normalizedCity) {
        toast.error('Địa chỉ giao hàng không hợp lệ');
        return;
      }

      const orderData = {
        userId: loggedUser?.id || null,
        products: items.map((item) => ({
          productId: String(item.product.id).trim(),
          quantity: item.quantity,
        })),
        shippingAddress: {
          street: normalizedStreet,
          ward: '',
          district: '',
          city: normalizedCity,
        },
        paymentMethod: formData.paymentMethod,
        customer: {
          name: `${formData.lastName} ${formData.firstName}`.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: `${normalizedStreet}, ${normalizedCity}`,
>>>>>>> main
        },
        totalAmount: getTotalPrice(),
        subtotal: getTotalPrice(),
        shippingFee: 0, // Đang được thiết lập miễn phí ở UI
        paymentStatus: formData.paymentMethod === 'cod' ? 'Chưa thanh toán' : 'Chờ thanh toán',
        orderStatus: 'Đang xử lý',
<<<<<<< HEAD
        paymentMethod: formData.paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
=======
        items: items.map((item) => ({
          productId: String(item.product.id).trim(),
>>>>>>> main
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          productImage: item.product.images?.[0] || 'https://placehold.co/150x150?text=No+Image',
          category: item.product.category || 'Sản phẩm'
        })),
        history: [{ note: 'Khách hàng tự đặt hàng qua Website' }]
      };

      // Gửi request lên API tạo đơn hàng
<<<<<<< HEAD
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
=======
      const response = await fetch(ORDERS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
>>>>>>> main
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();

      if (response.ok) {
<<<<<<< HEAD
        localStorage.setItem('guestOrderEmail', formData.email);
        localStorage.setItem('guestOrderPhone', formData.phone);
        localStorage.setItem('guestOrderName', `${formData.firstName} ${formData.lastName}`.trim());

        toast.success('Đặt hàng thành công!');
        clearCart();

        const createdOrderId = responseData._id || responseData.id;
        if (createdOrderId) {
          navigate(`/orders/${createdOrderId}`);
        } else {
          navigate('/orders');
        }
=======
        syncCachedProductStocks(
          Array.isArray(responseData.updatedStocks)
            ? responseData.updatedStocks
            : items.map((item) => ({
                productId: item.product.id,
                stock: Math.max(0, item.product.stock - item.quantity),
              }))
        );

        setGuestLookupContact(formData.email, formData.phone, `${formData.firstName} ${formData.lastName}`.trim());
        clearGuestOrderVerification();

        clearCart();

        const createdOrderId = responseData._id || responseData.id;
        setSuccessOrderId(createdOrderId || '');
>>>>>>> main
      } else {
        toast.error(responseData.message || 'Có lỗi xảy ra khi đặt hàng');
      }
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      toast.error('Không thể kết nối đến máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading or empty state while redirecting
<<<<<<< HEAD
  if (items.length === 0) {
    return null;
  }

=======
  if (items.length === 0 && !successOrderId) {
    return null;
  }

  if (successOrderId !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đặt hàng thành công!</h2>
          <p className="text-gray-500 mb-1">Cảm ơn bạn đã mua hàng tại Gundam Store.</p>
          <p className="text-gray-500 mb-6">Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.</p>
          {successOrderId && (
            <p className="text-sm text-gray-400 mb-8">
              Mã đơn hàng: <span className="font-semibold text-gray-700">{successOrderId}</span>
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => navigate(successOrderId ? `/orders/${successOrderId}` : '/orders')}
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Xem đơn hàng
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

>>>>>>> main
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {!localStorage.getItem('user') && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                  Bạn đang đặt hàng với tư cách guest. Không cần đăng nhập, chỉ cần điền thông tin nhận hàng để hoàn tất đơn.
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Thông tin cá nhân</h2>
                
<<<<<<< HEAD
                <div className="grid grid-cols-2 gap-4">
=======
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
>>>>>>> main
                  <div>
                    <Label htmlFor="firstName">Họ *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
<<<<<<< HEAD
                      className="mt-1"
=======
                      className="mt-1 rounded-2xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35"
>>>>>>> main
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Tên *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
<<<<<<< HEAD
                      className="mt-1"
=======
                      className="mt-1 rounded-2xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35"
>>>>>>> main
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
<<<<<<< HEAD
                      className="mt-1"
=======
                      className="mt-1 rounded-2xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35"
>>>>>>> main
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
<<<<<<< HEAD
                      required
                      className="mt-1"
=======
                      inputMode="numeric"
                      required
                      className="mt-1 rounded-2xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35"
>>>>>>> main
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Địa chỉ giao hàng</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
<<<<<<< HEAD
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
=======
                      className="mt-1 rounded-2xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
>>>>>>> main
                    <div>
                      <Label htmlFor="city">Thành phố *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
<<<<<<< HEAD
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Mã bưu điện</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className="mt-1"
=======
                        className="mt-1 rounded-2xl border-gray-300 bg-white shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35"
>>>>>>> main
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-bold mb-6">Phương thức thanh toán</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bank"
                      checked={formData.paymentMethod === 'bank'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-primary"
                    />
                    <span>Chuyển khoản ngân hàng</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-6">Tóm tắt đơn hàng</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
<<<<<<< HEAD
                        src={item.product.images[0]}
                        alt={item.product.name}
=======
                        src={resolveProductImageUrl(item.product.images[0])}
                        alt={item.product.name}
                        onError={withImageFallback}
>>>>>>> main
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-2">{item.product.name}</p>
                        <p className="text-sm text-gray-600">SL: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 border-t border-gray-300 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="font-semibold">{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển</span>
                    <span className="font-semibold">Miễn phí</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Tổng cộng</span>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(getTotalPrice())}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};