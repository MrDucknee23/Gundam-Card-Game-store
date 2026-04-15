import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ProductCategory, GundamGrade, CardRarity } from '../data/products';
import { toast } from 'sonner';

export const AddProduct: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '' as ProductCategory | '',
    price: '',
    description: '',
    stock: '',
    grade: '' as GundamGrade | '',
    rarity: '' as CardRarity | '',
    scale: '',
    material: '',
    cardType: ''
  });

  const [mainImage, setMainImage] = useState<string>('');
  const [subImages, setSubImages] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

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
    
    if (subImages.length + files.length > 4) {
      toast.error('Maximum 4 sub-images allowed');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.description || !formData.stock) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!mainImage) {
      toast.error('Please upload a main image');
      return;
    }

    // Mock product creation
    toast.success('Product added successfully!');
    navigate('/admin');
  };

  const handleReset = () => {
    setFormData({
      name: '',
      category: '',
      price: '',
      description: '',
      stock: '',
      grade: '',
      rarity: '',
      scale: '',
      material: '',
      cardType: ''
    });
    setMainImage('');
    setSubImages([]);
  };

  const isCardCategory = formData.category === 'pokemon' || formData.category === 'onepiece';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-black mb-2">Admin Panel - Add Product</h1>
          <p className="text-gray-600">Create a new product listing with complete details and images</p>
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
                    <option value="gundam">Gundam</option>
                    <option value="pokemon">Pokémon</option>
                    <option value="onepiece">One Piece</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="price" className="text-black">Price (VND) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="mt-2 bg-white border-gray-200 text-black focus:border-primary"
                    placeholder="0"
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
                  <Label htmlFor="grade" className="text-black">Grade</Label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="mt-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-black focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="">Select grade</option>
                    <option value="HG">HG - High Grade</option>
                    <option value="MG">MG - Master Grade</option>
                    <option value="RG">RG - Real Grade</option>
                    <option value="PG">PG - Perfect Grade</option>
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
                  <Label className="text-black block mb-3">Rarity Level</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['Common', 'Rare', 'Super Rare', 'Ultra Rare'] as CardRarity[]).map(rarity => (
                      <button
                        key={rarity}
                        type="button"
                        onClick={() => setFormData({ ...formData, rarity })}
                        className={`
                          px-6 py-4 rounded-lg border-2 transition-all duration-200 font-semibold
                          ${formData.rarity === rarity 
                            ? 'border-primary bg-primary text-white scale-105' 
                            : 'border-gray-200 bg-white text-gray-700 hover:border-primary/50 hover:bg-gray-50'
                          }
                        `}
                      >
                        {rarity}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">Select the rarity level for this card</p>
                </div>
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
              <Label className="text-black mb-3 block">Sub Images (Max 4)</Label>
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
                
                {subImages.length < 4 && (
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
              className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              Add Product
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-white hover:bg-gray-100 text-black border-2 border-gray-300 hover:border-gray-400 py-4 rounded-lg font-semibold transition-all"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};