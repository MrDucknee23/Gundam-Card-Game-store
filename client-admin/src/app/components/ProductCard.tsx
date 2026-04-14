import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import type { Product } from '../data/products';
import { Badge } from './ui/badge';

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

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const isCardProduct = product.category === 'pokemon' || product.category === 'onepiece';
  const isGundamProduct = product.category === 'gundam';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          <div className="w-full h-full rounded-xl overflow-hidden">
            <img
              src={product.images?.[0] || ''}
              alt={product.name}
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="
                w-full 
                h-full 
                object-cover 
                group-hover:scale-110 
                transition-transform 
                duration-700 
                ease-out
              "
            />
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

          <div className="pt-3">
            <button
              onClick={handleAddToCart}
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
                hover:scale-105
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
                  ${product.stock > 0 ? 'text-gray-500' : 'text-primary'}
                `}
              >
                {product.stock > 0 ? `Còn hàng: ${product.stock}` : 'Hết hàng'}
              </span>
              {product.stock > 0 && (
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};