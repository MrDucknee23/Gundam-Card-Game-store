import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ArrowButtonProps {
  direction: 'left' | 'right';
  onClick?: () => void;
  className?: string;
}

export const ArrowButton: React.FC<ArrowButtonProps> = ({ direction, onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-12 h-12 rounded-full bg-white/90 hover:bg-primary
        shadow-lg hover:shadow-xl hover:shadow-primary/50
        flex items-center justify-center
        transition-all duration-300
        hover:scale-110
        group
        ${className}
      `}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
    >
      {direction === 'left' ? (
        <ChevronLeft className="w-6 h-6 text-black group-hover:text-white transition-colors duration-300" />
      ) : (
        <ChevronRight className="w-6 h-6 text-black group-hover:text-white transition-colors duration-300" />
      )}
    </button>
  );
};