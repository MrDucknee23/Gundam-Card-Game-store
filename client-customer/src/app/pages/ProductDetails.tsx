import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { ArrowLeft, ShoppingCart, Package, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../data/products';

const API_URL = 'http://localhost:5000';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${id}`)
      .then(async r => {
        if (!r.ok) { setProduct(null); return; }
        const data = await r.json();
        setProduct({ ...data, id: data.id || data._id });
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = { gundam: 'Gundam', pokemon: 'Pokémon', onepiece: 'One Piece' };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
          <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại cửa hàng
          </Link>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;
  const stockLabel = product.stock === 0 ? 'Hết hàng' : product.stock <= 10 ? 'Sắp hết hàng' : 'Còn hàng';
  const stockColor = product.stock === 0 ? 'text-red-600' : product.stock <= 10 ? 'text-orange-500' : 'text-green-600';

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng`);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Images */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === i ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            <div>
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">
                {getCategoryLabel(product.category)}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-1">{product.name}</h1>
              {product.grade && (
                <span className="inline-block mt-2 text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Grade: {product.grade}
                </span>
              )}
              {product.rarity && (
                <span className="inline-block mt-2 ml-2 text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {product.rarity}
                </span>
              )}
            </div>

            <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            <div className={`text-sm font-semibold ${stockColor}`}>{stockLabel}</div>

            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 font-medium">Số lượng:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-semibold text-gray-900 min-w-[40px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-400">/ {product.stock} sản phẩm</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {inStock ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
              </button>
              <Link
                to="/checkout"
                onClick={() => inStock && addToCart(product, quantity)}
                className={`flex-1 text-center py-3 rounded-xl font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-all ${!inStock ? 'pointer-events-none opacity-50' : ''}`}
              >
                Mua ngay
              </Link>
            </div>

            {/* Extra details */}
            {(product.scale || product.material || product.cardType) && (
              <div className="border-t pt-4 space-y-2">
                {product.scale && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tỉ lệ</span>
                    <span className="font-medium">{product.scale}</span>
                  </div>
                )}
                {product.material && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Chất liệu</span>
                    <span className="font-medium">{product.material}</span>
                  </div>
                )}
                {product.cardType && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Loại thẻ</span>
                    <span className="font-medium">{product.cardType}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};