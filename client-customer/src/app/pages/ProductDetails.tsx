import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { products as allProducts } from '../data/products';
import { Breadcrumb } from '../components/Breadcrumb';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Pencil, Trash2, Copy, ArrowLeft, Package, DollarSign, Calendar, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const product = allProducts.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
            <p className="text-gray-600 mb-6">Sản phẩm bạn đang tìm không tồn tại hoặc đã bị xóa.</p>
            <Link
              to="/admin/products"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại danh sách sản phẩm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      gundam: 'Gundam',
      pokemon: 'Pokémon',
      onepiece: 'One Piece'
    };
    return labels[category] || category;
  };

  const getStatus = () => {
    if (product.stock === 0) return { label: 'Hết hàng', color: 'red' };
    if (product.stock > 0 && product.stock <= 10) return { label: 'Sắp hết', color: 'orange' };
    return { label: 'Đang bán', color: 'green' };
  };

  const status = getStatus();

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    toast.success('Sản phẩm đã được xóa thành công!');
    navigate('/admin/products');
  };

  const handleDuplicate = () => {
    toast.success('Sản phẩm đã được sao chép!');
    navigate('/admin/products');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Sản phẩm', href: '/admin/products' },
            { label: product.name }
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Quay lại</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Sao chép
            </button>
            <Link
              to={`/admin/products/${product.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Pencil className="w-4 h-4" />
              Chỉnh sửa
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Xóa
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Main Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                <img
                  src={product.images[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-blue-600 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Product Description */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        status.color === 'green'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : status.color === 'orange'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Price */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Giá bán</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</p>
                  </div>
                </div>

                {/* Stock */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tồn kho</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {product.stock} sản phẩm
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Danh mục</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {getCategoryLabel(product.category)}
                    </p>
                  </div>
                </div>

                {/* SKU */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">SKU / Product ID</p>
                    <p className="text-sm font-mono text-gray-900">{product.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin chi tiết</h3>
              <div className="space-y-3">
                {product.grade && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Grade</span>
                    <span className="text-sm font-semibold text-gray-900">{product.grade}</span>
                  </div>
                )}
                {product.rarity && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Độ hiếm</span>
                    <span className="text-sm font-semibold text-gray-900">{product.rarity}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Trạng thái kho</span>
                  <span
                    className={`text-sm font-semibold ${
                      product.stock > 10
                        ? 'text-green-600'
                        : product.stock > 0
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {product.stock > 10 ? 'Còn nhiều' : product.stock > 0 ? 'Còn ít' : 'Hết hàng'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Tổng hình ảnh</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {product.images.length} ảnh
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Hành động nhanh</h3>
              <div className="space-y-2">
                <Link
                  to={`/product/${product.id}`}
                  target="_blank"
                  className="block w-full text-center px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Xem trên trang chủ
                </Link>
                <button
                  onClick={() => {
                    copyToClipboard(product.id);
                    toast.success('Đã sao chép SKU!');
                  }}
                  className="block w-full text-center px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors border border-gray-200"
                >
                  Sao chép SKU
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={product.name}
        itemType="sản phẩm"
      />
    </div>
  );
};