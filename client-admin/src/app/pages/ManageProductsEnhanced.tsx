import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { products as initialProducts, type Product, type ProductCategory } from '../data/products';
import { Pencil, Trash2, Eye, Search, Filter, ChevronLeft, ChevronRight, Plus, Copy } from 'lucide-react';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Breadcrumb } from '../components/Breadcrumb';
import { toast } from 'sonner';

type ProductStatus = 'active' | 'out_of_stock' | 'draft';
type SortField = 'name' | 'price' | 'stock';
type SortOrder = 'asc' | 'desc';

export const ManageProductsEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  
  const itemsPerPage = 10;

  // Get product status
  const getProductStatus = (product: Product): ProductStatus => {
    if (product.stock === 0) return 'out_of_stock';
    if (product.stock > 0) return 'active';
    return 'draft';
  };

  // Filter, search, and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        searchQuery === '' ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      const productStatus = getProductStatus(product);
      const matchesStatus = statusFilter === 'all' || productStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchQuery, categoryFilter, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const paginatedProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getCategoryLabel = (category: ProductCategory) => {
    const labels: Record<ProductCategory, string> = {
      gundam: 'Gundam',
      pokemon: 'Pokémon',
      onepiece: 'One Piece'
    };
    return labels[category];
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      toast.success('Sản phẩm đã được xóa thành công!');
    }
  };

  const handleDuplicate = (product: Product) => {
    const newProduct = {
      ...product,
      id: `${product.id}-copy-${Date.now()}`,
      name: `${product.name} (Copy)`
    };
    setProducts([newProduct, ...products]);
    toast.success('Sản phẩm đã được sao chép!');
  };

  const handleToggleSelect = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === paginatedProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(paginatedProducts.map(p => p.id)));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Sản phẩm' }
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý sản phẩm</h1>
            <p className="text-gray-600">Quản lý toàn bộ sản phẩm trong cửa hàng</p>
          </div>
          <Link
            to="/admin/add-product"
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Thêm sản phẩm mới
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tên sản phẩm, ID, mô tả..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value as ProductCategory | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="gundam">Gundam</option>
                <option value="pokemon">Pokémon</option>
                <option value="onepiece">One Piece</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ProductStatus | 'all');
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang bán</option>
                <option value="out_of_stock">Hết hàng</option>
                <option value="draft">Nháp</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {paginatedProducts.length} trong tổng số {filteredAndSortedProducts.length} sản phẩm
            </div>
            {selectedProducts.size > 0 && (
              <div className="text-sm font-medium text-blue-600">
                Đã chọn {selectedProducts.size} sản phẩm
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === paginatedProducts.length && paginatedProducts.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Hình ảnh
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-1">
                      Sản phẩm
                      {sortField === 'name' && (
                        <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Danh mục
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1">
                      Giá
                      {sortField === 'price' && (
                        <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('stock')}
                  >
                    <div className="flex items-center gap-1">
                      Tồn kho
                      {sortField === 'stock' && (
                        <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <div className="text-gray-400">
                        <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg font-medium">Không tìm thấy sản phẩm</p>
                        <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const status = getProductStatus(product);
                    
                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleToggleSelect(product.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/admin/products/${product.id}`)}
                            className="text-left hover:text-blue-600 transition-colors"
                          >
                            <div className="font-semibold text-gray-900 hover:underline">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                              {product.description}
                            </div>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 font-mono">{product.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">
                            {getCategoryLabel(product.category)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-semibold ${
                              product.stock > 10
                                ? 'text-green-600'
                                : product.stock > 0
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/admin/products/${product.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(product)}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Sao chép"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAndSortedProducts.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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

// Status Badge Component
interface StatusBadgeProps {
  status: ProductStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLabel = () => {
    const labels: Record<ProductStatus, string> = {
      active: 'Đang bán',
      out_of_stock: 'Hết hàng',
      draft: 'Nháp'
    };
    return labels[status];
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}
    >
      {getLabel()}
    </span>
  );
};
