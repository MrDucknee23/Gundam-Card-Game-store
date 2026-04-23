import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { Input } from '../components/ui/input';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/format';
import { toast } from 'sonner';
import { fetchProducts } from '../utils/productApi';

export const Cart: React.FC = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, syncWithLatestProducts } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const syncCart = async () => {
      try {
        const latestProducts = await fetchProducts();
        syncWithLatestProducts(latestProducts);
      } catch {
        // Keep existing cart state if product refresh fails.
      }
    };

    syncCart();
  }, [syncWithLatestProducts]);

  const handleQuantityUpdate = (productId: string, quantity: number) => {
    const result = updateQuantity(productId, quantity);
    if (!result.ok && result.message) {
      toast.error(result.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Giỏ hàng trống</h1>
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

  const hasOutOfStockItem = items.some((item) => item.product.stock <= 0 || item.quantity > item.product.stock);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:border-primary shadow-sm transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link to={`/product/${item.product.id}`}>
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-semibold text-lg mb-2 text-gray-900 hover:text-primary transition-colors">
                          {item.product.name}
                        </h3>
                      </Link>

                      <p className="text-gray-600 mb-4">
                        {item.product.grade && `Cấp độ: ${item.product.grade}`}
                        {item.product.rarity && `Độ hiếm: ${item.product.rarity}`}
                      </p>
                      <p className="text-sm text-gray-500 mb-4">Tồn kho hiện tại: {item.product.stock}</p>
                      {item.product.stock <= 0 && (
                        <p className="text-sm font-medium text-red-600 mb-4">Sản phẩm đã hết hàng</p>
                      )}

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityUpdate(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-900 hover:border-primary transition-colors"
                          >
                            -
                          </button>
                          <Input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => handleQuantityUpdate(item.product.id, parseInt(e.target.value, 10) || 1)}
                            className="w-16 text-center bg-white border-gray-300 text-gray-900"
                          />
                          <button
                            onClick={() => handleQuantityUpdate(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="w-8 h-8 rounded border border-gray-300 bg-white text-gray-900 hover:border-primary transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-xl font-bold text-primary">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                          <p className="text-sm text-gray-600">
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
            <div className="bg-white rounded-xl p-6 sticky top-24 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-gray-900">Tóm tắt đơn hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold text-gray-900">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-semibold text-gray-900">Miễn phí</span>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(getTotalPrice())}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                disabled={hasOutOfStockItem}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:scale-100"
              >
                Thanh toán
              </button>
              {hasOutOfStockItem && (
                <p className="mt-2 text-xs text-red-600">Giỏ hàng có sản phẩm hết hàng. Vui lòng cập nhật lại trước khi thanh toán.</p>
              )}

              <Link to="/shop">
                <button className="w-full mt-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 py-3 rounded-lg font-semibold transition-all">
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