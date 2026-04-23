import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { ProductCategory } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Slider } from '../components/ui/slider';
import { Input } from '../components/ui/input';
import { formatPriceNumber } from '../utils/format';
import { toast } from 'sonner';

const getFallbackAttributeGroup = (category: ProductCategory | '') => {
  if (category === 'gundam') {
    return {
      key: 'grade',
      label: 'Cấp độ',
      options: ['HG', 'RG', 'MG', 'PG'].map((option, index) => ({ value: option, label: option, sortOrder: index, isActive: true })),
    };
  }

  if (category === 'pokemon' || category === 'onepiece') {
    return {
      key: 'rarity',
      label: 'Độ hiếm',
      options: ['Common', 'Rare', 'Super Rare', 'Ultra Rare'].map((option, index) => ({ value: option, label: option, sortOrder: index, isActive: true })),
    };
  }

  return undefined;
};

export const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { products, loading, error } = useProducts();
  const { categories } = useCategories();
  const maxAvailablePrice = Math.max(10000000, ...products.map((product) => product.price));

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [selectedAttributeValue, setSelectedAttributeValue] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [minPriceInput, setMinPriceInput] = useState('0');
  const [maxPriceInput, setMaxPriceInput] = useState(formatPriceNumber(10000000));
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const currentSearchQuery = (searchParams.get('search') || '').trim();

  useEffect(() => {
    const category = searchParams.get('category') as ProductCategory;
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  useEffect(() => {
    if (products.length === 0) {
      return;
    }

    setPriceRange([0, maxAvailablePrice]);
    setMinPriceInput('0');
    setMaxPriceInput(formatPriceNumber(maxAvailablePrice));
  }, [products, maxAvailablePrice]);

  const selectedCategoryData = useMemo(
    () => categories.find((category) => category.slug === selectedCategory),
    [categories, selectedCategory]
  );

  const currentAttributeGroup = useMemo(() => {
    const configuredGroup = selectedCategoryData?.attributeGroup?.isActive === false
      ? undefined
      : selectedCategoryData?.attributeGroup;

    return configuredGroup || getFallbackAttributeGroup(selectedCategory);
  }, [selectedCategory, selectedCategoryData]);

  const activeAttributeOptions = currentAttributeGroup?.options?.filter((option) => option.isActive !== false) ?? [];

  const filteredProducts = useMemo(() => products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false;

    if (selectedAttributeValue) {
      const productAttributeValue = product.subCategoryValue || product.grade || product.rarity || '';
      if (productAttributeValue !== selectedAttributeValue) return false;
    }

    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

    if (currentSearchQuery) {
      const query = currentSearchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query) ||
             product.description.toLowerCase().includes(query);
    }

    return true;
  }), [products, selectedCategory, selectedAttributeValue, priceRange, currentSearchQuery]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-lg">Đang tải sản phẩm...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-500 text-lg">{error}</p>
    </div>
  );

  const handleCategoryChange = (category: ProductCategory | '') => {
    setSelectedCategory(category);
    setSelectedAttributeValue('');
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    setMinPriceInput(formatPriceNumber(value[0]));
    setMaxPriceInput(formatPriceNumber(value[1]));
  };

  const parsePriceInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits === '' ? null : Number.parseInt(digits, 10);
  };

  const formatPriceInput = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits === '' ? '' : formatPriceNumber(Number.parseInt(digits, 10));
  };

  const commitMinPriceInput = () => {
    const parsedValue = parsePriceInput(minPriceInput);
    const normalizedMin = Math.min(Math.max(parsedValue ?? 0, 0), maxAvailablePrice);

    if (normalizedMin > priceRange[1]) {
      toast.error('Giá tối thiểu không được lớn hơn giá tối đa');
      setMinPriceInput(formatPriceNumber(priceRange[1]));
      return;
    }

    setPriceRange([normalizedMin, priceRange[1]]);
    setMinPriceInput(formatPriceNumber(normalizedMin));
    setMaxPriceInput(formatPriceNumber(priceRange[1]));
  };

  const commitMaxPriceInput = () => {
    const parsedValue = parsePriceInput(maxPriceInput);
    const nextMax = Math.min(Math.max(parsedValue ?? maxAvailablePrice, 0), maxAvailablePrice);
    const nextMin = Math.min(priceRange[0], nextMax);
    setPriceRange([nextMin, nextMax]);
    setMinPriceInput(formatPriceNumber(nextMin));
    setMaxPriceInput(formatPriceNumber(nextMax));
  };

  const handleMinPriceInputChange = (value: string) => {
    setMinPriceInput(formatPriceInput(value));
  };

  const handleMaxPriceInputChange = (value: string) => {
    setMaxPriceInput(formatPriceInput(value));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Cửa hàng</h1>
          {/* Mobile filter toggle button */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="flex lg:hidden items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 transition-colors"
          >
            {showMobileFilter ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
            {showMobileFilter ? 'Đóng bộ lọc' : 'Bộ lọc'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Filter sidebar - collapsible on mobile */}
          <aside className={`lg:col-span-1 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl p-5 sm:p-6 lg:sticky lg:top-24 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-black border-b border-gray-200 pb-3">Bộ lọc</h2>

              <Collapsible defaultOpen className="mb-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 text-black group hover:text-primary transition-colors">
                  Danh mục
                  <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                      <input type="radio" name="category" checked={selectedCategory === ''} onChange={() => handleCategoryChange('')} className="w-4 h-4 text-primary accent-primary" />
                      <span>Tất cả sản phẩm</span>
                    </label>
                    {categories.map(cat => (
                      <label key={cat.slug} className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                        <input type="radio" name="category" checked={selectedCategory === cat.slug} onChange={() => handleCategoryChange(cat.slug)} className="w-4 h-4 text-primary accent-primary" />
                        <span>{cat.label}</span>
                      </label>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {selectedCategory && currentAttributeGroup && activeAttributeOptions.length > 0 && (
                <Collapsible defaultOpen className="mb-6">
                  <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 text-black group hover:text-primary transition-colors">
                    {currentAttributeGroup.label}
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                        <input
                          type="radio"
                          name="sub-category"
                          checked={selectedAttributeValue === ''}
                          onChange={() => setSelectedAttributeValue('')}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <span>Tất cả {currentAttributeGroup.label.toLowerCase()}</span>
                      </label>
                      {activeAttributeOptions.map((option) => (
                        <label key={option.value} className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                          <input
                            type="radio"
                            name="sub-category"
                            checked={selectedAttributeValue === option.value}
                            onChange={() => setSelectedAttributeValue(option.value)}
                            className="w-4 h-4 text-primary accent-primary"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <Collapsible defaultOpen className="mb-6">
                <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 text-black group hover:text-primary transition-colors">
                  Khoảng giá
                  <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="space-y-4">
                    <Slider min={0} max={maxAvailablePrice} step={100000} value={priceRange} onValueChange={handlePriceRangeChange} className="mb-4" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tối thiểu</label>
                        <Input type="text" value={minPriceInput} onChange={(e) => handleMinPriceInputChange(e.target.value)} onBlur={commitMinPriceInput} className="w-full bg-gray-50 border-gray-300 text-black" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tối đa</label>
                        <Input type="text" value={maxPriceInput} onChange={(e) => handleMaxPriceInputChange(e.target.value)} onBlur={commitMaxPriceInput} className="w-full bg-gray-50 border-gray-300 text-black" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatPriceNumber(priceRange[0])} - {formatPriceNumber(priceRange[1])} VND
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </aside>

          <div className="lg:col-span-3 mt-0 lg:mt-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-gray-600">
                {filteredProducts.length} sản phẩm được tìm thấy
              </p>
              {currentSearchQuery && (
                <p className="text-xs sm:text-sm text-gray-500">
                  Kết quả tìm cho: <span className="font-semibold text-black">{currentSearchQuery}</span>
                </p>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào phù hợp với bộ lọc của bạn.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};