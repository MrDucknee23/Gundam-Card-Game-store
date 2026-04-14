import React from 'react';
import { Download, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Package, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  metricsCards,
  revenueData,
  ordersData,
  categoryDataAll,
  categoryDataGundam,
  categoryDataCard,
  topSellingProducts,
  topCustomers,
  recentOrders,
  getStatusBadgeColor,
  formatCurrency,
  formatNumberShort,
  formatDate,
  DateRange,
  CategoryFilter,
  CategoryData
} from '../data/analytics';
import { toast } from 'sonner';

export const AdminAnalytics: React.FC = () => {
  const [dateRange, setDateRange] = React.useState<DateRange>('30days');
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('all');
  const [isLoading, setIsLoading] = React.useState(false);

  // Get category data based on filter
  const getCategoryData = (): CategoryData[] => {
    switch (categoryFilter) {
      case 'gundam':
        return categoryDataGundam;
      case 'card':
        return categoryDataCard;
      default:
        return categoryDataAll;
    }
  };

  const currentCategoryData = getCategoryData();
  const totalCategoryValue = currentCategoryData.reduce((sum, item) => sum + item.value, 0);

  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setIsLoading(true);
    setDateRange(range);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Dữ liệu đã cập nhật cho ${range === '7days' ? '7 ngày qua' : range === '30days' ? '30 ngày qua' : range}`);
    }, 500);
  };

  // Handle export
  const handleExport = (format: 'csv' | 'pdf') => {
    toast.success(`Đang xuất dữ liệu dạng ${format.toUpperCase()}...`);
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.value > 1000 ? formatNumberShort(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Donut chart center label
  const renderCenterLabel = () => {
    return (
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
        <tspan x="50%" dy="-0.5em" className="text-2xl font-bold fill-black">
          {totalCategoryValue}
        </tspan>
        <tspan x="50%" dy="1.5em" className="text-sm fill-gray-600">
          Tổng sản phẩm
        </tspan>
      </text>
    );
  };

  // Get icon for metric card
  const getMetricIcon = (index: number) => {
    const icons = [
      <DollarSign className="w-5 h-5" />,
      <ShoppingCart className="w-5 h-5" />,
      <Package className="w-5 h-5" />,
      <Users className="w-5 h-5" />
    ];
    return icons[index];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 pb-6 border-b border-gray-200 gap-4">
            <div>
              <h1 className="text-black mb-2">Phân tích & báo cáo</h1>
              <p className="text-gray-600">Giám sát thông tin và xu hướng kinh doanh</p>
            </div>
            
            {/* Date Range & Export */}
            <div className="flex items-center gap-3">
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value as DateRange)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium"
              >
                <option value="today">Hôm nay</option>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="custom">Tùy chỉnh</option>
              </select>

              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all duration-300">
                  <Download className="w-4 h-4" />
                  Xuất dữ liệu
                </button>
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium whitespace-nowrap"
                  >
                    Xuất CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium whitespace-nowrap"
                  >
                    Xuất PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {metricsCards.map((card, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-black">
                      {getMetricIcon(index)}
                    </div>
                    <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <p className="text-black text-3xl font-bold">{card.value}</p>
                  <div className={`flex items-center gap-1 text-sm font-semibold ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {card.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(card.change)}%
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Revenue by Month - Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-black font-semibold mb-6">Doanh thu theo tháng</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid key="cart-grid-revenue" strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis key="x-axis-revenue" dataKey="month" stroke="#6B7280" />
                  <YAxis key="y-axis-revenue" stroke="#6B7280" tickFormatter={(value) => formatNumberShort(value)} />
                  <Tooltip key="tooltip-revenue" content={<CustomTooltip />} />
                  <Bar key="bar-revenue" dataKey="revenue" fill="#DC2626" radius={[8, 8, 0, 0]} name="Doanh thu" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Orders by Month - Line Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-black font-semibold mb-6">Đơn hàng theo tháng</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersData}>
                  <CartesianGrid key="cart-grid-orders" strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis key="x-axis-orders" dataKey="month" stroke="#6B7280" />
                  <YAxis key="y-axis-orders" stroke="#6B7280" />
                  <Tooltip key="tooltip-orders" content={<CustomTooltip />} />
                  <Line
                    key="line-orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#DC2626"
                    strokeWidth={3}
                    dot={{ fill: '#DC2626', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Đơn hàng"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Category Distribution - Donut Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-black font-semibold mb-4">Phân phối theo danh mục</h3>
              
              {/* Toggle Filter */}
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    categoryFilter === 'all'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setCategoryFilter('gundam')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    categoryFilter === 'gundam'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Gundam
                </button>
                <button
                  onClick={() => setCategoryFilter('card')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    categoryFilter === 'card'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Card Game
                </button>
              </div>

              {/* Donut Chart */}
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    key="pie-category"
                    data={currentCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {currentCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    key="tooltip-category"
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const percentage = ((data.value as number / totalCategoryValue) * 100).toFixed(1);
                        return (
                          <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                            <p className="font-semibold text-black">{data.name}</p>
                            <p className="text-sm text-gray-600">Số lượng: {data.value}</p>
                            <p className="text-sm text-gray-600">Tỷ lệ: {percentage}%</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {currentCategoryData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700 font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 5 Best-Selling Products */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-black font-semibold mb-6">Top 5 sản phẩm bán chạy</h3>
              <div className="space-y-4">
                {topSellingProducts.map((product) => (
                  <div key={product.rank} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {product.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-black font-medium truncate">{product.name}</p>
                      <p className="text-sm text-gray-600">Đã bán: {product.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-black font-semibold">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Orders & Top Customers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-black font-semibold">Đơn hàng gần đây</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Mã đơn</th>
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Khách hàng</th>
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Số tiền</th>
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6 text-black font-medium text-sm">{order.id}</td>
                        <td className="py-3 px-6 text-gray-700 text-sm">{order.customer}</td>
                        <td className="py-3 px-6 text-black font-semibold text-sm">{formatCurrency(order.amount)}</td>
                        <td className="py-3 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadgeColor(order.status)}`}>
                            {order.status === 'completed' ? 'Hoàn thành' : order.status === 'pending' ? 'Đang xử lý' : 'Đã hủy'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Customers */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-black font-semibold">Khách hàng hàng đầu</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Khách hàng</th>
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Đơn hàng</th>
                      <th className="text-left py-3 px-6 text-gray-600 font-semibold text-sm">Chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div>
                            <p className="text-black font-medium text-sm">{customer.name}</p>
                            <p className="text-gray-600 text-xs">{customer.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-6 text-gray-700 text-sm text-center">{customer.orders}</td>
                        <td className="py-3 px-6 text-black font-semibold text-sm">{formatCurrency(customer.totalSpending)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
