import React, { useEffect, useMemo, useState } from 'react';
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
import { useProducts } from '../hooks/useProducts';
import { useUsers } from '../hooks/useUsers';
import { buildApiUrl } from '../utils/api';
import { orders as fallbackOrders } from '../data/orders';
import type { Order } from '../data/orders';

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

const DATE_RANGE_DAYS: Record<string, number> = {
  '7days': 7,
  '30days': 30,
  '3months': 90,
  '6months': 180,
  '1year': 365,
};

const ORDERS_API_URL = buildApiUrl('/orders?summary=1');
const REQUEST_TIMEOUT_MS = 5000;

const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

const formatTrend = (value: number) => `${value >= 0 ? '+' : ''}${Math.round(value)}%`;

const getRangeLabel = (date: Date, range: string) => {
  const days = DATE_RANGE_DAYS[range] ?? 180;

  return days <= 30
    ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    : date.toLocaleDateString('vi-VN', { month: '2-digit', year: '2-digit' });
};

const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'Hoàn thành';
    case 'processing':
      return 'Đang xử lý';
    case 'shipped':
      return 'Đang giao';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status;
  }
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading: productsLoading } = useProducts();
  const { users, loading: usersLoading } = useUsers();
  const [orders, setOrders] = useState<Order[]>(fallbackOrders);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState('revenue');
  const [dateRange, setDateRange] = useState('6months');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | 'gundam' | 'cardgame'>('all');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        setDashboardError(null);
        const response = await fetch(ORDERS_API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error('Không thể tải dữ liệu dashboard');
        }

        const data = await response.json();
        const isStale = response.headers.get('x-orders-stale') === '1';

        if (isMounted && Array.isArray(data) && data.length > 0 && !isStale) {
          setOrders(data);
        }
      } catch (error) {
        if (isMounted) {
          setOrders(fallbackOrders);
          setDashboardError(
            error instanceof Error && error.name === 'AbortError'
              ? 'Máy chủ phản hồi chậm. Đang hiển thị dữ liệu tạm thời.'
              : 'Không thể tải dữ liệu đơn hàng mới nhất. Đang hiển thị dữ liệu tạm thời.'
          );
        }
      } finally {
        window.clearTimeout(timeoutId);
        if (isMounted) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsFilterSticky(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const dashboardData = useMemo(() => {
    const days = DATE_RANGE_DAYS[dateRange] ?? 180;
    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(now.getDate() - days);
    const previousEnd = new Date(rangeStart.getTime() - 1);
    const previousStart = new Date(rangeStart);
    previousStart.setDate(rangeStart.getDate() - days);

    const productCategoryMap = new Map(
      products.map((product) => [product.name.toLowerCase(), product.category])
    );

    const matchesFilters = (order: Order, start: Date, end: Date) => {
      const orderDate = new Date(order.orderDate);
      if (orderDate < start || orderDate > end) return false;

      if (statusFilter !== 'all' && order.orderStatus !== statusFilter) {
        return false;
      }

      if (categoryFilter !== 'all') {
        return order.items.some((item) => productCategoryMap.get(item.productName.toLowerCase()) === categoryFilter);
      }

      return true;
    };

    const filteredOrders = orders.filter((order) => matchesFilters(order, rangeStart, now));
    const previousOrders = orders.filter((order) => matchesFilters(order, previousStart, previousEnd));

    const totalRevenue = filteredOrders.reduce((sum, order) => order.orderStatus === 'cancelled' ? sum : sum + order.total, 0);
    const paidRevenue = filteredOrders.reduce((sum, order) => order.paymentStatus === 'paid' && order.orderStatus !== 'cancelled' ? sum + order.total : sum, 0);
    const pendingRevenue = filteredOrders.reduce((sum, order) => order.paymentStatus === 'pending' ? sum + order.total : sum, 0);
    const totalOrders = filteredOrders.length;
    const activeCustomers = new Set(filteredOrders.map((order) => order.customerEmail || order.customerPhone)).size;
    const visibleProducts = categoryFilter === 'all'
      ? products
      : products.filter((product) => product.category === categoryFilter);
    const totalProducts = visibleProducts.length;

    const previousRevenue = previousOrders.reduce((sum, order) => order.orderStatus === 'cancelled' ? sum : sum + order.total, 0);
    const previousCustomerCount = new Set(previousOrders.map((order) => order.customerEmail || order.customerPhone)).size;

    const revenueBuckets: Record<string, { label: string; sortValue: number; revenue: number; paid: number; pending: number; }> = {};
    const customerBuckets: Record<string, { label: string; sortValue: number; newCustomers: number; activeCustomers: Set<string>; }> = {};

    filteredOrders.forEach((order) => {
      const date = new Date(order.orderDate);
      const key = (DATE_RANGE_DAYS[dateRange] ?? 180) <= 30
        ? date.toISOString().slice(0, 10)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!revenueBuckets[key]) {
        revenueBuckets[key] = {
          label: getRangeLabel(date, dateRange),
          sortValue: date.getTime(),
          revenue: 0,
          paid: 0,
          pending: 0,
        };
      }

      if (!customerBuckets[key]) {
        customerBuckets[key] = {
          label: getRangeLabel(date, dateRange),
          sortValue: date.getTime(),
          newCustomers: 0,
          activeCustomers: new Set<string>(),
        };
      }

      if (order.orderStatus !== 'cancelled') {
        revenueBuckets[key].revenue += order.total;
      }
      if (order.paymentStatus === 'paid') {
        revenueBuckets[key].paid += order.total;
      }
      if (order.paymentStatus === 'pending') {
        revenueBuckets[key].pending += order.total;
      }

      customerBuckets[key].activeCustomers.add(order.customerEmail || order.customerPhone);
    });

    users.forEach((user) => {
      const joinedAt = new Date(user.joinDate ?? user.createdAt ?? new Date());
      if (joinedAt < rangeStart || joinedAt > now) return;

      const key = (DATE_RANGE_DAYS[dateRange] ?? 180) <= 30
        ? joinedAt.toISOString().slice(0, 10)
        : `${joinedAt.getFullYear()}-${String(joinedAt.getMonth() + 1).padStart(2, '0')}`;

      if (!customerBuckets[key]) {
        customerBuckets[key] = {
          label: getRangeLabel(joinedAt, dateRange),
          sortValue: joinedAt.getTime(),
          newCustomers: 0,
          activeCustomers: new Set<string>(),
        };
      }

      customerBuckets[key].newCustomers += 1;
    });

    const sortedRevenueBuckets = Object.values(revenueBuckets).sort((a, b) => a.sortValue - b.sortValue);
    const sortedCustomerBuckets = Object.values(customerBuckets).sort((a, b) => a.sortValue - b.sortValue);

    const revenueChartDataReal = {
      labels: sortedRevenueBuckets.length > 0 ? sortedRevenueBuckets.map((bucket) => bucket.label) : ['Chưa có dữ liệu'],
      datasets: [
        {
          label: 'Doanh thu',
          data: sortedRevenueBuckets.length > 0 ? sortedRevenueBuckets.map((bucket) => bucket.revenue) : [0],
          borderColor: '#DC143C',
          backgroundColor: 'rgba(220, 20, 60, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Đã thanh toán',
          data: sortedRevenueBuckets.length > 0 ? sortedRevenueBuckets.map((bucket) => bucket.paid) : [0],
          borderColor: '#0066CC',
          backgroundColor: 'rgba(0, 102, 204, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Chờ thanh toán',
          data: sortedRevenueBuckets.length > 0 ? sortedRevenueBuckets.map((bucket) => bucket.pending) : [0],
          borderColor: '#6b7280',
          backgroundColor: 'rgba(107, 114, 128, 0.1)',
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };

    const weekdayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const weekdayIndexMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
    const totalByWeekday = new Array(7).fill(0);
    const completedByWeekday = new Array(7).fill(0);
    const cancelledByWeekday = new Array(7).fill(0);

    filteredOrders.forEach((order) => {
      const dayIndex = weekdayIndexMap[new Date(order.orderDate).getDay()];
      totalByWeekday[dayIndex] += 1;
      if (order.orderStatus === 'delivered') completedByWeekday[dayIndex] += 1;
      if (order.orderStatus === 'cancelled') cancelledByWeekday[dayIndex] += 1;
    });

    const ordersChartDataReal = {
      labels: weekdayLabels,
      datasets: [
        { label: 'Tổng đơn', data: totalByWeekday, backgroundColor: '#DC143C' },
        { label: 'Hoàn thành', data: completedByWeekday, backgroundColor: '#0066CC' },
        { label: 'Đã hủy', data: cancelledByWeekday, backgroundColor: '#6b7280' },
      ],
    };

    const customerChartDataReal = {
      labels: sortedCustomerBuckets.length > 0 ? sortedCustomerBuckets.map((bucket) => bucket.label) : ['Chưa có dữ liệu'],
      datasets: [
        {
          label: 'Khách mới',
          data: sortedCustomerBuckets.length > 0 ? sortedCustomerBuckets.map((bucket) => bucket.newCustomers) : [0],
          backgroundColor: '#DC143C',
        },
        {
          label: 'Khách mua hàng',
          data: sortedCustomerBuckets.length > 0 ? sortedCustomerBuckets.map((bucket) => bucket.activeCustomers.size) : [0],
          backgroundColor: '#0066CC',
        },
      ],
    };

    const createLegendItems = (items: Array<{ name: string; value: number; color: string }>) => {
      const validItems = items.filter((item) => item.value > 0);
      return validItems.length > 0 ? validItems : [{ name: 'Chưa có dữ liệu', value: 1, color: '#d1d5db' }];
    };

    const allCategoryItems = createLegendItems([
      { name: 'Gundam', value: products.filter((product) => product.category === 'gundam').length, color: '#DC143C' },
      { name: 'Pokémon', value: products.filter((product) => product.category === 'pokemon').length, color: '#0066CC' },
      { name: 'One Piece', value: products.filter((product) => product.category === 'onepiece').length, color: '#60a5fa' },
    ]);

    const gundamLegendItems = createLegendItems([
      { name: 'HG', value: products.filter((product) => product.category === 'gundam' && product.grade === 'HG').length, color: '#DC143C' },
      { name: 'MG', value: products.filter((product) => product.category === 'gundam' && product.grade === 'MG').length, color: '#000000' },
      { name: 'RG', value: products.filter((product) => product.category === 'gundam' && product.grade === 'RG').length, color: '#6b7280' },
      { name: 'PG', value: products.filter((product) => product.category === 'gundam' && product.grade === 'PG').length, color: '#9ca3af' },
    ]);

    const cardGameLegendItems = createLegendItems([
      { name: 'Pokémon', value: products.filter((product) => product.category === 'pokemon').length, color: '#0066CC' },
      { name: 'One Piece', value: products.filter((product) => product.category === 'onepiece').length, color: '#60a5fa' },
    ]);

    const categoryLegendItems = activeCategoryTab === 'gundam'
      ? gundamLegendItems
      : activeCategoryTab === 'cardgame'
        ? cardGameLegendItems
        : allCategoryItems;

    const categoryChartDataReal = {
      labels: categoryLegendItems.map((item) => item.name),
      datasets: [
        {
          data: categoryLegendItems.map((item) => item.value),
          backgroundColor: categoryLegendItems.map((item) => item.color),
          borderWidth: 0,
        },
      ],
    };

    const salesByProduct = new Map<string, { sold: number; revenue: number }>();
    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productCategory = productCategoryMap.get(item.productName.toLowerCase());
        if (categoryFilter !== 'all' && productCategory !== categoryFilter) {
          return;
        }

        const key = item.productName.toLowerCase();
        const current = salesByProduct.get(key) ?? { sold: 0, revenue: 0 };
        current.sold += item.quantity;
        current.revenue += item.quantity * item.price;
        salesByProduct.set(key, current);
      });
    });

    const productPerformanceRows = visibleProducts
      .map((product) => {
        const stats = salesByProduct.get(product.name.toLowerCase()) ?? { sold: 0, revenue: 0 };
        return {
          product: product.name,
          daBan: stats.sold,
          tonKho: product.stock,
          doanhThu: stats.revenue,
        };
      })
      .sort((a, b) => b.doanhThu - a.doanhThu || b.daBan - a.daBan)
      .slice(0, 10);

    const topSellingProductsData = productPerformanceRows.slice(0, 5).map((product, index) => ({
      id: index + 1,
      name: product.product,
      sold: product.daBan,
      revenue: formatCurrency(product.doanhThu),
    }));

    const recentOrdersData = [...filteredOrders]
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customerName,
        product: order.items[0]?.productName ?? 'Không có sản phẩm',
        amount: formatCurrency(order.total),
        status: getOrderStatusLabel(order.orderStatus),
      }));

    const topCustomersMap = new Map<string, { name: string; email: string; orders: number; spending: number }>();
    filteredOrders.forEach((order) => {
      const key = order.customerEmail || order.customerPhone || order.id;
      const current = topCustomersMap.get(key) ?? {
        name: order.customerName,
        email: order.customerEmail,
        orders: 0,
        spending: 0,
      };

      current.orders += 1;
      current.spending += order.total;
      topCustomersMap.set(key, current);
    });

    const topCustomersData = Array.from(topCustomersMap.values())
      .sort((a, b) => b.spending - a.spending)
      .slice(0, 5)
      .map((customer, index) => ({
        id: index + 1,
        name: customer.name,
        email: customer.email || 'Khách vãng lai',
        orders: customer.orders,
        spending: formatCurrency(customer.spending),
      }));

    return {
      totalRevenue,
      paidRevenue,
      pendingRevenue,
      totalOrders,
      activeCustomers,
      totalProducts,
      revenueChange: calculatePercentChange(totalRevenue, previousRevenue),
      ordersChange: calculatePercentChange(totalOrders, previousOrders.length),
      customersChange: calculatePercentChange(activeCustomers, previousCustomerCount),
      productsChange: calculatePercentChange(totalProducts, products.length || totalProducts),
      filteredOrders,
      revenueChartData: revenueChartDataReal,
      ordersChartData: ordersChartDataReal,
      customerChartData: customerChartDataReal,
      categoryChartData: categoryChartDataReal,
      categoryLegendData: categoryLegendItems,
      productPerformanceRows,
      topSellingProductsData,
      recentOrdersData,
      topCustomersData,
    };
  }, [orders, products, users, dateRange, categoryFilter, statusFilter, activeCategoryTab]);

  const isDashboardLoading = (productsLoading && products.length === 0) || ordersLoading;

  const exportData = (format: 'csv' | 'excel') => {
    const csvRows = [
      ['Mã đơn', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Thanh toán', 'Trạng thái'],
      ...dashboardData.filteredOrders.map((order) => [
        order.orderNumber,
        order.customerName,
        new Date(order.orderDate).toLocaleDateString('vi-VN'),
        String(order.total),
        order.paymentStatus,
        order.orderStatus,
      ]),
    ];

    const csvContent = csvRows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dashboard-export-${Date.now()}.${format === 'excel' ? 'xls' : 'csv'}`;
    link.click();
    window.URL.revokeObjectURL(url);
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

  const getCategoryChartData = () => dashboardData.categoryChartData;

  const getCategoryLegendData = () => dashboardData.categoryLegendData;

  const TAB_CLASS = 'flex-1 min-w-fit rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 transition-all duration-200 hover:text-gray-800 hover:bg-gray-100 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md';

  if (isDashboardLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-lg">Đang tải dữ liệu dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        {dashboardError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {dashboardError}
          </div>
        )}

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
                    <span>{formatTrend(dashboardData.revenueChange)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Doanh thu</p>
                <p className="text-2xl font-bold text-black mb-3">{formatCurrency(dashboardData.totalRevenue)}</p>
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
                    <span>{formatTrend(dashboardData.ordersChange)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Đơn hàng</p>
                <p className="text-2xl font-bold text-black mb-3">{dashboardData.totalOrders}</p>
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
                    <span>{formatTrend(dashboardData.customersChange)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Khách hàng hoạt động</p>
                <p className="text-2xl font-bold text-black mb-3">{dashboardData.activeCustomers}</p>
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
                    <span>{formatTrend(dashboardData.productsChange)}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">Tổng Sản phẩm</p>
                <p className="text-2xl font-bold text-black mb-3">{dashboardData.totalProducts}</p>
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
                        <option value="delivered">Hoàn thành</option>
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
                          <p className="text-2xl font-bold text-black">{formatCurrency(dashboardData.totalRevenue)}</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4" /> {formatTrend(dashboardData.revenueChange)} so với kỳ trước
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-4 rounded-xl border border-secondary/20">
                          <p className="text-sm text-gray-600 mb-1">Đã thanh toán</p>
                          <p className="text-2xl font-bold text-black">{formatCurrency(dashboardData.paidRevenue)}</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingDown className="w-4 h-4" /> {formatTrend(dashboardData.ordersChange)} theo số đơn
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                          <p className="text-sm text-gray-600 mb-1">Chờ thanh toán</p>
                          <p className="text-2xl font-bold text-black">{formatCurrency(dashboardData.pendingRevenue)}</p>
                          <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                            <TrendingUp className="w-4 h-4" /> {formatTrend(dashboardData.customersChange)} theo khách mua
                          </p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Xu hướng Doanh thu & Lợi nhuận</h3>
                        <div style={{ width: '100%', height: 400 }}>
                          <Line data={dashboardData.revenueChartData} options={lineChartOptions} />
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
                          <Bar data={dashboardData.ordersChartData} options={barChartOptions} />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeAnalyticsTab === 'customers' && (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Khách hàng Mới vs Khách hàng Quay lại</h3>
                        <div style={{ width: '100%', height: 400 }}>
                          <Bar data={dashboardData.customerChartData} options={barChartOptions} />
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
                              {dashboardData.productPerformanceRows.map((product) => {
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
                  {dashboardData.topSellingProductsData.map((product, index) => (
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
                  {dashboardData.recentOrdersData.map((order) => (
                    <div
                      key={`recent-order-${order.id}`}
                      onClick={() => navigate(`/admin/orders/${order.id}`)}
                      className="py-2.5 border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg px-2 -mx-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-primary text-sm">#{order.orderNumber}</p>
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
                    {dashboardData.topCustomersData.map((customer) => (
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