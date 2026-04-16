import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { formatPrice } from '../utils/format';

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
    postalCode: '',
    paymentMethod: 'cod'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

    try {
      // Đóng gói dữ liệu đúng với Schema của Backend
      const orderData = {
        customer: {
          name: `${formData.lastName} ${formData.firstName}`.trim(),
          email: formData.email,
          phone: formData.phone,
          address: `${formData.address}, ${formData.city}${formData.postalCode ? `, ${formData.postalCode}` : ''}`
        },
        totalAmount: getTotalPrice(),
        subtotal: getTotalPrice(),
        shippingFee: 0, // Đang được thiết lập miễn phí ở UI
        paymentStatus: formData.paymentMethod === 'cod' ? 'Chưa thanh toán' : 'Chờ thanh toán',
        orderStatus: 'Đang xử lý',
        paymentMethod: formData.paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          productImage: item.product.images?.[0] || 'https://placehold.co/150x150?text=No+Image',
          category: item.product.category || 'Sản phẩm'
        })),
        history: [{ note: 'Khách hàng tự đặt hàng qua Website' }]
      };

      // Gửi request lên API tạo đơn hàng
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const responseData = await response.json();

      if (response.ok) {
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
  if (items.length === 0) {
    return null;
  }

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
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Họ *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
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
                      className="mt-1"
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
                      className="mt-1"
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
                      required
                      className="mt-1"
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
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Thành phố *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
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
                        src={item.product.images[0]}
                        alt={item.product.name}
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