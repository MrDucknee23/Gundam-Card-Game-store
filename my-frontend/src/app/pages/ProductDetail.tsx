import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { fetchProductById } from '../utils/productApi';
import { formatPrice } from '../utils/format';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        const currentProduct = await fetchProductById(id);
        setProduct(currentProduct);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    const syncSelectedImage = () => {
      setSelectedImage(carouselApi.selectedScrollSnap());
    };

    syncSelectedImage();
    carouselApi.on('select', syncSelectedImage);
    carouselApi.on('reInit', syncSelectedImage);

    return () => {
      carouselApi.off('select', syncSelectedImage);
      carouselApi.off('reInit', syncSelectedImage);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }

    carouselApi.scrollTo(selectedImage);
  }, [carouselApi, selectedImage]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black">Product not found</h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-primary hover:underline"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'Common':
        return 'bg-gray-500 text-white';
      case 'Rare':
        return 'bg-blue-600 text-white';
      case 'Super Rare':
        return 'bg-purple-600 text-white';
      case 'Ultra Rare':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getGradeColor = (grade?: string) => {
    switch (grade) {
      case 'HG':
        return 'bg-green-600 text-white';
      case 'MG':
        return 'bg-blue-600 text-white';
      case 'RG':
        return 'bg-purple-600 text-white';
      case 'PG':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      toast.error('Not enough stock available');
      return;
    }
    addToCart(product, quantity);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (product.stock === 0) {
      return;
    }
    addToCart(product, quantity);
    navigate('/checkout');
  };

  const descriptionBlocks = product.description
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-black mb-8 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Quay lại
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            {/* Main Image */}
            <Carousel
              setApi={setCarouselApi}
              opts={{ loop: product.images.length > 1 }}
              className="mb-4"
            >
              <CarouselContent>
                {product.images.map((image, index) => (
                  <CarouselItem key={`${product.id}-${index}`}>
                    <div className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 border-gray-700 bg-black/70 text-white hover:bg-black/85 hover:text-white disabled:bg-black/30" />
                  <CarouselNext className="right-4 border-gray-700 bg-black/70 text-white hover:bg-black/85 hover:text-white disabled:bg-black/30" />
                </>
              )}
            </Carousel>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden
                    transition-all duration-300 border-2
                    ${selectedImage === index 
                      ? 'border-primary scale-105' 
                      : 'border-gray-800 hover:border-gray-700'
                    }
                  `}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              {product.category !== 'gundam' && product.rarity && (
                <Badge className={`${getRarityColor(product.rarity)} border-0 mb-2`}>
                  {product.rarity}
                </Badge>
              )}
              {product.category === 'gundam' && product.grade && (
                <Badge className={`${getGradeColor(product.grade)} border-0 mb-2`}>
                  {product.grade}
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-4 mb-6">
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className={`${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <h2 className="font-semibold text-lg mb-3 text-black">Mô tả</h2>
              <div className="space-y-5 text-gray-700 leading-8">
                {descriptionBlocks.map((block, blockIndex) => {
                  const lines = block
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean);

                  const bulletLines = lines.filter((line) => /^[.\-•]/.test(line));
                  const introLines = lines.filter((line) => !/^[.\-•]/.test(line));

                  return (
                    <div key={`${product.id}-desc-${blockIndex}`} className="space-y-2">
                      {introLines.length > 0 && (
                        <p className="whitespace-pre-line text-[17px] leading-8 text-gray-700">
                          {introLines.join('\n')}
                        </p>
                      )}

                      {bulletLines.length > 0 && (
                        <ul className="space-y-2 pl-5 text-[17px] leading-8 text-gray-700 marker:text-primary list-disc">
                          {bulletLines.map((line, lineIndex) => (
                            <li key={`${product.id}-desc-${blockIndex}-${lineIndex}`}>
                              {line.replace(/^[.\-•]\s*/, '')}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Technical Info */}
            {(product.grade || product.scale || product.material || product.cardType) && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
                <h2 className="font-semibold text-lg mb-4 text-black">Thông tin kỹ thuật</h2>
                <div className="space-y-2">
                  {product.grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Grade:</span>
                      <span className="font-semibold text-black">{product.grade}</span>
                    </div>
                  )}
                  {product.scale && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Scale:</span>
                      <span className="font-semibold text-black">{product.scale}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-semibold text-black">{product.material}</span>
                    </div>
                  )}
                  {product.cardType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Card Type:</span>
                      <span className="font-semibold text-black">{product.cardType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block font-semibold mb-2 text-black">Số lượng</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-black hover:border-primary transition-colors"
                >
                  -
                </button>
                <Input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center bg-white border-gray-300 text-black"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 bg-white text-black hover:border-primary transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-black hover:bg-gray-900 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-2 border-white disabled:border-gray-600"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-2 border-primary disabled:border-gray-600"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};