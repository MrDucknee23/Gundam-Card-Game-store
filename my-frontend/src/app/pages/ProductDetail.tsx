import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ChevronLeft, Star } from 'lucide-react';
import { toast } from 'sonner';
import { fetchProductById, fetchProducts } from '../utils/productApi';
import { fetchReviews, createReview, Review } from '../utils/reviewApi';
import { formatPrice } from '../utils/format';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import { ProductCard } from '../components/ProductCard';
import { resolveProductImageUrl, withImageFallback } from '../utils/imageUrl';

// ─── Avatar helper ───
const UserAvatar: React.FC<{ name: string; avatar?: string | null; size?: number }> = ({
  name,
  avatar,
  size = 32,
}) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-xs"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};

// ─── Star rating component ───
const StarRating: React.FC<{
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readonly?: boolean;
}> = ({ value, onChange, size = 20, readonly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-colors`}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <Star
            style={{ width: size, height: size }}
            className={`${
              star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Related products
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

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

  // Load reviews
  useEffect(() => {
    if (!id) return;
    fetchReviews(id).then(setReviews).catch(() => setReviews([]));
  }, [id]);

  // Load related products
  useEffect(() => {
    fetchProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]));
  }, []);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 12);
  }, [allProducts, product]);

  useEffect(() => {
    if (!carouselApi) return;

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
    if (!carouselApi) return;
    carouselApi.scrollTo(selectedImage);
  }, [carouselApi, selectedImage]);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setActiveTab('description');
  }, [product?.id]);

  // Review stats
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

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
          <h1 className="text-2xl font-bold mb-4 text-black">Không tìm thấy sản phẩm</h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-primary hover:underline"
          >
            Quay về cửa hàng
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
      toast.error('Số lượng vượt quá tồn kho hiện tại');
      return;
    }
    const result = addToCart(product, quantity);
    if (!result.ok) {
      toast.error(result.message || 'Không thể thêm vào giỏ hàng');
      return;
    }
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    const result = addToCart(product, quantity);
    if (!result.ok) {
      toast.error(result.message || 'Không thể mua sản phẩm này');
      return;
    }
    navigate('/checkout');
  };

  const handleSubmitReview = async () => {
    if (!user) return;
    if (!reviewContent.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }
    try {
      setSubmittingReview(true);
      const newReview = await createReview(product.id, user.id, reviewRating, reviewContent.trim());
      setReviews((prev) => [newReview, ...prev]);
      setReviewContent('');
      setReviewRating(5);
      toast.success('Đã gửi đánh giá!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gửi đánh giá thất bại';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
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
                    <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={resolveProductImageUrl(image)}
                        alt={`${product.name} ${index + 1}`}
                        onError={withImageFallback}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 border-gray-300 bg-white/90 text-gray-700 hover:bg-white hover:text-black disabled:opacity-30" />
                  <CarouselNext className="right-4 border-gray-300 bg-white/90 text-gray-700 hover:bg-white hover:text-black disabled:opacity-30" />
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
                      : 'border-gray-200 hover:border-gray-400'
                    }
                  `}
                >
                  <img
                    src={resolveProductImageUrl(image)}
                    alt={`${product.name} ${index + 1}`}
                    onError={withImageFallback}
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
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </p>
            </div>

            {/* Technical Info — light background */}
            {(product.grade || product.scale || product.material || product.cardType) && (
              <div className="bg-white rounded-xl p-6 mb-6 border border-[#e0e0e0]">
                <h2 className="font-semibold text-lg mb-4 text-gray-900">Thông tin kỹ thuật</h2>
                <div className="space-y-2">
                  {product.grade && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cấp độ:</span>
                      <span className="font-semibold text-gray-900">{product.grade}</span>
                    </div>
                  )}
                  {product.scale && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tỷ lệ:</span>
                      <span className="font-semibold text-gray-900">{product.scale}</span>
                    </div>
                  )}
                  {product.material && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chất liệu:</span>
                      <span className="font-semibold text-gray-900">{product.material}</span>
                    </div>
                  )}
                  {product.cardType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại thẻ:</span>
                      <span className="font-semibold text-gray-900">{product.cardType}</span>
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
                  onChange={(e) => {
                    const parsedQuantity = parseInt(e.target.value, 10);
                    const safeQuantity = Number.isFinite(parsedQuantity)
                      ? Math.min(Math.max(1, parsedQuantity), Math.max(1, product.stock))
                      : 1;
                    setQuantity(safeQuantity);
                  }}
                  className="w-20 text-center bg-white border-gray-300 text-black"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
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
                className="flex-1 bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* ─── Tab Section ─── */}
        <div className="mt-12">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'description'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Mô tả
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Đánh giá ({reviews.length})
            </button>
          </div>

          {/* Tab: Mô tả */}
          {activeTab === 'description' && (
            <div className="py-6">
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
          )}

          {/* Tab: Đánh giá */}
          {activeTab === 'reviews' && (
            <div className="py-6">
              {/* Summary */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
                  <StarRating value={Math.round(avgRating)} readonly size={18} />
                  <p className="text-sm text-gray-500 mt-1">{reviews.length} đánh giá</p>
                </div>
              </div>

              {/* Review Form */}
              {isAuthenticated && user ? (
                <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Viết đánh giá</h3>
                  <div className="mb-3">
                    <label className="block text-sm text-gray-600 mb-1">Số sao</label>
                    <StarRating value={reviewRating} onChange={setReviewRating} size={28} />
                  </div>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                    rows={4}
                    maxLength={2000}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none"
                  />
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewContent.trim()}
                      className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-5 bg-gray-50 rounded-xl border border-gray-200 text-center">
                  <p className="text-gray-600 mb-3">Vui lòng đăng nhập để viết đánh giá</p>
                  <Link
                    to="/login"
                    className="inline-block px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center gap-3 mb-2">
                        <UserAvatar
                          name={review.userName}
                          avatar={review.userAvatar}
                          size={32}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{review.userName}</p>
                          <div className="flex items-center gap-2">
                            <StarRating value={review.rating} readonly size={14} />
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed break-words">{review.content}</p>
                      {review.adminReply && (
                        <div className="mt-3 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-primary">
                              {review.adminReplyAuthor || 'Quản trị viên'} đã phản hồi
                            </p>
                            {review.adminReplyAt && (
                              <span className="text-xs text-gray-500">
                                {new Date(review.adminReplyAt).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                            {review.adminReply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Related Products ─── */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sản phẩm liên quan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <div key={p.id} className="min-w-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};