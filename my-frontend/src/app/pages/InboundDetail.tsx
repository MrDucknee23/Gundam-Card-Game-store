import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { inbounds, getInboundStatusLabel, getPaymentStatusLabel } from '../data/inbounds';
import { Breadcrumb } from '../components/Breadcrumb';
import {
  ArrowLeft,
  Printer,
  FileText,
  Pencil,
  Package,
  Truck,
  CheckCircle,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Receipt,
  Barcode,
  Search
} from 'lucide-react';
import { toast } from 'sonner';

export const InboundDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inbound = inbounds.find((i) => i.id === id);
  const [barcodeInput, setBarcodeInput] = useState('');

  if (!inbound) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy đơn nhập hàng</h2>
            <p className="text-gray-600 mb-6">Đơn nhập hàng bạn đang tìm không tồn tại.</p>
            <Link
              to="/admin/inventory/inbound"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: typeof inbound.status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 border-gray-300',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      received: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status];
  };

  const getPaymentStatusColor = (status: typeof inbound.paymentStatus) => {
    const colors = {
      unpaid: 'bg-red-100 text-red-800 border-red-300',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      paid: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[status];
  };

  const handlePrintBarcodes = () => {
    toast.success('Đang chuẩn bị in mã vạch...');
    // In real app, generate and print barcodes
  };

  const handleExportPDF = () => {
    toast.success('Đang xuất file PDF...');
    // In real app, generate PDF
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcodeInput.trim()) {
      toast.success(`Đã quét mã: ${barcodeInput}`);
      setBarcodeInput('');
    }
  };

  // Timeline steps
  const timelineSteps = [
    {
      key: 'created',
      label: 'Tạo đơn',
      icon: FileText,
      date: inbound.timeline.created,
      completed: true
    },
    {
      key: 'shipped',
      label: 'NCC gửi hàng',
      icon: Truck,
      date: inbound.timeline.shipped,
      completed: !!inbound.timeline.shipped
    },
    {
      key: 'qualityCheck',
      label: 'Kiểm tra chất lượng',
      icon: CheckCircle,
      date: inbound.timeline.qualityCheck,
      completed: !!inbound.timeline.qualityCheck
    },
    {
      key: 'stocked',
      label: 'Nhập kho',
      icon: Package,
      date: inbound.timeline.stocked,
      completed: !!inbound.timeline.stocked
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Nhập hàng', href: '/admin/inventory/inbound' },
            { label: inbound.inboundNumber }
          ]}
        />

        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/inventory/inbound')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại danh sách</span>
        </button>

        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Chi tiết đơn nhập hàng</h1>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-xl text-gray-600">{inbound.inboundNumber}</p>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    inbound.status
                  )}`}
                >
                  {getInboundStatusLabel(inbound.status)}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPaymentStatusColor(
                    inbound.paymentStatus
                  )}`}
                >
                  {getPaymentStatusLabel(inbound.paymentStatus)}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handlePrintBarcodes}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Barcode className="w-4 h-4" />
                In mã vạch
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Xuất PDF
              </button>
              {inbound.status === 'pending' && (
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <Pencil className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content - Left Side (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Three Column Info Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Supplier Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Nhà cung cấp
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tên công ty</p>
                    <p className="text-sm font-semibold text-gray-900">{inbound.supplierName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Người liên hệ</p>
                    <p className="text-sm text-gray-900">{inbound.supplierContact}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Địa chỉ</p>
                    <p className="text-sm text-gray-900">{inbound.supplierAddress}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Điện thoại</p>
                    <p className="text-sm text-gray-900">{inbound.supplierPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Email</p>
                    <p className="text-sm text-gray-900">{inbound.supplierEmail}</p>
                  </div>
                </div>
              </div>

              {/* Warehouse Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  Kho nhận hàng
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Địa điểm</p>
                    <p className="text-sm font-semibold text-gray-900">{inbound.warehouse}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Nhân viên phụ trách</p>
                    <p className="text-sm text-gray-900">{inbound.staffInCharge}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Ngày nhập dự kiến</p>
                    <p className="text-sm text-gray-900">{formatDate(inbound.importDate)}</p>
                  </div>
                  {inbound.receivedDate && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày nhận thực tế</p>
                      <p className="text-sm font-semibold text-green-600">
                        {formatDate(inbound.receivedDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Thông tin tài chính
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Trạng thái thanh toán</p>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPaymentStatusColor(
                        inbound.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusLabel(inbound.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tổng giá trị hàng</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(inbound.totalValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Thuế VAT ({inbound.taxRate}%)</p>
                    <p className="text-sm text-gray-900">{formatCurrency(inbound.taxAmount)}</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Tổng thanh toán</p>
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(inbound.totalValue + inbound.taxAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode Scanner */}
            {inbound.status === 'pending' && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Barcode className="w-5 h-5 text-blue-600" />
                  Quét mã vạch
                </h3>
                <form onSubmit={handleBarcodeSubmit} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Quét hoặc nhập mã vạch sản phẩm..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Thêm
                  </button>
                </form>
                <p className="text-xs text-gray-600 mt-2">
                  Sử dụng máy quét mã vạch hoặc nhập thủ công để thêm sản phẩm vào đơn nhập
                </p>
              </div>
            )}

            {/* Product List Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Danh sách sản phẩm</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Sản phẩm
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        SKU
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        SL đặt
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                        SL nhận
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Đơn giá
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inbound.products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          Chưa có sản phẩm nào trong đơn nhập hàng
                        </td>
                      </tr>
                    ) : (
                      inbound.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.productImage}
                                alt={product.productName}
                                className="w-12 h-12 object-cover rounded border border-gray-200"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {product.productName}
                                  {product.grade && (
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                                      {product.grade}
                                    </span>
                                  )}
                                  {product.rarity && (
                                    <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded">
                                      {product.rarity}
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-500">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-mono text-gray-600">{product.sku}</p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <p className="text-sm font-semibold text-gray-900">
                              {product.quantityOrdered}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <p
                              className={`text-sm font-semibold ${
                                product.quantityReceived === product.quantityOrdered
                                  ? 'text-green-600'
                                  : product.quantityReceived > 0
                                  ? 'text-yellow-600'
                                  : 'text-gray-400'
                              }`}
                            >
                              {product.quantityReceived}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className="text-sm text-gray-900">{formatCurrency(product.unitCost)}</p>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              {formatCurrency(product.totalAmount)}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {inbound.products.length > 0 && (
                    <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                          Tổng cộng:
                        </td>
                        <td className="px-4 py-3 text-right text-base font-bold text-primary">
                          {formatCurrency(inbound.totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

            {/* Notes */}
            {inbound.notes && (
              <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-600" />
                  Ghi chú
                </h3>
                <p className="text-sm text-gray-700">{inbound.notes}</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Status Timeline */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Tiến trình đơn hàng</h3>
              <div className="relative">
                {/* Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

                {/* Timeline Steps */}
                <div className="space-y-6">
                  {timelineSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.key} className="relative flex gap-4">
                        {/* Icon Circle */}
                        <div
                          className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                            step.completed
                              ? 'bg-primary border-primary text-white'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <p
                            className={`text-sm font-semibold ${
                              step.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-xs text-gray-500 mt-1">{formatDate(step.date)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
