import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { getInboundStatusLabel } from '../data/inbounds';
import type { Inbound, InboundStatus, PaymentStatus } from '../data/inbounds';
import { Search, Filter, Plus, Eye, Package, X } from 'lucide-react';
import { formatCurrency } from '../utils/format';
import { addInbound, getInboundList } from '../utils/inboundStorage';
import { toast } from 'sonner';

type InboundProductDraft = {
  productName: string;
  category: 'Gundam' | 'Pokémon' | 'One Piece';
  sku: string;
  quantityOrdered: number;
  unitCost: number;
  grade: string;
  rarity: string;
  productImage: string;
};

type CreateInboundForm = {
  supplierName: string;
  supplierContact: string;
  supplierAddress: string;
  supplierPhone: string;
  supplierEmail: string;
  warehouse: string;
  staffInCharge: string;
  importDate: string;
  status: InboundStatus;
  paymentStatus: PaymentStatus;
  taxRate: number;
  notes: string;
  products: InboundProductDraft[];
};

const createDefaultProductDraft = (): InboundProductDraft => ({
  productName: '',
  category: 'Gundam',
  sku: '',
  quantityOrdered: 1,
  unitCost: 0,
  grade: '',
  rarity: '',
  productImage: '',
});

const createDefaultForm = (): CreateInboundForm => ({
  supplierName: '',
  supplierContact: '',
  supplierAddress: '',
  supplierPhone: '',
  supplierEmail: '',
  warehouse: 'Kho Trung tam - Quan 1',
  staffInCharge: '',
  importDate: new Date().toISOString().slice(0, 16),
  status: 'pending',
  paymentStatus: 'unpaid',
  taxRate: 10,
  notes: '',
  products: [createDefaultProductDraft()],
});

const nextInboundNumber = (items: Inbound[]) => {
  const year = new Date().getFullYear();
  const maxSequence = items.reduce((max, item) => {
    const match = item.inboundNumber.match(new RegExp(`^INB-${year}-(\\d+)$`));
    if (!match) {
      return max;
    }
    return Math.max(max, Number(match[1]));
  }, 0);

  return `INB-${year}-${String(maxSequence + 1).padStart(3, '0')}`;
};

export const InventoryInbound: React.FC = () => {
  const navigate = useNavigate();
  const [inboundList, setInboundList] = useState<Inbound[]>(() => getInboundList());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InboundStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInboundForm>(() => createDefaultForm());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: InboundStatus) => {
    const colors: Record<InboundStatus, string> = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      received: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status];
  };

  // Filter inbounds
  const filteredInbounds = useMemo(() => {
    return inboundList.filter((inbound) => {
      const matchesSearch =
        searchQuery === '' ||
        inbound.inboundNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inbound.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || inbound.status === statusFilter;

      const matchesDateRange = (() => {
        if (!dateFrom && !dateTo) return true;
        const inboundDate = new Date(inbound.importDate);
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        if (fromDate && toDate) {
          return inboundDate >= fromDate && inboundDate <= toDate;
        } else if (fromDate) {
          return inboundDate >= fromDate;
        } else if (toDate) {
          return inboundDate <= toDate;
        }
        return true;
      })();

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [inboundList, searchQuery, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = inboundList.length;
    const received = inboundList.filter((i) => i.status === 'received').length;
    const pending = inboundList.filter((i) => i.status === 'pending').length;
    const totalValue = inboundList
      .filter((i) => i.status === 'received')
      .reduce((sum, i) => sum + i.totalValue, 0);

    return { total, received, pending, totalValue };
  }, [inboundList]);

  const draftSubtotal = useMemo(() => {
    return createForm.products.reduce((sum, product) => {
      return sum + product.quantityOrdered * product.unitCost;
    }, 0);
  }, [createForm.products]);

  const draftTaxAmount = useMemo(() => {
    return Math.round((draftSubtotal * createForm.taxRate) / 100);
  }, [createForm.taxRate, draftSubtotal]);

  const openCreateModal = () => {
    setCreateForm(createDefaultForm());
    setIsCreateOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
  };

  const updateProductDraft = (
    index: number,
    key: keyof InboundProductDraft,
    value: string | number
  ) => {
    setCreateForm((current) => ({
      ...current,
      products: current.products.map((product, productIndex) =>
        productIndex === index ? { ...product, [key]: value } : product
      ),
    }));
  };

  const handleCreateInbound = () => {
    const hasCoreInfo =
      createForm.supplierName.trim() &&
      createForm.supplierContact.trim() &&
      createForm.supplierPhone.trim() &&
      createForm.supplierEmail.trim() &&
      createForm.staffInCharge.trim();

    if (!hasCoreInfo) {
      toast.error('Vui long nhap day du thong tin nha cung cap va nhan vien phu trach');
      return;
    }

    const validProducts = createForm.products.filter(
      (product) => product.productName.trim() && product.sku.trim() && product.quantityOrdered > 0 && product.unitCost > 0
    );

    if (validProducts.length === 0) {
      toast.error('Can it nhat 1 dong san pham hop le');
      return;
    }

    const nowIso = new Date().toISOString();
    const totalItems = validProducts.reduce((sum, product) => sum + product.quantityOrdered, 0);
    const totalValue = validProducts.reduce(
      (sum, product) => sum + product.quantityOrdered * product.unitCost,
      0
    );
    const taxAmount = Math.round((totalValue * createForm.taxRate) / 100);

    const inbound: Inbound = {
      id: `inb-${Date.now()}`,
      inboundNumber: nextInboundNumber(inboundList),
      supplierName: createForm.supplierName.trim(),
      supplierContact: createForm.supplierContact.trim(),
      supplierAddress: createForm.supplierAddress.trim(),
      supplierPhone: createForm.supplierPhone.trim(),
      supplierEmail: createForm.supplierEmail.trim(),
      importDate: new Date(createForm.importDate).toISOString(),
      receivedDate: createForm.status === 'received' ? nowIso : undefined,
      warehouse: createForm.warehouse,
      staffInCharge: createForm.staffInCharge.trim(),
      totalItems,
      totalValue,
      status: createForm.status,
      paymentStatus: createForm.paymentStatus,
      taxRate: createForm.taxRate,
      taxAmount,
      notes: createForm.notes.trim(),
      products: validProducts.map((product, index) => ({
        productId: `inbprd-${Date.now()}-${index + 1}`,
        productName: product.productName.trim(),
        productImage: product.productImage.trim() || 'https://placehold.co/120x120?text=No+Image',
        category: product.category,
        grade: product.category === 'Gundam' ? product.grade.trim() || undefined : undefined,
        rarity: product.category !== 'Gundam' ? product.rarity.trim() || undefined : undefined,
        sku: product.sku.trim(),
        quantityOrdered: product.quantityOrdered,
        quantityReceived: createForm.status === 'received' ? product.quantityOrdered : 0,
        unitCost: product.unitCost,
        totalAmount: product.quantityOrdered * product.unitCost,
      })),
      timeline: {
        created: nowIso,
        shipped: createForm.status !== 'draft' ? nowIso : undefined,
        qualityCheck: createForm.status === 'received' ? nowIso : undefined,
        stocked: createForm.status === 'received' ? nowIso : undefined,
      },
    };

    const nextList = addInbound(inbound);
    setInboundList(nextList);
    setIsCreateOpen(false);
    toast.success('Da tao don nhap hang moi');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý nhập hàng</h1>
              <p className="text-gray-600 mt-1">Quản lý và theo dõi các đơn nhập hàng từ nhà cung cấp</p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Tạo đơn nhập hàng mới
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng đơn nhập</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đã nhận hàng</p>
                  <p className="text-2xl font-bold text-green-600">{stats.received}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đang chờ</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <Package className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng giá trị</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <Package className="w-6 h-6 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Bộ lọc tìm kiếm</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã đơn hoặc nhà cung cấp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as InboundStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="pending">Đang chờ</option>
              <option value="received">Đã nhận</option>
              <option value="cancelled">Đã hủy</option>
            </select>

            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Từ ngày"
            />

            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              placeholder="Đến ngày"
            />
          </div>

          {/* Clear Filters */}
          {(searchQuery || statusFilter !== 'all' || dateFrom || dateTo) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
              className="mt-4 text-sm text-primary hover:text-primary/80 font-medium"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mã đơn nhập
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nhà cung cấp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ngày nhập
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Số lượng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tổng giá trị
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
                {filteredInbounds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Không tìm thấy đơn nhập hàng
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Không có đơn nhập hàng nào phù hợp với bộ lọc của bạn
                        </p>
                        <button
                          onClick={openCreateModal}
                          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Tạo đơn nhập hàng mới
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredInbounds.map((inbound) => (
                    <tr
                      key={inbound.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/inventory/inbound/${inbound.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/inventory/inbound/${inbound.id}`);
                          }}
                        >
                          {inbound.inboundNumber}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{inbound.supplierName}</div>
                        <div className="text-xs text-gray-500">{inbound.supplierContact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(inbound.importDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {inbound.totalItems} sản phẩm
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(inbound.totalValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            inbound.status
                          )}`}
                        >
                          {getInboundStatusLabel(inbound.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/inventory/inbound/${inbound.id}`);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          {filteredInbounds.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Hiển thị <span className="font-semibold">{filteredInbounds.length}</span> trong tổng số{' '}
                <span className="font-semibold">{inboundList.length}</span> đơn nhập hàng
              </p>
            </div>
          )}
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className="w-full max-w-6xl rounded-xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Tao don nhap hang moi</h2>
                <p className="text-sm text-gray-600 mt-1">Nhap thong tin nha cung cap, san pham, so luong va chi phi.</p>
              </div>
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Dong"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  value={createForm.supplierName}
                  onChange={(e) => setCreateForm((c) => ({ ...c, supplierName: e.target.value }))}
                  placeholder="Ten nha cung cap"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <input
                  value={createForm.supplierContact}
                  onChange={(e) => setCreateForm((c) => ({ ...c, supplierContact: e.target.value }))}
                  placeholder="Nguoi lien he"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <input
                  value={createForm.supplierPhone}
                  onChange={(e) => setCreateForm((c) => ({ ...c, supplierPhone: e.target.value }))}
                  placeholder="So dien thoai"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <input
                  value={createForm.supplierEmail}
                  onChange={(e) => setCreateForm((c) => ({ ...c, supplierEmail: e.target.value }))}
                  placeholder="Email nha cung cap"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <input
                  value={createForm.warehouse}
                  onChange={(e) => setCreateForm((c) => ({ ...c, warehouse: e.target.value }))}
                  placeholder="Kho nhan"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <input
                  value={createForm.staffInCharge}
                  onChange={(e) => setCreateForm((c) => ({ ...c, staffInCharge: e.target.value }))}
                  placeholder="Nhan vien phu trach"
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <input
                  type="datetime-local"
                  value={createForm.importDate}
                  onChange={(e) => setCreateForm((c) => ({ ...c, importDate: e.target.value }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                />
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm((c) => ({ ...c, status: e.target.value as InboundStatus }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                >
                  <option value="draft">Nhap nhap</option>
                  <option value="pending">Dang cho</option>
                  <option value="received">Da nhan</option>
                  <option value="cancelled">Da huy</option>
                </select>
                <select
                  value={createForm.paymentStatus}
                  onChange={(e) => setCreateForm((c) => ({ ...c, paymentStatus: e.target.value as PaymentStatus }))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                >
                  <option value="unpaid">Chua thanh toan</option>
                  <option value="partial">Thanh toan mot phan</option>
                  <option value="paid">Da thanh toan</option>
                </select>
              </div>

              <textarea
                value={createForm.supplierAddress}
                onChange={(e) => setCreateForm((c) => ({ ...c, supplierAddress: e.target.value }))}
                placeholder="Dia chi nha cung cap"
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              />

              <div className="rounded-lg border border-gray-200">
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                  <h3 className="font-semibold text-gray-900">Danh sach san pham nhap</h3>
                  <button
                    type="button"
                    onClick={() =>
                      setCreateForm((current) => ({
                        ...current,
                        products: [...current.products, createDefaultProductDraft()],
                      }))
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    <Plus className="w-4 h-4" /> Them dong
                  </button>
                </div>

                <div className="space-y-3 p-4">
                  {createForm.products.map((product, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 rounded-lg border border-gray-100 p-3">
                      <input
                        value={product.productName}
                        onChange={(e) => updateProductDraft(index, 'productName', e.target.value)}
                        placeholder="Ten san pham"
                        className="md:col-span-3 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <select
                        value={product.category}
                        onChange={(e) => updateProductDraft(index, 'category', e.target.value as InboundProductDraft['category'])}
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="Gundam">Gundam</option>
                        <option value="Pokémon">Pokemon</option>
                        <option value="One Piece">One Piece</option>
                      </select>
                      <input
                        value={product.sku}
                        onChange={(e) => updateProductDraft(index, 'sku', e.target.value)}
                        placeholder="SKU"
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        min={1}
                        value={product.quantityOrdered}
                        onChange={(e) => updateProductDraft(index, 'quantityOrdered', Number(e.target.value) || 1)}
                        placeholder="So luong"
                        className="md:col-span-1 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="number"
                        min={0}
                        value={product.unitCost}
                        onChange={(e) => updateProductDraft(index, 'unitCost', Number(e.target.value) || 0)}
                        placeholder="Gia nhap"
                        className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCreateForm((current) => ({
                            ...current,
                            products: current.products.length === 1
                              ? current.products
                              : current.products.filter((_, productIndex) => productIndex !== index),
                          }))
                        }
                        className="md:col-span-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Xoa
                      </button>
                      <input
                        value={product.category === 'Gundam' ? product.grade : product.rarity}
                        onChange={(e) => updateProductDraft(index, product.category === 'Gundam' ? 'grade' : 'rarity', e.target.value)}
                        placeholder={product.category === 'Gundam' ? 'Cap do (VD: MG)' : 'Do hiem (VD: Rare)'}
                        className="md:col-span-4 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                      <input
                        value={product.productImage}
                        onChange={(e) => updateProductDraft(index, 'productImage', e.target.value)}
                        placeholder="URL hinh san pham (tuy chon)"
                        className="md:col-span-8 px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-600">Thue VAT (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={createForm.taxRate}
                    onChange={(e) => setCreateForm((c) => ({ ...c, taxRate: Number(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="rounded-lg border border-gray-200 px-4 py-2">
                  <p className="text-xs text-gray-500">Tam tinh hang hoa</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(draftSubtotal)}</p>
                </div>
                <div className="rounded-lg border border-gray-200 px-4 py-2">
                  <p className="text-xs text-gray-500">Tong thanh toan (co VAT)</p>
                  <p className="text-lg font-bold text-primary">{formatCurrency(draftSubtotal + draftTaxAmount)}</p>
                </div>
              </div>

              <textarea
                value={createForm.notes}
                onChange={(e) => setCreateForm((c) => ({ ...c, notes: e.target.value }))}
                placeholder="Ghi chu noi bo (tuy chon)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                onClick={closeCreateModal}
                className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Huy
              </button>
              <button
                type="button"
                onClick={handleCreateInbound}
                className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-primary/90"
              >
                Luu don nhap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
