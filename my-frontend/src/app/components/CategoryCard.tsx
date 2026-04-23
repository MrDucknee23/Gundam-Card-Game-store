import React, { useState } from 'react';
import { GundamGrade, ProductCategory } from '../types/product';

interface CategoryCardProps {
  grade?: GundamGrade;
  category?: ProductCategory;
  title: string;
  description: string;
  image: string;
  onClick: () => void;
  isActive?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  grade,
  category,
  title,
  description,
  image,
  onClick,
  isActive = false
}) => {
  const [imgError, setImgError] = useState(false);
  const getOverlayColor = () => {
    if (grade) {
      switch (grade) {
        case 'HG':
          return 'from-green-500 to-green-600';
        case 'MG':
          return 'from-blue-500 to-blue-600';
        case 'RG':
          return 'from-purple-500 to-purple-600';
        case 'PG':
          return 'from-red-500 to-red-600';
      }
    }
    
    if (category) {
      switch (category) {
        case 'pokemon':
          return 'from-yellow-500 to-yellow-600';
        case 'onepiece':
          return 'from-orange-500 to-red-600';
        default:
          return 'from-primary to-secondary';
      }
    }
    
    return 'from-primary to-secondary';
  };

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-[1.6rem] border border-white/60 bg-white/85 shadow-[0_22px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl transform transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(220,20,60,0.18)] ${isActive ? 'border-primary shadow-[0_22px_44px_rgba(220,20,60,0.2)]' : 'hover:border-primary/60'}`}
    >
      {/* Background Image */}
      <div className="aspect-[20/9] relative overflow-hidden">
        {!imgError && (
          <img
            src={image}
            alt={title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {/* Gradient Overlay — hiện đầy khi ảnh lỗi, nửa trong suốt khi ảnh load */}
        <div
          className={`absolute inset-0 bg-gradient-to-t ${getOverlayColor()} ${
            imgError ? 'opacity-100' : 'opacity-65 group-hover:opacity-75'
          } transition-opacity`}
        />

        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/24" />
        <div className="absolute inset-x-4 top-4 h-7 rounded-full bg-white/18 blur-xl" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="transform transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="mb-2 text-2xl font-bold tracking-[-0.02em]">{title}</h3>
          <p className="text-sm text-white/90">{description}</p>
        </div>
      </div>
    </div>
  );
};