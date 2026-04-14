export interface StatCard {
  title: string;
  value: string | number;
  growth: number;
  isPositive: boolean;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopProduct {
  rank: number;
  name: string;
  quantitySold: number;
  revenue: number;
}

export type TimeFilter = 'month' | 'lastMonth' | 'last6Months' | 'year';

// Mock Stats Cards Data
export const statsCards: StatCard[] = [
  {
    title: 'Revenue (This Month)',
    value: '₫125,450,000',
    growth: 15.3,
    isPositive: true
  },
  {
    title: 'Total Orders',
    value: 245,
    growth: 8.7,
    isPositive: true
  },
  {
    title: 'Products Sold',
    value: 892,
    growth: -3.2,
    isPositive: false
  },
  {
    title: 'New Customers',
    value: 156,
    growth: 23.5,
    isPositive: true
  }
];

// Monthly Revenue & Orders Data
export const monthlyData: MonthlyData[] = [
  { month: 'T1', revenue: 85000000, orders: 145 },
  { month: 'T2', revenue: 92000000, orders: 167 },
  { month: 'T3', revenue: 125450000, orders: 245 },
  { month: 'T4', revenue: 98000000, orders: 198 },
  { month: 'T5', revenue: 112000000, orders: 223 },
  { month: 'T6', revenue: 135000000, orders: 267 },
  { month: 'T7', revenue: 128000000, orders: 234 },
  { month: 'T8', revenue: 142000000, orders: 289 },
  { month: 'T9', revenue: 118000000, orders: 212 },
  { month: 'T10', revenue: 156000000, orders: 312 },
  { month: 'T11', revenue: 148000000, orders: 278 },
  { month: 'T12', revenue: 167000000, orders: 334 }
];

// Category Distribution (Pie Chart)
export const categoryDistribution: CategoryDistribution[] = [
  { name: 'HG', value: 35, color: '#2563eb' }, // Blue
  { name: 'MG', value: 30, color: '#dc2626' }, // Red
  { name: 'RG', value: 20, color: '#000000' }, // Black
  { name: 'PG', value: 15, color: '#6b7280' }  // Gray
];

// Top Selling Products
export const topProducts: TopProduct[] = [
  {
    rank: 1,
    name: 'RX-78-2 Gundam (RG)',
    quantitySold: 234,
    revenue: 198900000
  },
  {
    rank: 2,
    name: 'Sazabi Ver.Ka (MG)',
    quantitySold: 187,
    revenue: 224400000
  },
  {
    rank: 3,
    name: 'Pikachu VMAX - Secret Rare',
    quantitySold: 156,
    revenue: 390000000
  },
  {
    rank: 4,
    name: 'Strike Freedom Gundam (RG)',
    quantitySold: 145,
    revenue: 137750000
  },
  {
    rank: 5,
    name: 'Unicorn Gundam (PG)',
    quantitySold: 89,
    revenue: 311500000
  }
];

// Helper function to format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};

// Helper function to format large numbers
export const formatNumber = (value: number): string => {
  if (value >= 1000000000) {
    return `₫${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `₫${(value / 1000000).toFixed(0)}M`;
  }
  return formatCurrency(value);
};

// Get data based on time filter
export const getFilteredData = (filter: TimeFilter): MonthlyData[] => {
  switch (filter) {
    case 'month':
      return monthlyData.slice(-1); // Current month
    case 'lastMonth':
      return monthlyData.slice(-2, -1); // Last month
    case 'last6Months':
      return monthlyData.slice(-6); // Last 6 months
    case 'year':
    default:
      return monthlyData; // All months (year)
  }
};
