import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import Slider from 'react-slick';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import { ArrowButton } from '../components/ArrowButton';
import { FeaturedProducts } from '../components/FeaturedProducts';
import { products } from '../data/products';
import type { GundamGrade, ProductCategory } from '../data/products';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import limitedEditionImage from '../../imports/image-10.png';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const sliderRef = useRef<Slider>(null);
  const [selectedGrade, setSelectedGrade] = useState<GundamGrade | null>(null);
  const [selectedCardCategory, setSelectedCardCategory] = useState<'pokemon' | 'onepiece' | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Xây dựng Gundam mơ ước',
      subtitle: 'Bộ mô hình cao cấp từ HG đến Perfect Grade',
      cta: 'Mua Gundam',
      link: '/shop?category=gundam',
      image: 'https://images.unsplash.com/photo-1664460244070-b00f551389cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndW5kYW0lMjBtb2RlbCUyMGkptCUyMHByZW1pdW0lMjBkaXNwbGF5fGVufDF8fHx8MTc3NDg3NTU0MXww&ixlib=rb-4.1.0&q=80&w=1080'
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
      image: limitedEditionImage
    },
    {
      title: 'Chất lượng cao cấp đảm bảo',
      subtitle: 'Sản phẩm chính hãng từ nhà phân phối chính thức',
      cta: 'Khám phá ngay',
      link: '/shop',
      image: 'https://images.unsplash.com/photo-1757800735035-de547775ee6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwcHJvZHVjdCUyMHF1YWxpdHklMjBhdXRoZW50aWN8ZW58MXx8fHwxNzc0ODc1NTQyfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      title: 'Tham gia cộng đồng',
      subtitle: 'Kết nối với các nhà sưu tầm trên toàn thế giới',
      cta: 'Bắt đầu',
      link: '/about',
      image: 'https://images.unsplash.com/photo-1556866149-a42ffe6478ea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2JieSUyMGNvbGxlY3RvciUyMGNvbW11bml0eSUyMHdvcmtzcGFjZXxlbnwxfHx8fDE3NzQ4NzU1NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
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
      description: '1/144 scale with excellent articulation',
      image: 'https://images.unsplash.com/photo-1712971724897-a9ae95e0ec44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndW5kYW0lMjBtb2RlbCUyMHJvYm90JTIwc2ltcGxlfGVufDF8fHx8MTc3NDg3NTA2Nnww&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      grade: 'MG' as GundamGrade,
      title: 'Master Grade',
      description: '1/100 scale with detailed inner frame',
      image: 'https://images.unsplash.com/photo-1681367050714-f170aad806ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndW5kYW0lMjBkZXRhaWxlZCUyMG1lY2hhbmljYWwlMjBmcmFtZXxlbnwxfHx8fDE3NzQ4NzUwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      grade: 'RG' as GundamGrade,
      title: 'Real Grade',
      description: '1/144 scale with advanced detail',
      image: 'https://images.unsplash.com/photo-1644898262501-6e73916dce2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndW5kYW0lMjByZWFsaXN0aWMlMjBkeW5hbWljJTIwcG9zZXxlbnwxfHx8fDE3NzQ4NzUwNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      grade: 'PG' as GundamGrade,
      title: 'Perfect Grade',
      description: '1/60 scale ultimate quality',
      image: 'https://images.unsplash.com/photo-1742407881242-a867b21fb364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxndW5kYW0lMjBwZXJmZWN0JTIwZ3JhZGUlMjByb2JvdHxlbnwxfHx8fDE3NzQ4NzUwNjl8MA&ixlib=rb-4.1.0&q=80&w=1080'
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

  const cardCategories = [
    {
      category: 'pokemon' as ProductCategory,
      title: 'Pokémon TCG',
      description: 'Collect legendary creatures and battle cards',
      image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80'
    },
    {
      category: 'onepiece' as ProductCategory,
      title: 'One Piece Card Game',
      description: 'Join the adventure with pirate crew cards',
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
              <div className="relative h-[500px] md:h-[600px]">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl text-white">
                      <h1 className="text-4xl md:text-6xl font-bold mb-4">{slide.title}</h1>
                      <p className="text-xl md:text-2xl mb-8 text-white/90">{slide.subtitle}</p>
                      <button
                        onClick={() => navigate(slide.link)}
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
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
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts 
        title="Featured Products"
        subtitle="Top picks for you"
        showCarousel={true}
      />

      {/* Gundam Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Bộ mô hình Gundam</h2>
          <p className="text-gray-600 text-lg">Chọn cấp độ và bắt đầu lắp ráp</p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gundamProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

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
      <section className="bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50 py-16 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Thẻ bài sưu tầm</h2>
            <p className="text-gray-600 text-lg">Xây dựng bộ bài tối ưu của bạn</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-500">
            {cardGameProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

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