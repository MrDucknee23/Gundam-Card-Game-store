import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const AdminStatistics: React.FC = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('month');

  // Stats Cards Data
  const statsCards = [
    {
      label: 'Doanh thu tháng này',
      value: '67.000.000 đ',
      change: '+12.5%',
      isPositive: true,
      icon: '💵',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'Đơn hàng',
      value: '180',
      change: '+8.3%',
      isPositive: true,
      icon: '🛒',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Sản phẩm bán ra',
      value: '425',
      change: '+15.2%',
      isPositive: true,
      icon: '📦',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Khách hàng mới',
      value: '45',
      change: '-2.4%',
      isPositive: false,
      icon: '👥',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  // Revenue by Month Data
  const revenueData = [
    { month: 'T1', revenue: 45000000 },
    { month: 'T2', revenue: 52000000 },
    { month: 'T3', revenue: 48000000 },
    { month: 'T4', revenue: 61000000 },
    { month: 'T5', revenue: 58000000 },
    { month: 'T6', revenue: 67000000 }
  ];

  // Orders by Month Data
  const ordersData = [
    { month: 'T1', orders: 120 },
    { month: 'T2', orders: 135 },
    { month: 'T3', orders: 128 },
    { month: 'T4', orders: 155 },
    { month: 'T5', orders: 148 },
    { month: 'T6', orders: 180 }
  ];

  // Category Distribution Data
  const categoryData = [
    { name: 'HG', value: 35, color: '#dc2626' },
    { name: 'MG', value: 30, color: '#1f2937' },
    { name: 'RG', value: 20, color: '#6b7280' },
    { name: 'PG', value: 15, color: '#d1d5db' }
  ];

  // Top Products Data
  const topProducts = [
    { rank: 1, name: 'RG Nu Gundam', sold: 85, revenue: '102.000.000 đ' },
    { rank: 2, name: 'MG Barbatos', sold: 72, revenue: '86.400.000 đ' },
    { rank: 3, name: 'HG Unicorn', sold: 68, revenue: '54.400.000 đ' },
    { rank: 4, name: 'PG Strike Freedom', sold: 45, revenue: '157.500.000 đ' },
    { rank: 5, name: 'RG Sazabi', sold: 42, revenue: '50.400.000 đ' }
  ];

  // Recent Activities
  const recentActivities = [
    {
      text: 'Đơn hàng mới #ORD-2024-180 từ Nguyễn Văn A',
      time: '5 phút trước'
    },
    {
      text: 'Sản phẩm RG Nu Gundam đã được cập nhật',
      time: '15 phút trước'
    }
  ];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-black">{payload[0].value.toLocaleString('vi-VN')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-black mb-2">Thống kê & báo cáo</h1>
              <p className="text-gray-600">Phân tích hiệu suất kinh doanh</p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Navigation Links */}
              <nav className="flex items-center gap-6">
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Trang tổng quan
                </Link>
                <Link
                  to="/admin/products"
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Quản lý sản phẩm
                </Link>
                <Link
                  to="/admin/orders"
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Đơn hàng
                </Link>
                <Link
                  to="/admin/users"
                  className="text-gray-600 hover:text-black transition-colors font-medium"
                >
                  Người dùng
                </Link>
                <span className="text-primary font-semibold">
                  Phân tích
                </span>
              </nav>
              
              {/* Time Filter */}
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white font-medium"
              >
                <option value="today">Hôm nay</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm này</option>
              </select>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {statsCards.map((card, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${card.iconBg} rounded-lg flex items-center justify-center`}>
                    <span className={`text-2xl ${card.iconColor}`}>{card.icon}</span>
                  </div>
                  <span className={`text-sm font-semibold ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {card.change} {card.isPositive ? '↑' : '↓'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{card.label}</p>
                <p className="text-black text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Revenue Bar Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-primary text-xl">📈</span>
                <h2 className="text-black">Doanh thu theo tháng</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis 
                    stroke="#6b7280" 
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px' }}
                    iconType="square"
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#dc2626" 
                    name="Doanh thu"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Orders Line Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-primary text-xl">🛒</span>
                <h2 className="text-black">Đơn hàng theo tháng</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={ordersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ fontSize: '14px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#dc2626" 
                    strokeWidth={3}
                    name="Đơn hàng"
                    dot={{ fill: '#dc2626', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category & Top Products Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {/* Category Pie Chart */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-primary text-xl">📦</span>
                <h2 className="text-black">Phân bổ theo danh mục</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`category-cell-${entry.name}-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products List */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-primary text-xl">📈</span>
                <h2 className="text-black">Top 5 sản phẩm bán chạy</h2>
              </div>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.rank} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{product.rank}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-black truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sold} đã bán</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-black mb-6">Hoạt động gần đây</h2>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-black">{activity.text}</p>
                    <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};