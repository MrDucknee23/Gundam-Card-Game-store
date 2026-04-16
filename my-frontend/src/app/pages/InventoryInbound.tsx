import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { inbounds, getInboundStatusLabel } from '../data/inbounds';
import type { Inbound, InboundStatus } from '../data/inbounds';
import { Search, Filter, Plus, Eye, Package } from 'lucide-react';
import { formatCurrency } from '../utils/format';

export const InventoryInbound: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<InboundStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

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
    return inbounds.filter((inbound) => {
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
  }, [searchQuery, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const total = inbounds.length;
    const received = inbounds.filter((i) => i.status === 'received').length;
    const pending = inbounds.filter((i) => i.status === 'pending').length;
    const totalValue = inbounds
      .filter((i) => i.status === 'received')
      .reduce((sum, i) => sum + i.totalValue, 0);

    return { total, received, pending, totalValue };
  }, []);

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
              onClick={() => navigate('/admin/inventory/inbound/create')}
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
                          onClick={() => navigate('/admin/inventory/inbound/create')}
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
                <span className="font-semibold">{inbounds.length}</span> đơn nhập hàng
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
