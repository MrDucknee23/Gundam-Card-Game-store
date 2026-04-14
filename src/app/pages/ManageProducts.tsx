import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Pencil, Trash2 } from 'lucide-react';
import { EditProductModal } from '../components/EditProductModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { toast } from 'sonner';

export const ManageProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Lỗi khi fetch sản phẩm:', err);
        setIsLoading(false);
      });
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteFromModal = () => {
    if (selectedProduct) {
      setIsEditModalOpen(false);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedProduct) {
      try {
        const res = await fetch(`http://localhost:5000/api/products/${selectedProduct.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setProducts(products.filter(p => p.id !== selectedProduct.id));
          setIsDeleteModalOpen(false);
          setSelectedProduct(null);
          toast.success('Sản phẩm đã được xóa thành công!');
        } else {
          toast.error('Lỗi khi xóa sản phẩm');
        }
      } catch (err) {
        toast.error('Lỗi kết nối máy chủ');
      }
    }
  };

  const handleSaveEdit = async (updatedProduct: any) => {
    try {
      const res = await fetch(`http://localhost:5000/api/products/${updatedProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(products.map(p => p.id === data.id ? data : p));
        setIsEditModalOpen(false);
        setSelectedProduct(null);
        toast.success('Sản phẩm đã được cập nhật thành công!');
      } else {
        toast.error('Lỗi khi cập nhật sản phẩm');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-black">Quản lý sản phẩm</h1>
          <Link
            to="/admin/add-product"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Thêm sản phẩm mới
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Sản phẩm</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Danh mục</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Grade/Độ hiếm</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Giá</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Tồn kho</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-600">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">Chưa có sản phẩm nào.</td></tr>
                ) : (
                  products.map((product) => (
                  <tr key={product.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images?.[0] || 'https://placehold.co/150x150?text=No+Image'}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-black">{product.name}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 capitalize text-gray-700">
                      {product.category === 'gundam' ? 'Gundam' : product.category === 'pokemon' ? 'Pokémon' : 'One Piece'}
                    </td>
                    <td className="py-4 px-6 text-gray-700">
                      {product.grade || product.rarity || '-'}
                    </td>
                    <td className="py-4 px-6 font-semibold text-black">{formatPrice(product.price)}</td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                          title="Chỉnh sửa"
                        >
                          <Pencil className="w-4 h-4 text-gray-700 group-hover:text-black" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedProduct && (
        <EditProductModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSave={handleSaveEdit}
          onDelete={handleDeleteFromModal}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedProduct && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleConfirmDelete}
          itemName={selectedProduct.name}
          itemType="sản phẩm"
        />
      )}
    </div>
  );
};