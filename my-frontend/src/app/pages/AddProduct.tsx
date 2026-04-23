import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ImagePlus, Loader2, UploadCloud } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ProductCategory, GundamGrade, CardRarity } from '../types/product';
import { toast } from 'sonner';
import { createProduct, fetchProductById, ProductPayload, updateProduct, uploadProductFiles } from '../utils/productApi';
import { useCategories } from '../hooks/useCategories';
import { resolveProductImageUrl, withImageFallback } from '../utils/imageUrl';

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

const MAX_PRODUCT_IMAGES = 9;
const MAX_SUB_IMAGES = MAX_PRODUCT_IMAGES - 1;
const MAX_IMAGE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_FILE_SIZE_MB = 5;
const ALLOWED_UPLOAD_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
type UploadAreaTarget = 'main' | 'gallery' | null;

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
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [dragTarget, setDragTarget] = useState<UploadAreaTarget>(null);
  const mainImageInputRef = useRef<HTMLInputElement | null>(null);
  const galleryImageInputRef = useRef<HTMLInputElement | null>(null);

  const totalImageCount = (mainImage ? 1 : 0) + subImages.length;
  const canUploadMoreImages = totalImageCount < MAX_PRODUCT_IMAGES;

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

  const validateUploadFiles = (files: File[]) => {
    const acceptedFiles: File[] = [];

    files.forEach((file) => {
      if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.type)) {
        toast.error(`${file.name} khong phai la tep anh hop le`);
        return;
      }

      if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
        toast.error(`${file.name} vuot qua gioi han ${MAX_IMAGE_FILE_SIZE_MB}MB`);
        return;
      }

      acceptedFiles.push(file);
    });

    return acceptedFiles;
  };

  const uploadIncomingFiles = async (files: File[], preferredTarget: Exclude<UploadAreaTarget, null>) => {
    if (files.length === 0) {
      return;
    }

    if (!canUploadMoreImages) {
      toast.error(`Da dat toi da ${MAX_PRODUCT_IMAGES} anh`);
      return;
    }

    const acceptedFiles = validateUploadFiles(files);
    if (acceptedFiles.length === 0) {
      return;
    }

    const availableSlots = MAX_PRODUCT_IMAGES - totalImageCount;
    const filesToUpload = acceptedFiles.slice(0, availableSlots);

    if (acceptedFiles.length > availableSlots) {
      toast.error(`Chi con the tai them ${availableSlots} anh`);
    }

    try {
      setIsUploadingImages(true);
      const uploadedImages = await uploadProductFiles(filesToUpload);

      if (uploadedImages.length === 0) {
        throw new Error('Khong nhan duoc duong dan anh sau khi upload');
      }

      const [nextMainImage, ...nextGalleryImages] = uploadedImages;

      if (preferredTarget === 'main') {
        setMainImage(nextMainImage || mainImage);
        if (nextGalleryImages.length > 0) {
          setSubImages((prev) => [...prev, ...nextGalleryImages]);
        }
      } else if (!mainImage && nextMainImage) {
        setMainImage(nextMainImage);
        if (nextGalleryImages.length > 0) {
          setSubImages((prev) => [...prev, ...nextGalleryImages]);
        }
      } else {
        setSubImages((prev) => [...prev, ...uploadedImages]);
      }

      toast.success(`Da tai len ${uploadedImages.length} anh`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Khong the tai anh len');
    } finally {
      setIsUploadingImages(false);
      setDragTarget(null);
    }
  };

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await uploadIncomingFiles(files, 'main');
    e.target.value = '';
  };

  const handleSubImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    await uploadIncomingFiles(files, 'gallery');
    e.target.value = '';
  };

  const handleDragOver = (target: Exclude<UploadAreaTarget, null>) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canUploadMoreImages || isUploadingImages) {
      return;
    }
    setDragTarget(target);
  };

  const handleDragLeave = (target: Exclude<UploadAreaTarget, null>) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const nextTarget = e.relatedTarget as Node | null;

    if (e.currentTarget.contains(nextTarget)) {
      return;
    }

    if (dragTarget === target) {
      setDragTarget(null);
    }
  };

  const handleDrop = (target: Exclude<UploadAreaTarget, null>) => async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files ?? []);
    await uploadIncomingFiles(files, target);
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

    if (isUploadingImages) {
      toast.error('Dang tai anh len may chu. Vui long doi hoan tat truoc khi luu san pham');
      return;
    }

    const payload = buildPayload();

    try {
      setIsSubmitting(true);

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
    setDragTarget(null);
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
            <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Thông tin sản phẩm</h2>

            <div className="space-y-6">
              <div>
                <Label htmlFor="name" className="text-black">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-black">Danh mục *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="price" className="text-black">Giá (VND) *</Label>
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
                <Label htmlFor="description" className="text-black">Mô tả *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="mt-2 bg-white border-gray-200 text-black focus:border-primary resize-none"
                  placeholder="Nhập mô tả chi tiết sản phẩm"
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
                  <p className="text-sm text-gray-500 mt-1">Sản phẩm nổi bật sẽ được ưu tiên hiển thị ở khu vực sản phẩm nổi bật trên trang chủ.</p>
                </div>
              </div>

              <div>
                <Label htmlFor="stock" className="text-black">Số lượng tồn kho *</Label>
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
                <p className="text-sm text-gray-500 mt-2">Số lượng hiện có trong kho</p>
              </div>
            </div>
          </div>

          {/* Category-Specific Fields - Gundam */}
          {formData.category === 'gundam' && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Thông số Gundam</h2>

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
                  <Label htmlFor="scale" className="text-black">Tỷ lệ</Label>
                  <Input
                    id="scale"
                    name="scale"
                    value={formData.scale}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 1/144"
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  />
                </div>

                <div>
                  <Label htmlFor="material" className="text-black">Chất liệu</Label>
                  <Input
                    id="material"
                    name="material"
                    value={formData.material}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Nhựa"
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category-Specific Fields - Cards */}
          {isCardCategory && (
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Thông số thẻ bài</h2>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="cardType" className="text-black">Loại thẻ</Label>
                  <Input
                    id="cardType"
                    name="cardType"
                    value={formData.cardType}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Pokemon, Trainer, Leader, Character"
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                  />
                </div>

                <div>
                  <Label className="text-black block mb-3">{currentAttributeGroup?.label || 'Cấp độ độ hiếm'}</Label>
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
            <h2 className="text-black mb-6 border-b border-gray-200 pb-3">Hình ảnh sản phẩm</h2>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">Đã tải lên {totalImageCount}/{MAX_PRODUCT_IMAGES} ảnh</p>
                <p className="text-sm text-gray-500">Kéo thả hoặc bấm để tải ảnh. Hệ thống sẽ tự động tải lên ngay sau khi chọn.</p>
              </div>
              {isUploadingImages && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-medium text-primary shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang tải lên...
                </div>
              )}
            </div>

            {/* Main Image Upload */}
            <div className="mb-8">
              <Label className="text-black mb-3 block">Ảnh chính *</Label>
              <div className="mt-2">
                {mainImage ? (
                  <div
                    className={`relative w-full max-w-md aspect-square overflow-hidden rounded-2xl border-2 bg-gray-100 transition-all ${dragTarget === 'main' ? 'border-primary ring-4 ring-primary/15' : 'border-gray-200'}`}
                    onDragOver={handleDragOver('main')}
                    onDragLeave={handleDragLeave('main')}
                    onDrop={handleDrop('main')}
                  >
                    <img
                      src={resolveProductImageUrl(mainImage)}
                      alt="Main preview"
                      onError={withImageFallback}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-0 transition-opacity hover:opacity-100">
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4">
                        <div>
                          <p className="text-sm font-semibold text-white">Ảnh chính</p>
                          <p className="text-xs text-white/80">Kéo ảnh mới vào đây hoặc bấm để thay đổi</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => mainImageInputRef.current?.click()}
                            disabled={isUploadingImages}
                            className="rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Thay ảnh
                          </button>
                          <button
                            type="button"
                            onClick={() => setMainImage('')}
                            disabled={isUploadingImages}
                            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => !isUploadingImages && mainImageInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isUploadingImages) {
                        e.preventDefault();
                        mainImageInputRef.current?.click();
                      }
                    }}
                    onDragOver={handleDragOver('main')}
                    onDragLeave={handleDragLeave('main')}
                    onDrop={handleDrop('main')}
                    className={`flex w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-8 py-10 text-center transition-all ${dragTarget === 'main' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-300 bg-gray-50 hover:border-primary/60 hover:bg-primary/5'} ${isUploadingImages ? 'pointer-events-none opacity-70' : ''}`}
                  >
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {isUploadingImages ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
                    </div>
                    <p className="mb-2 text-base font-semibold text-gray-900">Kéo thả ảnh chính vào đây</p>
                    <p className="mb-5 text-sm text-gray-500">Hoặc bấm để tải lên. Hỗ trợ JPG, PNG, WEBP tối đa {MAX_IMAGE_FILE_SIZE_MB}MB.</p>
                    <button
                      type="button"
                      disabled={isUploadingImages}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUploadingImages ? 'Đang tải lên...' : 'Chọn ảnh'}
                    </button>
                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sub Images Upload */}
            <div>
              <Label className="text-black mb-3 block">Ảnh thư viện (tối đa {MAX_SUB_IMAGES})</Label>
              <p className="text-sm text-gray-500 mb-3">Bấm vào ảnh thu nhỏ để đổi vị trí với ảnh chính.</p>
              <p className="text-sm text-gray-500 mb-4">Bạn có thể kéo thả nhiều ảnh để hệ thống tự tải lên ngay. Chức năng tải lên sẽ bị khóa sau khi đạt {MAX_PRODUCT_IMAGES} ảnh.</p>

              <div
                role="button"
                tabIndex={0}
                onClick={() => canUploadMoreImages && !isUploadingImages && galleryImageInputRef.current?.click()}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && canUploadMoreImages && !isUploadingImages) {
                    e.preventDefault();
                    galleryImageInputRef.current?.click();
                  }
                }}
                onDragOver={handleDragOver('gallery')}
                onDragLeave={handleDragLeave('gallery')}
                onDrop={handleDrop('gallery')}
                className={`mb-4 rounded-2xl border-2 border-dashed px-5 py-6 transition-all ${dragTarget === 'gallery' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-gray-300 bg-gray-50 hover:border-primary/60 hover:bg-primary/5'} ${!canUploadMoreImages || isUploadingImages ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex flex-col items-center justify-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {isUploadingImages && dragTarget === 'gallery' ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Kéo ảnh thư viện vào đây hoặc bấm để chọn</p>
                      <p className="text-sm text-gray-500">Chỉ chấp nhận JPG, PNG, WEBP. Mỗi ảnh tối đa {MAX_IMAGE_FILE_SIZE_MB}MB.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!canUploadMoreImages || isUploadingImages}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {canUploadMoreImages ? 'Tải ảnh lên' : 'Đã đạt giới hạn ảnh'}
                  </button>
                </div>
                <input
                  ref={galleryImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleSubImageUpload}
                  className="hidden"
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {subImages.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-100 group transition-all hover:-translate-y-0.5 hover:shadow-md">
                    <img
                      src={resolveProductImageUrl(image)}
                      alt={`Sub preview ${index + 1}`}
                      onError={withImageFallback}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => selectSubImage(image)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3">
                        <button
                          type="button"
                          onClick={() => selectSubImage(image)}
                          className="rounded-lg bg-white/95 px-3 py-2 text-xs font-semibold text-gray-900 transition hover:bg-white"
                        >
                          Đặt làm ảnh chính
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSubImage(index)}
                          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploadingImages}
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              {isUploadingImages ? 'Đang tải ảnh...' : isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting || isUploadingImages}
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