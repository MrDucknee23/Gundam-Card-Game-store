import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { ChevronDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import type { ProductCategory, GundamGrade, CardRarity } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../components/ui/collapsible';
import { Slider } from '../components/ui/slider';
import { Input } from '../components/ui/input';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, loading, error } = useProducts(); // ← thêm dòng này

  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | ''>('');
  const [selectedGrade, setSelectedGrade] = useState<GundamGrade | ''>('');
  const [selectedRarity, setSelectedRarity] = useState<CardRarity | ''>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [minPriceInput, setMinPriceInput] = useState('0');
  const [maxPriceInput, setMaxPriceInput] = useState('10000000');

  useEffect(() => {
    const category = searchParams.get('category') as ProductCategory;
    if (category) {
      setSelectedCategory(category);
    }
  }, [searchParams]);

  // ← thêm loading/error state
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
    setSelectedGrade('');
    setSelectedRarity('');
  };

  const handlePriceRangeChange = (value: number[]) => {
    const newRange: [number, number] = [value[0], value[1]];
    setPriceRange(newRange);
    setMinPriceInput(value[0].toString());
    setMaxPriceInput(value[1].toString());
  };

  const handleMinPriceInputChange = (value: string) => {
    setMinPriceInput(value);
    const numValue = parseInt(value) || 0;
    if (numValue <= priceRange[1]) {
      setPriceRange([numValue, priceRange[1]]);
    }
  };

  const handleMaxPriceInputChange = (value: string) => {
    setMaxPriceInput(value);
    const numValue = parseInt(value) || 10000000;
    if (numValue >= priceRange[0]) {
      setPriceRange([priceRange[0], numValue]);
    }
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category !== selectedCategory) return false;
    if (selectedGrade && product.grade !== selectedGrade) return false;
    if (selectedRarity && product.rarity !== selectedRarity) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return product.name.toLowerCase().includes(query) ||
             product.description.toLowerCase().includes(query);
    }
    return true;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black mb-8">Cửa hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24 border border-gray-200 shadow-sm">
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
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                      <input type="radio" name="category" checked={selectedCategory === 'gundam'} onChange={() => handleCategoryChange('gundam')} className="w-4 h-4 text-primary accent-primary" />
                      <span>Gundam</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                      <input type="radio" name="category" checked={selectedCategory === 'pokemon'} onChange={() => handleCategoryChange('pokemon')} className="w-4 h-4 text-primary accent-primary" />
                      <span>Pokémon</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                      <input type="radio" name="category" checked={selectedCategory === 'onepiece'} onChange={() => handleCategoryChange('onepiece')} className="w-4 h-4 text-primary accent-primary" />
                      <span>One Piece</span>
                    </label>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {selectedCategory === 'gundam' && (
                <Collapsible defaultOpen className="mb-6">
                  <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 text-black group hover:text-primary transition-colors">
                    Cấp độ
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                        <input type="radio" name="grade" checked={selectedGrade === ''} onChange={() => setSelectedGrade('')} className="w-4 h-4 text-primary accent-primary" />
                        <span>Tất cả cấp độ</span>
                      </label>
                      {(['HG', 'MG', 'RG', 'PG'] as GundamGrade[]).map(grade => (
                        <label key={grade} className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                          <input type="radio" name="grade" checked={selectedGrade === grade} onChange={() => setSelectedGrade(grade)} className="w-4 h-4 text-primary accent-primary" />
                          <span>{grade}</span>
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {(selectedCategory === 'pokemon' || selectedCategory === 'onepiece') && (
                <Collapsible defaultOpen className="mb-6">
                  <CollapsibleTrigger className="flex items-center justify-between w-full font-semibold mb-3 text-black group hover:text-primary transition-colors">
                    Độ hiếm
                    <ChevronDown className="w-5 h-5 text-primary transition-transform duration-300 group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                        <input type="radio" name="rarity" checked={selectedRarity === ''} onChange={() => setSelectedRarity('')} className="w-4 h-4 text-primary accent-primary" />
                        <span>Tất cả độ hiếm</span>
                      </label>
                      {(['Common', 'Rare', 'Super Rare', 'Ultra Rare'] as CardRarity[]).map(rarity => (
                        <label key={rarity} className="flex items-center space-x-2 cursor-pointer text-gray-600 hover:text-black transition-colors">
                          <input type="radio" name="rarity" checked={selectedRarity === rarity} onChange={() => setSelectedRarity(rarity)} className="w-4 h-4 text-primary accent-primary" />
                          <span>{rarity}</span>
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
                    <Slider min={0} max={10000000} step={100000} value={priceRange} onValueChange={handlePriceRangeChange} className="mb-4" />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tối thiểu</label>
                        <Input type="number" value={minPriceInput} onChange={(e) => handleMinPriceInputChange(e.target.value)} className="w-full bg-gray-50 border-gray-300 text-black" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Tối đa</label>
                        <Input type="number" value={maxPriceInput} onChange={(e) => handleMaxPriceInputChange(e.target.value)} className="w-full bg-gray-50 border-gray-300 text-black" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])} VND
                    </p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {filteredProducts.length} sản phẩm được tìm thấy
              </p>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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