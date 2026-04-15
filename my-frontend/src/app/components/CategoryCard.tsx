import React from 'react';
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
      className={`group relative overflow-hidden rounded-xl cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/30 border-2 border-gray-300 hover:border-primary ${isActive ? 'border-primary' : ''}`}
    >
      {/* Background Image */}
      <div className="aspect-[20/9] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${getOverlayColor()} opacity-60 group-hover:opacity-70 transition-opacity`} />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="transform transition-transform duration-300 group-hover:translate-y-0">
          <h3 className="text-2xl font-bold mb-2">{title}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};