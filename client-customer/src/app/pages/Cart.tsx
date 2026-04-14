import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import { Trash2 } from 'lucide-react';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-white">Giỏ hàng trống</h1>
          <Link
            to="/shop"
            className="inline-block bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-xl p-6 hover:border-primary transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`}>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-800"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-lg mb-2 text-white hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>

                      <p className="text-gray-400 mb-4">
                        {item.product.grade && `Cấp độ: ${item.product.grade}`}
                        {item.product.rarity && `Độ hiếm: ${item.product.rarity}`}
                      </p>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded border border-gray-700 bg-black text-white hover:border-primary transition-colors"
                          >
                            -
                          </button>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center bg-black border-gray-700 text-white"
                          />
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 rounded border border-gray-700 bg-black text-white hover:border-primary transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPrice(item.product.price)} mỗi cái
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-gray-900 to-black rounded-xl p-6 sticky top-24 border border-gray-800">
              <h2 className="text-xl font-bold mb-6 text-white">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tạm tính</span>
                  <span className="font-semibold text-white">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phí vận chuyển</span>
                  <span className="font-semibold text-white">Miễn phí</span>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-white">Tổng cộng</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                Thanh toán
              </button>

              <Link to="/shop">
                <button className="w-full mt-3 bg-black hover:bg-gray-900 text-white border-2 border-white py-3 rounded-lg font-semibold transition-all">
                  Tiếp tục mua sắm
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};