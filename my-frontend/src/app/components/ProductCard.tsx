import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart } from 'lucide-react';
import { Product } from '../types/product';
import { Badge } from './ui/badge';
import { formatPrice } from '../utils/format';
import { limitedToast } from '../utils/limitedToast';
import { isWishlisted, toggleWishlist } from '../utils/wishlist';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const getRarityColor = (rarity?: string) => {
  switch (rarity) {
    case 'Common':
      return 'bg-white text-black border border-gray-300';
    case 'Rare':
      return 'bg-secondary text-white';
    case 'Super Rare':
      return 'bg-primary text-white';
    case 'Ultra Rare':
      return 'bg-gradient-to-r from-primary to-secondary text-white';
    default:
      return 'bg-white text-black border border-gray-300';
  }
};

const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'HG':
      return 'bg-secondary text-white';
    case 'MG':
      return 'bg-primary text-white';
    case 'RG':
      return 'bg-gray-900 text-white';
    case 'PG':
      return 'bg-white text-black border border-gray-900';
    default:
      return 'bg-gray-900 text-white';
  }
};

export const ProductCard: React.FC<ProductCardProps> = React.memo(({ product }) => {
  const navigate = useNavigate();
  const { addToCart, getAvailableStock } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const primaryImage = product.images?.[0]?.trim() || '';
  const availableStock = getAvailableStock(product);
  const isSoldOut = availableStock <= 0;

  const isCardProduct = product.category === 'pokemon' || product.category === 'onepiece';
  const isGundamProduct = product.category === 'gundam';

  useEffect(() => {
    setIsFavorite(isWishlisted(product.id));
  }, [product.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = addToCart(product, 1);
    if (!result.ok) {
      limitedToast.error(result.message || 'Không thể thêm vào giỏ hàng');
      return;
    }

    limitedToast.success('Đã thêm sản phẩm vào giỏ hàng');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = addToCart(product, 1);
    if (!result.ok) {
      limitedToast.error(result.message || 'Không thể mua sản phẩm này');
      return;
    }

    navigate('/checkout');
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const nextState = toggleWishlist(product.id);
      setIsFavorite(nextState);
      limitedToast.success(nextState ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích');
    } catch {
      limitedToast.error('Không thể cập nhật yêu thích của sản phẩm này');
    }
  };

  const getCategoryName = () => {
    if (isGundamProduct) return 'Gundam';
    if (product.category === 'pokemon') return 'Pokémon Card';
    if (product.category === 'onepiece') return 'One Piece Card';
    return '';
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className="block h-full"
    >
      <div 
        className="
          group 
          bg-white 
          rounded-2xl 
          overflow-hidden 
          border-2 border-gray-100
          hover:border-primary 
          hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]
          transition-all 
          duration-500 
          ease-out
          h-full 
          flex 
          flex-col
          hover:-translate-y-1
        " 
      >
        {/* IMAGE AREA */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 p-3">
          <button
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            className={`absolute left-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-200 ${
              isFavorite
                ? 'border-primary bg-primary text-white shadow-[0_8px_18px_rgba(227,24,55,0.24)]'
                : 'border-white/80 bg-white/92 text-gray-500 shadow-sm backdrop-blur hover:border-primary hover:text-primary'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          <div className="w-full h-full rounded-xl overflow-hidden">
            {primaryImage ? (
              <div className="relative h-full w-full">
                <img
                  src={primaryImage}
                  alt={product.name}
                  decoding="async"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  className={`
                    w-full 
                    h-full 
                    object-cover 
                    transition-all 
                    duration-700 
                    ease-out
                    ${isSoldOut ? 'brightness-50 grayscale-[0.35]' : 'group-hover:scale-110'}
                  `}
                />
                {isSoldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <span className="rounded-full bg-primary px-4 py-2 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-lg">
                      Sold out
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-center text-sm font-medium text-gray-400">
                No image available
              </div>
            )}
          </div>
          
          {product.grade && (
            <div className="absolute top-5 right-5 z-10">
              <Badge 
                className={`
                  ${getGradeColor(product.grade)} 
                  font-bold 
                  text-xs 
                  px-3 
                  py-1.5 
                  shadow-lg
                  rounded-lg
                `}
              >
                {product.grade}
              </Badge>
            </div>
          )}
          
          {isCardProduct && product.rarity && (
            <div className="absolute top-5 right-5 z-10">
              <Badge 
                className={`
                  ${getRarityColor(product.rarity)} 
                  font-bold 
                  text-xs 
                  px-3 
                  py-1.5 
                  shadow-lg
                  rounded-lg
                `}
              >
                {product.rarity}
              </Badge>
            </div>
          )}
        </div>

        {/* CONTENT AREA */}
        <div className="p-5 flex flex-col flex-grow">
          
          <h3 
            className="
              text-lg
              font-bold
              text-black 
              line-clamp-2 
              leading-tight
              group-hover:text-primary 
              transition-colors 
              duration-300
            "
          >
            {product.name}
          </h3>
          
          <div className="flex items-center mt-0.5">
            <span 
              className="
                text-xs 
                font-medium 
                text-gray-500
                uppercase
                tracking-wide
              "
            >
              {getCategoryName()}
            </span>
          </div>
          
          <div className="pt-5">
            <p 
              className="
                text-2xl 
                font-bold 
                text-primary
                tracking-tight
              "
            >
              {formatPrice(product.price)}
            </p>
          </div>

          <div className="pt-3 space-y-2.5">
            <button
              onClick={handleBuyNow}
              disabled={isSoldOut}
              className="w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(227,24,55,0.35)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Mua ngay
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`
                w-full
                px-6 
                py-3
                bg-white
                border-2 
                ${isGundamProduct ? 'border-primary text-primary' : 'border-secondary text-secondary'}
                rounded-xl
                font-semibold
                text-sm
                transition-all 
                duration-300
                hover:scale-[1.02]
                disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:hover:scale-100
                ${isGundamProduct 
                  ? 'hover:bg-primary hover:text-white hover:shadow-[0_0_20px_rgba(227,24,55,0.4)]' 
                  : 'hover:bg-secondary hover:text-white hover:shadow-[0_0_20px_rgba(0,102,204,0.4)]'
                }
              `}
            >
              Thêm vào giỏ
            </button>
          </div>

          <div className="pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center justify-between">
              <span 
                className={`
                  text-xs 
                  font-medium
                  ${availableStock > 0 ? 'text-gray-500' : 'text-primary'}
                `}
              >
                {availableStock > 0 ? `Còn hàng: ${availableStock}` : 'Hết hàng'}
              </span>
              {availableStock > 0 && (
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});