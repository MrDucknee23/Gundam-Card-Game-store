import React, { useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ProductCard } from './ProductCard';
import { ArrowButton } from './ArrowButton';
import { Product } from '../types/product';

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  showCarousel?: boolean;
  products?: Product[];
  loading?: boolean;
  error?: string | null;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = React.memo(({ 
  title = 'Sản phẩm nổi bật',
  subtitle = 'Những lựa chọn nổi bật dành cho bạn',
  showCarousel = true,
  products = [],
  loading = false,
  error = null,
}) => {
  const sliderRef = useRef<Slider>(null);
  const featuredProducts = products.filter((product) => product.featured).slice(0, 8);
  const displayProducts = (featuredProducts.length > 0 ? featuredProducts : products.slice(0, 8));

  if (loading) {
    return (
      <section className="py-14 group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(0,0,0,0.98))] px-6 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <p className="text-gray-400">Đang tải sản phẩm nổi bật...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-14 group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(0,0,0,0.98))] px-6 py-10 shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayProducts.length === 0) {
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
      <section className="py-14 group">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(0,0,0,0.98))] px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-white mb-2">{title}</h2>
                {subtitle && (
                  <p className="text-gray-400">{featuredProducts.length > 0 ? subtitle : 'Sản phẩm mới nhất từ cửa hàng'}</p>
                )}
              </div>
              
              {/* Navigation Arrows - Only visible on hover on desktop */}
              <div className="hidden md:flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowButton
                  direction="left"
                  onClick={() => sliderRef.current?.slickPrev()}
                  className="bg-gray-900/90 hover:bg-gray-800 border border-white/10 hover:border-primary transition-all duration-300"
                />
                <ArrowButton
                  direction="right"
                  onClick={() => sliderRef.current?.slickNext()}
                  className="bg-gray-900/90 hover:bg-gray-800 border border-white/10 hover:border-primary transition-all duration-300"
                />
              </div>
            </div>

            {/* Carousel */}
            <div>
              <Slider ref={sliderRef} {...sliderSettings}>
                {displayProducts.map((product) => (
                  <div key={product.id} className="px-2 py-2">
                    <ProductCard product={product} />
                  </div>
                ))}
              </Slider>
            </div>

            {/* Mobile Navigation */}
            <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
              <ArrowButton
                direction="left"
                onClick={() => sliderRef.current?.slickPrev()}
                className="bg-gray-900/90 hover:bg-gray-800 border border-white/10 hover:border-primary transition-all duration-300"
              />
              <ArrowButton
                direction="right"
                onClick={() => sliderRef.current?.slickNext()}
                className="bg-gray-900/90 hover:bg-gray-800 border border-white/10 hover:border-primary transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Grid layout (no carousel)
  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,12,20,0.96),rgba(0,0,0,0.98))] px-5 py-8 shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:px-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-white mb-2">{title}</h2>
            {subtitle && (
              <p className="text-gray-400">{featuredProducts.length > 0 ? subtitle : 'Sản phẩm mới nhất từ cửa hàng'}</p>
            )}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});