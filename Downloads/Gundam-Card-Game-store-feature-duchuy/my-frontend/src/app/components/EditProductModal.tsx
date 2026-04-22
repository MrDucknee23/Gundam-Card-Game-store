import React, { useState } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Product, ProductCategory, GundamGrade, CardRarity } from '../types/product';
import { useCategories } from '../hooks/useCategories';
import { toast } from 'sonner';
import { uploadProductFiles } from '../utils/productApi';

const MAX_PRODUCT_IMAGES = 10;

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (updatedProduct: Product) => void;
  onDelete?: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    grade: product.grade || '',
    rarity: product.rarity || '',
    price: product.price,
    description: product.description,
    stock: product.stock,
    images: [...product.images]
  });

  const [selectedMainImage, setSelectedMainImage] = useState(0);

  const { categories: categoriesData } = useCategories();
  const categories = categoriesData.map(c => ({ value: c.slug as ProductCategory, label: c.label }));

  const gundamGrades: GundamGrade[] = ['HG', 'MG', 'RG', 'PG'];
  const rarities: CardRarity[] = ['Common', 'Rare', 'Super Rare', 'Ultra Rare'];

  const isCardCategory = formData.category === 'pokemon' || formData.category === 'onepiece';

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetMainImage = (index: number) => {
    if (index === 0) {
      setSelectedMainImage(0);
      return;
    }

    setFormData(prev => {
      const nextImages = [...prev.images];
      const [newMainImage] = nextImages.splice(index, 1);
      nextImages.unshift(newMainImage);

      return {
        ...prev,
        images: nextImages,
      };
    });

    setSelectedMainImage(0);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const [uploadedImage] = await uploadProductFiles([file]);
      const newImages = [...formData.images];
      newImages[index] = uploadedImage;
      setFormData(prev => ({ ...prev, images: newImages }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Khong the tai anh len');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    if (selectedMainImage >= newImages.length) {
      setSelectedMainImage(Math.max(0, newImages.length - 1));
    }
  };

  const handleAddImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || formData.images.length >= MAX_PRODUCT_IMAGES) {
      return;
    }

    try {
      const [uploadedImage] = await uploadProductFiles([file]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, uploadedImage]
      }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Khong the tai anh len');
    } finally {
      e.target.value = '';
    }
  };

  const handleSave = () => {
    const updatedProduct: Product = {
      ...product,
      name: formData.name,
      category: formData.category,
      grade: formData.category === 'gundam' ? (formData.grade as GundamGrade) : undefined,
      rarity: isCardCategory ? (formData.rarity as CardRarity) : undefined,
      price: formData.price,
      description: formData.description,
      stock: formData.stock,
      images: formData.images
    };
    onSave(updatedProduct);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-black bg-opacity-50"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-black">Chỉnh sửa sản phẩm</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Danh mục *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange('category', e.target.value);
                      handleInputChange('grade', '');
                      handleInputChange('rarity', '');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary capitalize"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value} className="capitalize">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    {formData.category === 'gundam' ? 'Grade *' : 'Loại thẻ *'}
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary capitalize"
                  >
                    <option value="">Chọn {formData.category === 'gundam' ? 'grade' : 'loại thẻ'}</option>
                    {formData.category === 'gundam' && gundamGrades.map(sub => (
                      <option key={sub} value={sub} className="capitalize">
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rarity - Only for Card Game */}
              {isCardCategory && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Độ hiếm *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {rarities.map(rarity => (
                      <button
                        key={rarity}
                        type="button"
                        onClick={() => handleInputChange('rarity', rarity)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          formData.rarity === rarity
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Hình ảnh (Tối đa 10 ảnh)
                </label>
                
                {/* Main Image Preview */}
                {formData.images.length > 0 && (
                  <div className="mb-4">
                    <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={formData.images[selectedMainImage]}
                        alt="Main preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Ảnh chính
                      </div>
                    </div>
                  </div>
                )}

                {/* Thumbnails */}
                <div className="grid grid-cols-5 gap-3">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative group aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                        selectedMainImage === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleSetMainImage(index)}
                    >
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, index)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ))}

                  {/* Add New Image */}
                  {formData.images.length < MAX_PRODUCT_IMAGES && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary cursor-pointer flex items-center justify-center transition-colors bg-gray-50 hover:bg-gray-100">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-500">Thêm ảnh</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAddImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Click vào ảnh để đặt làm ảnh chính và đưa ảnh đó lên đầu danh sách. Hover để thay đổi hoặc xóa.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Hủy
            </button>
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Xóa sản phẩm
              </button>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};