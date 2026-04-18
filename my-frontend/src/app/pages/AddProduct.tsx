import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ProductCategory, GundamGrade, CardRarity } from '../types/product';
import { toast } from 'sonner';
import { createProduct, fetchProductById, ProductPayload, updateProduct } from '../utils/productApi';
import { useCategories } from '../hooks/useCategories';

const emptyFormData = {
  name: '',
  category: '' as ProductCategory | '',
  price: '',
  description: '',
  stock: '',
  grade: '' as GundamGrade | '',
  rarity: '' as CardRarity | '',
  subCategoryValue: '',
  scale: '',
  material: '',
  cardType: '',
  featured: false
};

const formatVietnamesePrice = (value: string) => {
  const digitsOnly = value.replace(/\D/g, '');

  if (digitsOnly === '') {
    return '';
  }

  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const isValidVietnamesePrice = (value: string) => {
  if (value === '') {
    return false;
  }

  return /^\d{1,3}(\.\d{3})*$|^\d+$/.test(value);
};

const normalizeVietnamesePrice = (value: string) => value.replace(/\./g, '');

const MAX_PRODUCT_IMAGES = 10;
const MAX_SUB_IMAGES = MAX_PRODUCT_IMAGES - 1;

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const { categories } = useCategories();

  const [formData, setFormData] = useState(emptyFormData);

  const [mainImage, setMainImage] = useState<string>('');
  const [subImages, setSubImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditMode);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((currentData) => {
      if (name === 'category') {
        return {
          ...currentData,
          category: value as ProductCategory | '',
          grade: '',
          rarity: '',
          subCategoryValue: '',
          scale: '',
          material: '',
          cardType: '',
          featured: currentData.featured
        };
      }

      return {
        ...currentData,
        [name]: value
      };
    });
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;

    if (/[^\d.]/.test(rawValue) || rawValue.includes('-')) {
      return;
    }

    setFormData((currentData) => ({
      ...currentData,
      price: formatVietnamesePrice(rawValue)
    }));
  };

  const handlePriceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (['-', '+', ',', 'e', 'E', ' '].includes(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    if (!isEditMode || !id) {
      setIsLoadingProduct(false);
      return;
    }

    const loadProduct = async () => {
      try {
        setIsLoadingProduct(true);
        const product = await fetchProductById(id);

        setFormData({
          name: product.name,
          category: product.category,
          price: formatVietnamesePrice(String(product.price)),
          description: product.description,
          stock: String(product.stock),
          grade: (product.grade as GundamGrade | undefined) || '',
          rarity: (product.rarity as CardRarity | undefined) || '',
          subCategoryValue: product.subCategoryValue || product.grade || product.rarity || '',
          scale: product.scale || '',
          material: product.material || '',
          cardType: product.cardType || '',
          featured: Boolean(product.featured)
        });

        const [primaryImage, ...secondaryImages] = product.images;
        setMainImage(primaryImage || '');
        setSubImages(secondaryImages);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
        navigate('/admin/products');
      } finally {
        setIsLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, isEditMode, navigate]);

  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []) as File[];
    
    if (subImages.length + files.length > MAX_SUB_IMAGES) {
      toast.error(`Toi da ${MAX_SUB_IMAGES} anh phu duoc phep`);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSubImage = (index: number) => {
    setSubImages(prev => prev.filter((_, i) => i !== index));
  };

  const selectSubImage = (image: string) => {
    const currentMain = mainImage;
    const imageIndex = subImages.indexOf(image);
    
    setMainImage(image);
    setSubImages(prev => prev.map((img, i) => i === imageIndex ? currentMain : img));
  };

  const isCardCategory = formData.category === 'pokemon' || formData.category === 'onepiece';
  const selectedCategoryData = categories.find((category) => category.slug === formData.category);
  const fallbackAttributeGroup = formData.category === 'gundam'
    ? {
        key: 'grade',
        label: 'Cấp độ',
        options: ['HG', 'RG', 'MG', 'PG'].map((option, index) => ({ value: option, label: option, sortOrder: index, isActive: true })),
      }
    : isCardCategory
      ? {
          key: 'rarity',
          label: 'Độ hiếm',
          options: ['Common', 'Rare', 'Super Rare', 'Ultra Rare'].map((option, index) => ({ value: option, label: option, sortOrder: index, isActive: true })),
        }
      : undefined;

  const currentAttributeGroup = (selectedCategoryData?.attributeGroup?.isActive === false
    ? undefined
    : selectedCategoryData?.attributeGroup) || fallbackAttributeGroup;

  const activeAttributeOptions = currentAttributeGroup?.options?.filter((option) => option.isActive !== false) ?? [];
  const selectedAttributeValue = formData.subCategoryValue
    || (currentAttributeGroup?.key === 'grade' ? formData.grade : '')
    || (currentAttributeGroup?.key === 'rarity' ? formData.rarity : '');

  const handleAttributeValueChange = (value: string) => {
    setFormData((currentData) => ({
      ...currentData,
      subCategoryValue: value,
      grade: currentAttributeGroup?.key === 'grade' ? (value as GundamGrade | '') : '',
      rarity: currentAttributeGroup?.key === 'rarity' ? (value as CardRarity | '') : '',
    }));
  };

  const buildPayload = (): ProductPayload => {
    const images = [mainImage, ...subImages].filter((image) => image.trim() !== '');
    const attributeValue = selectedAttributeValue || undefined;

    return {
      name: formData.name.trim(),
      category: formData.category as ProductCategory,
      price: Number(normalizeVietnamesePrice(formData.price)),
      description: formData.description.trim(),
      stock: Number(formData.stock),
      images,
      grade: currentAttributeGroup?.key === 'grade' ? attributeValue : undefined,
      subCategoryKey: currentAttributeGroup?.key || undefined,
      subCategoryValue: attributeValue,
      scale: formData.category === 'gundam' ? formData.scale.trim() || undefined : undefined,
      material: formData.category === 'gundam' ? formData.material.trim() || undefined : undefined,
      rarity: currentAttributeGroup?.key === 'rarity' ? attributeValue : undefined,
      cardType: isCardCategory ? formData.cardType.trim() || undefined : undefined,
      featured: formData.featured,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const normalizedPrice = normalizeVietnamesePrice(formData.price);
    const parsedStock = Number(formData.stock);

    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.description || !formData.stock) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }

    if (!isValidVietnamesePrice(formData.price) || normalizedPrice === '' || formData.price.includes('-')) {
      toast.error('Giá phải đúng định dạng tiền Việt, ví dụ: 23.500 hoặc 1.000.000');
      return;
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      toast.error('Tồn kho phải là số nguyên không âm');
      return;
    }

    if (!mainImage) {
      toast.error('Vui lòng tải lên ảnh chính của sản phẩm');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = buildPayload();

      if (isEditMode && id) {
        await updateProduct(id, payload);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await createProduct(payload);
        toast.success('Thêm sản phẩm thành công');
      }

      navigate('/admin/products');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể lưu sản phẩm');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(emptyFormData);
    setMainImage('');
    setSubImages([]);
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-black mb-2">{isEditMode ? 'Admin Panel - Chỉnh sửa sản phẩm' : 'Admin Panel - Thêm sản phẩm'}</h1>
          <p className="text-gray-600">
            {isEditMode ? 'Cập nhật thông tin sản phẩm và đồng bộ dữ liệu lên toàn bộ hệ thống' : 'Tạo sản phẩm mới và đồng bộ dữ liệu lên toàn bộ hệ thống'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Product Information</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-black">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-black">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="price" className="text-black">Price (VND) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="text"
                    value={formData.price}
                    onChange={handlePriceChange}
                    onKeyDown={handlePriceKeyDown}
                    inputMode="numeric"
                    autoComplete="off"
                    required
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                    placeholder="1.000.000"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-black">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-2 bg-white border-gray-200 text-black focus:border-primary resize-none"
                  placeholder="Detailed product description"
                />
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <Checkbox
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => {
                    setFormData((currentData) => ({
                      ...currentData,
                      featured: checked === true
                    }));
                  }}
                  className="mt-0.5"
                />
                <div>
                  <Label htmlFor="featured" className="text-black cursor-pointer">Đánh dấu là sản phẩm nổi bật</Label>
                  <p className="text-sm text-gray-500 mt-1">Sản phẩm nổi bật sẽ được ưu tiên hiển thị ở khu vực featured trên trang chủ.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="stock" className="text-black">Stock Quantity *</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-2">Current available stock in inventory</p>
              </div>
            </div>
          </div>

          {/* Category-Specific Fields - Gundam */}
          {formData.category === 'gundam' && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Gundam Specifications</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="grade" className="text-black">{currentAttributeGroup?.label || 'Grade'}</Label>
                  <select
                    id="grade"
                    value={selectedAttributeValue}
                    onChange={(e) => handleAttributeValueChange(e.target.value)}
                    className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Chọn {currentAttributeGroup?.label?.toLowerCase() || 'grade'}</option>
                    {activeAttributeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="scale" className="text-black">Scale</Label>
                  <Input
                    id="scale"
                    name="scale"
                    value={formData.scale}
                    onChange={handleInputChange}
                    placeholder="e.g., 1/144"
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="material" className="text-black">Material</Label>
                  <Input
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="e.g., Plastic"
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category-Specific Fields - Cards */}
          {isCardCategory && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Card Specifications</h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="cardType" className="text-black">Card Type</Label>
                  <Input
                    id="cardType"
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleInputChange}
                    placeholder="e.g., Pokemon, Trainer, Leader, Character"
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  />
                </div>

                <div>
                  <Label className="text-black block mb-3">{currentAttributeGroup?.label || 'Rarity Level'}</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {activeAttributeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleAttributeValueChange(option.value)}
                        className={`
                          px-6 py-4 rounded-lg border-2 transition-all duration-200 font-semibold
                          ${selectedAttributeValue === option.value
                            ? 'border-primary bg-primary text-white scale-105'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Chọn giá trị phù hợp cho sản phẩm thẻ bài này</p>
                </div>
              </div>
            </div>
          )}

          {formData.category && currentAttributeGroup && formData.category !== 'gundam' && !isCardCategory && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Thuộc tính danh mục</h2>

              <div>
                <Label htmlFor="subCategoryValue" className="text-black">{currentAttributeGroup.label}</Label>
                <select
                  id="subCategoryValue"
                  value={selectedAttributeValue}
                  onChange={(e) => handleAttributeValueChange(e.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Chọn {currentAttributeGroup.label.toLowerCase()}</option>
                  {activeAttributeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Product Images</h2>

            {/* Main Image Upload */}
            <div className="mb-8">
              <Label className="text-black mb-3 block">Main Image *</Label>
              <div className="mt-2">
                {mainImage ? (
                  <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={mainImage}
                      alt="Main preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors group">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => setMainImage('')}
                          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold"
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md aspect-square border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary transition-colors bg-gray-50">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-3xl text-primary">↑</span>
                      </div>
                      <p className="text-black font-semibold mb-2">Click to upload main image</p>
                      <p className="text-gray-500 text-sm">PNG, JPG or WEBP (Max 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Sub Images Upload */}
            <div>
              <Label className="text-black mb-3 block">Sub Images (Max 9)</Label>
              <p className="text-sm text-gray-500 mb-3">Click on a thumbnail to swap it with the main image</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subImages.map((image, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 group">
                    <img
                      src={image}
                      alt={`Sub preview ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => selectSubImage(image)}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removeSubImage(index)}
                        className="opacity-0 group-hover:opacity-100 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                
                {subImages.length < MAX_SUB_IMAGES && (
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors bg-gray-50">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 mx-auto mb-2 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-primary">+</span>
                      </div>
                      <p className="text-gray-600 text-sm">Upload</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSubImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex-1 bg-white hover:bg-gray-100 text-black border-2 border-gray-300 hover:border-gray-400 py-4 rounded-lg font-semibold transition-all"
            >
              Đặt lại biểu mẫu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};