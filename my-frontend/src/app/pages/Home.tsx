import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import Slider from 'react-slick';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ArrowButton } from '../components/ArrowButton';
import { FeaturedProducts } from '../components/FeaturedProducts';
import type { GundamGrade, ProductCategory } from '../types/product';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useProducts } from '../hooks/useProducts';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, error } = useProducts();
  const sliderRef = useRef<Slider>(null);
  const [selectedGrade, setSelectedGrade] = useState<GundamGrade | null>(null);
  const [selectedCardCategory, setSelectedCardCategory] = useState<Exclude<ProductCategory, 'gundam'> | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Xây dựng Gundam mơ ước',
      subtitle: 'Bộ mô hình cao cấp từ HG đến Perfect Grade',
      cta: 'Mua Gundam',
      link: '/shop?category=gundam',
      image: '/images/herobanner2.jpg'
    },
    {
      title: 'Sưu tầm thẻ bài huyền thoại',
      subtitle: 'Thẻ bài Pokémon và One Piece TCG',
      cta: 'Mua thẻ bài',
      link: '/shop?category=pokemon',
      image: 'https://images.unsplash.com/photo-1628968434441-d9c1c66dcde7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb2tlbW9uJTIwdHJhZGluZyUyMGNhcmRzJTIwY29sbGVjdGlvbiUyMHNwcmVhZHxlbnwxfHx8fDE3NzQ4NzU1NDF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      title: 'Phát hành phiên bản giới hạn',
      subtitle: 'Thẻ bài hiếm độc quyền và bộ mô hình đặc biệt',
      cta: 'Xem bộ sưu tập',
      link: '/shop',
      image: '/images/image-10.png'
    },
    {
      title: 'Chất lượng cao cấp đảm bảo',
      subtitle: 'Sản phẩm chính hãng từ nhà phân phối chính thức',
      cta: 'Khám phá ngay',
      link: '/shop',
      image: '/images/Generated_Image_964vx0964vx0964v_removed.png'
    },
    {
      title: 'Tham gia cộng đồng',
      subtitle: 'Kết nối với các nhà sưu tầm trên toàn thế giới',
      cta: 'Bắt đầu',
      link: '/about',
      image: '/images/herobanner1.jpg'
    }
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    arrows: false,
    beforeChange: (oldIndex: number, newIndex: number) => setCurrentSlide(newIndex)
  };

  const categories = [
    {
      grade: 'HG' as GundamGrade,
      title: 'High Grade',
      description: 'Tỷ lệ 1/144 với khả năng tạo dáng linh hoạt',
      image: '/images/hg_gundam.jpg'
    },
    {
      grade: 'MG' as GundamGrade,
      title: 'Master Grade',
      description: 'Tỷ lệ 1/100 với khung xương chi tiết',
      image: '/images/mg_gundam.png'
    },
    {
      grade: 'RG' as GundamGrade,
      title: 'Real Grade',
      description: 'Tỷ lệ 1/144 với chi tiết nâng cao',
      image: '/images/rg_gundam.png'
    },
    {
      grade: 'PG' as GundamGrade,
      title: 'Perfect Grade',
      description: 'Tỷ lệ 1/60 với chất lượng hoàn thiện cao nhất',
      image: '/images/pg_gundam.png'
    }
  ];

  const gundamProducts = selectedGrade
    ? products.filter(p => p.category === 'gundam' && p.grade === selectedGrade)
    : products.filter(p => p.category === 'gundam').slice(0, 8);

  const cardGameProducts = selectedCardCategory
    ? products.filter(p => p.category === selectedCardCategory).slice(0, 8)
    : products
        .filter(p => p.category === 'pokemon' || p.category === 'onepiece')
        .slice(0, 8);

  const cardCategories: Array<{
    category: Exclude<ProductCategory, 'gundam'>;
    title: string;
    description: string;
    image: string;
  }> = [
    {
      category: 'pokemon',
      title: 'Pokémon TCG',
      description: 'Sưu tầm những lá bài sinh vật huyền thoại và thẻ chiến đấu',
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80'
    },
    {
      category: 'onepiece',
      title: 'One Piece Card Game',
      description: 'Đồng hành trong hành trình hải tặc với bộ thẻ nhân vật',
      image: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=800&q=80'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel */}
      <section className="relative group">
        <Slider ref={sliderRef} {...sliderSettings}>
          {heroSlides.map((slide, index) => (
            <div key={index}>
              <div className="relative h-[260px] sm:h-[380px] md:h-[480px] lg:h-[600px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 sm:mb-4">{slide.title}</h1>
                      <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-8 text-white/90 hidden sm:block">{slide.subtitle}</p>
                      <button
                        onClick={() => navigate(slide.link)}
                        className="bg-primary hover:bg-primary/90 text-white px-5 sm:px-8 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-105"
                      >
                        {slide.cta}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>

        {/* Navigation Arrows */}
        <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <ArrowButton direction="left" onClick={() => sliderRef.current?.slickPrev()} />
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
            <ArrowButton direction="right" onClick={() => sliderRef.current?.slickNext()} />
          </div>
        </div>

        {/* Carousel Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => sliderRef.current?.slickGoTo(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts 
        title="Sản phẩm nổi bật"
        subtitle="Những lựa chọn nổi bật dành cho bạn"
        showCarousel={true}
        products={products}
        loading={loading}
        error={error}
      />

      {/* Gundam Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3">Bộ mô hình Gundam</h2>
          <p className="text-gray-600 text-sm sm:text-lg">Chọn cấp độ và bắt đầu lắp ráp</p>
        </div>

        {/* Category Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category.grade}
              grade={category.grade}
              title={category.title}
              description={category.description}
              image={category.image}
              isActive={selectedGrade === category.grade}
              onClick={() => setSelectedGrade(selectedGrade === category.grade ? null : category.grade)}
            />
          ))}
        </div>

        {/* Product Grid */}
        {loading ? (
          <p className="text-center text-gray-500">Đang tải sản phẩm Gundam...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {gundamProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/shop?category=gundam')}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2 border-primary"
          >
            Xem tất cả Gundam
          </button>
        </div>
      </section>

      {/* Card Games Section */}
      <section className="bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 py-10 sm:py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-3">Thẻ bài sưu tầm</h2>
            <p className="text-gray-600 text-sm sm:text-lg">Xây dựng bộ bài tối ưu của bạn</p>
          </div>

          {/* Category Cards - Centered with larger size */}
          <div className="flex justify-center mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
              {cardCategories.map((cat) => (
                <CategoryCard
                  key={cat.category}
                  category={cat.category}
                  title={cat.title}
                  description={cat.description}
                  image={cat.image}
                  isActive={selectedCardCategory === cat.category}
                  onClick={() => setSelectedCardCategory(selectedCardCategory === cat.category ? null : cat.category)}
                />
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <p className="text-center text-gray-500">Đang tải sản phẩm the bai...</p>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 transition-all duration-500">
              {cardGameProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/shop?category=pokemon')}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 border-2 border-primary"
            >
              Xem tất cả thẻ bài
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};