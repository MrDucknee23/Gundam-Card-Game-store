export type DateRange = 'today' | '7days' | '30days' | 'custom';

export type CategoryFilter = 'all' | 'gundam' | 'card';

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

// Summary Metrics
export const metricsCards: MetricCard[] = [
  {
    title: 'Doanh thu tháng này',
    value: '₫425.680.000',
    change: 12.5,
    isPositive: true,
    sparklineData: [45, 52, 48, 58, 53, 60, 55, 62, 58, 68]
  },
  {
    title: 'Tổng đơn hàng',
    value: 1248,
    change: 8.3,
    isPositive: true,
    sparklineData: [120, 135, 142, 128, 155, 148, 162, 158, 170, 165]
  },
  {
    title: 'Sản phẩm đã bán',
    value: 3542,
    change: 15.7,
    isPositive: true,
    sparklineData: [320, 335, 342, 355, 368, 375, 382, 395, 405, 415]
  },
  {
    title: 'Khách hàng mới',
    value: 248,
    change: -3.2,
    isPositive: false,
    sparklineData: [52, 48, 45, 42, 38, 40, 43, 39, 36, 38]
  }
];

// Category Distribution Data
export const categoryDataAll: CategoryData[] = [
  { name: 'HG', value: 320, color: '#DC2626' }, // Red
  { name: 'MG', value: 280, color: '#000000' }, // Black
  { name: 'RG', value: 180, color: '#4B5563' }, // Dark Gray
  { name: 'PG', value: 120, color: '#9CA3AF' }, // Light Gray
  { name: 'Pokémon', value: 450, color: '#2563EB' }, // Blue
  { name: 'One Piece', value: 350, color: '#3B82F6' } // Different blue tone
];

export const categoryDataGundam: CategoryData[] = [
  { name: 'HG', value: 320, color: '#DC2626' },
  { name: 'MG', value: 280, color: '#000000' },
  { name: 'RG', value: 180, color: '#4B5563' },
  { name: 'PG', value: 120, color: '#9CA3AF' }
];

export const categoryDataCard: CategoryData[] = [
  { name: 'Pokémon', value: 450, color: '#2563EB' },
  { name: 'One Piece', value: 350, color: '#3B82F6' }
];

// Top 5 Best-Selling Products
export const topSellingProducts = [
  { rank: 1, name: 'RX-93 Nu Gundam Ver.Ka (MG)', quantity: 156, revenue: 124800000 },
  { rank: 2, name: 'Pikachu VMAX - Secret Rare', quantity: 248, revenue: 99200000 },
  { rank: 3, name: 'Monkey D. Luffy - Gear 5 (SR)', quantity: 189, revenue: 75600000 },
  { rank: 4, name: 'Strike Freedom Gundam (RG)', quantity: 134, revenue: 67000000 },
  { rank: 5, name: 'Charizard GX - Rainbow Rare', quantity: 98, revenue: 58800000 }
];

// Revenue by Month Data
export const revenueData = [
  { month: 'T1', revenue: 45000000 },
  { month: 'T2', revenue: 52000000 },
  { month: 'T3', revenue: 48000000 },
  { month: 'T4', revenue: 61000000 },
  { month: 'T5', revenue: 58000000 },
  { month: 'T6', revenue: 67000000 }
];

// Orders by Month Data
export const ordersData = [
  { month: 'T1', orders: 120 },
  { month: 'T2', orders: 135 },
  { month: 'T3', orders: 128 },
  { month: 'T4', orders: 155 },
  { month: 'T5', orders: 148 },
  { month: 'T6', orders: 180 }
];

// User Growth Data
export const userGrowthData = [
  { date: 'T1', users: 2800 },
  { date: 'T2', users: 2950 },
  { date: 'T3', users: 3100 },
  { date: 'T4', users: 3250 },
  { date: 'T5', users: 3400 },
  { date: 'T6', users: 3542 }
];

// Traffic Sources
export const trafficSources: TrafficSource[] = [
  { name: 'Direct', value: 45, color: '#DC2626' },
  { name: 'Social', value: 30, color: '#2563EB' },
  { name: 'Search', value: 25, color: '#000000' }
];

// Top Customers
export const topCustomers: TopCustomer[] = [
  {
    id: 'cust-1',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@email.com',
    orders: 24,
    totalSpending: 45600000
  },
  {
    id: 'cust-2',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    orders: 18,
    totalSpending: 38400000
  },
  {
    id: 'cust-3',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    orders: 15,
    totalSpending: 32100000
  },
  {
    id: 'cust-4',
    name: 'Phạm Thị D',
    email: 'phamthid@email.com',
    orders: 12,
    totalSpending: 28900000
  },
  {
    id: 'cust-5',
    name: 'Hoàng Văn E',
    email: 'hoangvane@email.com',
    orders: 10,
    totalSpending: 24500000
  }
];

// Recent Orders
export const recentOrders: RecentOrder[] = [
  {
    id: 'ORD-2024-001',
    customer: 'Nguyễn Văn A',
    date: new Date('2024-06-15T14:30:00'),
    amount: 2400000,
    status: 'completed'
  },
  {
    id: 'ORD-2024-002',
    customer: 'Trần Thị B',
    date: new Date('2024-06-15T13:15:00'),
    amount: 1800000,
    status: 'pending'
  },
  {
    id: 'ORD-2024-003',
    customer: 'Lê Văn C',
    date: new Date('2024-06-15T11:45:00'),
    amount: 3200000,
    status: 'completed'
  },
  {
    id: 'ORD-2024-004',
    customer: 'Phạm Thị D',
    date: new Date('2024-06-14T16:20:00'),
    amount: 950000,
    status: 'cancelled'
  },
  {
    id: 'ORD-2024-005',
    customer: 'Hoàng Văn E',
    date: new Date('2024-06-14T15:00:00'),
    amount: 2800000,
    status: 'completed'
  }
];

// Top Products (legacy format)
export const topProducts: TopProduct[] = [
  {
    id: 'prod-1',
    name: 'RX-93 Nu Gundam Ver.Ka (MG)',
    sales: 156,
    revenue: 124800000
  },
  {
    id: 'prod-2',
    name: 'Pikachu VMAX - Secret Rare',
    sales: 248,
    revenue: 99200000
  },
  {
    id: 'prod-3',
    name: 'Monkey D. Luffy - Gear 5 (SR)',
    sales: 189,
    revenue: 75600000
  },
  {
    id: 'prod-4',
    name: 'Strike Freedom Gundam (RG)',
    sales: 134,
    revenue: 67000000
  },
  {
    id: 'prod-5',
    name: 'Charizard GX - Rainbow Rare',
    sales: 98,
    revenue: 58800000
  }
];

// Helper: Get status badge color
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'cancelled':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Helper: Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};

// Helper: Format number short
export const formatNumberShort = (value: number): string => {
  if (value >= 1000000000) {
    return `₫${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `₫${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `₫${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
};

// Helper: Format date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};