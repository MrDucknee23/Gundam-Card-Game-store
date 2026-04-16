import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { formatCurrency } from '../utils/format';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  TrendingUp, TrendingDown, ShoppingCart, Users, Package, DollarSign,
  Download, Calendar, Filter, ChevronDown
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent } from '../components/ui/card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const revenueChartData = {
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
  datasets: [
    {
      label: 'Doanh thu',
      data: [45000000, 52000000, 48000000, 61000000, 55000000, 67000000],
      borderColor: '#DC143C',
      backgroundColor: 'rgba(220, 20, 60, 0.1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Chi phí',
      data: [32000000, 35000000, 33000000, 38000000, 36000000, 40000000],
      borderColor: '#6b7280',
      backgroundColor: 'rgba(107, 114, 128, 0.1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Lợi nhuận',
      data: [13000000, 17000000, 15000000, 23000000, 19000000, 27000000],
      borderColor: '#0066CC',
      backgroundColor: 'rgba(0, 102, 204, 0.1)',
      tension: 0.4,
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const ordersChartData = {
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [
    {
      label: 'Tổng đơn',
      data: [24, 31, 28, 35, 42, 38, 45],
      backgroundColor: '#DC143C',
    },
    {
      label: 'Hoàn thành',
      data: [20, 28, 25, 32, 38, 35, 41],
      backgroundColor: '#0066CC',
    },
    {
      label: 'Đã hủy',
      data: [4, 3, 3, 3, 4, 3, 4],
      backgroundColor: '#6b7280',
    },
  ],
};

const categoryChartData = {
  labels: ['HG', 'MG', 'RG', 'PG', 'Pokémon', 'One Piece'],
  datasets: [
    {
      data: [320, 280, 180, 120, 450, 350],
      backgroundColor: ['#DC143C', '#000000', '#6b7280', '#9ca3af', '#0066CC', '#60a5fa'],
      borderWidth: 0,
    },
  ],
};

const customerChartData = {
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
  datasets: [
    {
      label: 'Khách mới',
      data: [45, 52, 48, 61, 55, 67],
      backgroundColor: '#DC143C',
    },
    {
      label: 'Khách quay lại',
      data: [120, 135, 142, 158, 165, 178],
      backgroundColor: '#0066CC',
    },
  ],
};

const productPerformanceData = [
  { product: 'RG Nu Gundam', daBan: 85, tonKho: 15, doanhThu: 34000000 },
  { product: 'MG Freedom Gundam', daBan: 72, tonKho: 28, doanhThu: 28800000 },
  { product: 'PG Unicorn Gundam', daBan: 45, tonKho: 12, doanhThu: 67500000 },
  { product: 'Pokémon Booster Pack', daBan: 156, tonKho: 84, doanhThu: 46800000 },
  { product: 'One Piece Starter Deck', daBan: 124, tonKho: 56, doanhThu: 37200000 },
];

const topSellingProducts = [
  { id: 1, name: 'RG Nu Gundam', sold: 85, revenue: '34.000.000đ' },
  { id: 2, name: 'MG Freedom Gundam', sold: 72, revenue: '28.800.000đ' },
  { id: 3, name: 'PG Unicorn Gundam', sold: 45, revenue: '67.500.000đ' },
  { id: 4, name: 'Pokémon Booster Pack', sold: 156, revenue: '46.800.000đ' },
  { id: 5, name: 'One Piece Starter Deck', sold: 124, revenue: '37.200.000đ' },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Nguyễn Văn A', product: 'RG Nu Gundam', amount: '680.000đ', status: 'Hoàn thành' },
  { id: 'ORD-002', customer: 'Trần Thị B', product: 'Pokémon Pack', amount: '450.000đ', status: 'Đang xử lý' },
  { id: 'ORD-003', customer: 'Lê Văn C', product: 'MG Freedom', amount: '720.000đ', status: 'Hoàn thành' },
  { id: 'ORD-004', customer: 'Phạm Thị D', product: 'One Piece Deck', amount: '380.000đ', status: 'Hoàn thành' },
  { id: 'ORD-005', customer: 'Hoàng Văn E', product: 'PG Unicorn', amount: '1.850.000đ', status: 'Đang giao' },
];

const topCustomers = [
  { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', orders: 24, spending: '45.600.000đ' },
  { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', orders: 18, spending: '38.400.000đ' },
  { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', orders: 15, spending: '32.100.000đ' },
  { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', orders: 12, spending: '28.900.000đ' },
  { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', orders: 10, spending: '24.500.000đ' },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('6months');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'gundam' | 'cardgame'>('all');

  React.useEffect(() => {
    const handleScroll = () => {
      setIsFilterSticky(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const exportData = (format: 'csv' | 'excel') => {
    console.log(`Exporting data as ${format}...`);
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            label += formatCurrency(context.parsed.y);
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return `${value / 1000000}M`;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'top' as const } },
    scales: { x: { stacked: false }, y: { stacked: false } },
  };

  const getCategoryChartData = () => {
    if (activeCategoryTab === 'gundam') {
      return {
        labels: ['HG', 'MG', 'RG', 'PG'],
        datasets: [{ data: [320, 280, 180, 120], backgroundColor: ['#DC143C', '#000000', '#6b7280', '#9ca3af'], borderWidth: 0 }],
      };
    } else if (activeCategoryTab === 'cardgame') {
      return {
        labels: ['Pokémon', 'One Piece'],
        datasets: [{ data: [450, 350], backgroundColor: ['#0066CC', '#60a5fa'], borderWidth: 0 }],
      };
    } else {
      return categoryChartData;
    }
  };

  const getCategoryLegendData = () => {
    if (activeCategoryTab === 'gundam') {
      return [
        { name: 'HG', value: 320, color: '#DC143C' },
        { name: 'MG', value: 280, color: '#000000' },
        { name: 'RG', value: 180, color: '#6b7280' },
        { name: 'PG', value: 120, color: '#9ca3af' },
      ];
    } else if (activeCategoryTab === 'cardgame') {
      return [
        { name: 'Pokémon', value: 450, color: '#0066CC' },
        { name: 'One Piece', value: 350, color: '#60a5fa' },
      ];
    } else {
      return [
        { name: 'HG', value: 320, color: '#DC143C' },
        { name: 'MG', value: 280, color: '#000000' },
        { name: 'RG', value: 180, color: '#6b7280' },
        { name: 'PG', value: 120, color: '#9ca3af' },
        { name: 'Pokémon', value: 450, color: '#0066CC' },
        { name: 'One Piece', value: 350, color: '#60a5fa' },
      ];
    }
  };

  const TAB_CLASS = 'flex-1 min-w-fit rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 hover:text-gray-800 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-[1920px] mx-auto px-6 py-8">

        {/* KPI CARDS */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-black mb-1">Tổng quan Nhanh</h1>
            <p className="text-sm text-gray-500">Các chỉ số KPI chính</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>+15%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Doanh thu</p>
                <p className="text-2xl font-bold text-black mb-3">67.000.000đ</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>+8%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Đơn hàng</p>
                <p className="text-2xl font-bold text-black mb-3">245</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>+23%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Khách hàng</p>
                <p className="text-2xl font-bold text-black mb-3">1,234</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Sản phẩm</p>
                <p className="text-2xl font-bold text-black mb-3">156</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-secondary h-1.5 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ANALYTICS & REPORTS */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-black mb-1">Phân tích & Báo cáo</h1>
            <p className="text-sm text-gray-500">Phân tích sâu về hiệu suất kinh doanh</p>
          </div>

          <Card className="border border-gray-200 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <Tabs value={activeAnalyticsTab} onValueChange={setActiveAnalyticsTab}>

                {/* Tab Navigation */}
                <TabsList className="mb-6 flex flex-wrap gap-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-2 h-auto">
                  <TabsTrigger value="revenue" className={TAB_CLASS}>
                    Phân tích Doanh thu
                  </TabsTrigger>
                  <TabsTrigger value="orders" className={TAB_CLASS}>
                    Phân tích Đơn hàng
                  </TabsTrigger>
                  <TabsTrigger value="customers" className={TAB_CLASS}>
                    Phân tích Khách hàng
                  </TabsTrigger>
                  <TabsTrigger value="products" className={TAB_CLASS}>
                    Hiệu suất Sản phẩm
                  </TabsTrigger>
                </TabsList>

                {/* Sticky Filter Bar */}
                <div className={`transition-all duration-300 ${isFilterSticky ? 'fixed top-0 left-0 right-0 z-40 bg-white shadow-md px-6 py-4' : ''}`}>
                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700"
                      >
                        <option value="7days">7 ngày qua</option>
                        <option value="30days">30 ngày qua</option>
                        <option value="3months">3 tháng qua</option>
                        <option value="6months">6 tháng qua</option>
                        <option value="1year">1 năm qua</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700"
                      >
                        <option value="all">Tất cả danh mục</option>
                        <option value="gundam">Gundam Models</option>
                        <option value="pokemon">Pokémon Cards</option>
                        <option value="onepiece">One Piece Cards</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => exportData('csv')}
                        className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Xuất CSV
                      </button>
                      <button
                        onClick={() => exportData('excel')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Xuất Excel
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className={isFilterSticky ? 'mt-20' : ''}>
                  {activeAnalyticsTab === 'revenue' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 rounded-xl border border-primary/20">
                          <p className="text-sm text-gray-600 mb-1">Doanh thu kỳ này</p>
                          <p className="text-2xl font-bold text-black">67.000.000đ</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4" /> +15% so với kỳ trước
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-4 rounded-xl border border-secondary/20">
                          <p className="text-sm text-gray-600 mb-1">Chi phí kỳ này</p>
                          <p className="text-2xl font-bold text-black">40.000.000đ</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingDown className="w-4 h-4" /> -8% so với kỳ trước
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-gray-600 mb-1">Lợi nhuận kỳ này</p>
                          <p className="text-2xl font-bold text-black">27.000.000đ</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4" /> +35% so với kỳ trước
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Xu hướng Doanh thu & Lợi nhuận</h3>
                        <div style={{ width: '100%', height: 400 }}>
                          <Line data={revenueChartData} options={lineChartOptions} />
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Phân bổ theo danh mục</h3>
                        <div className="flex gap-2 mb-6">
                          {(['all', 'gundam', 'cardgame'] as const).map((tab) => (
                            <button
                              key={tab}
                              onClick={() => setActiveCategoryTab(tab)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                activeCategoryTab === tab
                                  ? 'bg-primary text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {tab === 'all' ? 'Tất cả' : tab === 'gundam' ? 'Gundam' : 'Card Game'}
                            </button>
                          ))}
                        </div>
                        <div style={{ width: '100%', height: 300, marginBottom: '24px' }}>
                          <Pie
                            data={getCategoryChartData()}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  callbacks: {
                                    label: function(context: any) {
                                      const label = context.label || '';
                                      const value = context.parsed || 0;
                                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                                      const percentage = ((value / total) * 100).toFixed(0);
                                      return `${label}: ${percentage}%`;
                                    }
                                  }
                                }
                              },
                            }}
                          />
                        </div>
                        <div className={`grid gap-x-8 gap-y-3 ${activeCategoryTab === 'cardgame' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {getCategoryLegendData().map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-gray-700">{item.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAnalyticsTab === 'orders' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Đơn hàng theo Ngày trong Tuần</h3>
                        <div style={{ width: '100%', height: 400 }}>
                          <Bar data={ordersChartData} options={barChartOptions} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAnalyticsTab === 'customers' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Khách hàng Mới vs Khách hàng Quay lại</h3>
                        <div style={{ width: '100%', height: 400 }}>
                          <Bar data={customerChartData} options={barChartOptions} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAnalyticsTab === 'products' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Bảng Hiệu suất Sản phẩm</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sản phẩm</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Đã bán</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tồn kho</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Doanh thu</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">Tỷ lệ bán</th>
                              </tr>
                            </thead>
                            <tbody>
                              {productPerformanceData.map((product) => {
                                const total = product.daBan + product.tonKho;
                                const sellRate = (product.daBan / total) * 100;
                                return (
                                  <tr key={`product-perf-${product.product}`} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-gray-900">{product.product}</td>
                                    <td className="py-3 px-4 text-right font-bold text-primary">{product.daBan}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">{product.tonKho}</td>
                                    <td className="py-3 px-4 text-right font-bold text-gray-900">{formatCurrency(product.doanhThu)}</td>
                                    <td className="py-3 px-4">
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                          <div className="bg-primary h-2 rounded-full" style={{ width: `${sellRate}%` }}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-700">{sellRate.toFixed(0)}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* QUICK INSIGHTS */}
        <div className="mb-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-black mb-1">Thông tin Nhanh</h2>
            <p className="text-sm text-gray-500">Tổng quan các chỉ số quan trọng</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Selling Products */}
            <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base text-black">Sản phẩm Bán chạy</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-2">
                  {topSellingProducts.map((product, index) => (
                    <div key={`top-product-${product.id}`} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-red-100 text-primary' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm leading-tight">{product.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{product.sold} đã bán</p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">{product.revenue}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-secondary" />
                <h3 className="font-semibold text-base text-black">Đơn hàng Gần đây</h3>
              </div>
              <CardContent className="p-6">
                <div className="space-y-1">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={`recent-order-${order.id}`}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="py-2.5 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-primary text-sm">#{order.id}</p>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                          order.status === 'Đang xử lý' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-tight">{order.customer}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-400">{order.product}</p>
                        <p className="font-semibold text-gray-900 text-sm">{order.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card className="border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-base text-black">Khách hàng hàng đầu</h3>
              </div>
              <CardContent className="p-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Khách hàng</th>
                      <th className="text-center pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Đơn hàng</th>
                      <th className="text-right pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Chi tiêu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="font-semibold text-gray-900 text-sm leading-tight">{customer.name}</p>
                          <p className="text-xs text-blue-500 mt-0.5">{customer.email}</p>
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">{customer.orders}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className="text-sm font-bold text-gray-900">{customer.spending}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};