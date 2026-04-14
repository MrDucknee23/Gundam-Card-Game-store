import React, { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ProductCard } from './ProductCard';
import { ArrowButton } from './ArrowButton';
import { getFeaturedProducts } from '../data/products';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  showCarousel?: boolean;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  title = 'Featured Products',
  subtitle = 'Top picks for you',
  showCarousel = true
}) => {
  const sliderRef = useRef<Slider>(null);
  const featuredProducts = getFeaturedProducts();

  if (featuredProducts.length === 0) {
    return null;
  }

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (showCarousel) {
    return (
      <section className="py-12 bg-black group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-white mb-2">{title}</h2>
              {subtitle && (
                <p className="text-gray-400">{subtitle}</p>
              )}
            </div>
            
            {/* Navigation Arrows - Only visible on hover on desktop */}
            <div className="hidden md:flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowButton
                direction="left"
                onClick={() => sliderRef.current?.slickPrev()}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-primary transition-all duration-300"
              />
              <ArrowButton
                direction="right"
                onClick={() => sliderRef.current?.slickNext()}
                className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-primary transition-all duration-300"
              />
            </div>
          </div>

          {/* Carousel */}
          <div>
            <Slider ref={sliderRef} {...sliderSettings}>
              {featuredProducts.map((product) => (
                <div key={product.id} className="px-2">
                  <ProductCard product={product} />
                </div>
              ))}
            </Slider>
          </div>

          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center justify-center gap-4 mt-6">
            <ArrowButton
              direction="left"
              onClick={() => sliderRef.current?.slickPrev()}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-primary transition-all duration-300"
            />
            <ArrowButton
              direction="right"
              onClick={() => sliderRef.current?.slickNext()}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-primary transition-all duration-300"
            />
          </div>
        </div>
      </section>
    );
  }

  // Grid layout (no carousel)
  return (
    <section className="py-12 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-white mb-2">{title}</h2>
          {subtitle && (
            <p className="text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};