export type UserRole = 'customer' | 'admin';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  joinDate: Date;
  ordersCount: number;
  totalSpending: number;
  status: UserStatus;
  avatar?: string;
}

// Mock Users Data
export const users: User[] = [
  {
    id: 'user-001',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    role: 'customer',
    joinDate: new Date('2025-01-15'),
    ordersCount: 12,
    totalSpending: 45600000,
    status: 'active'
  },
  {
    id: 'user-002',
    name: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0912345678',
    role: 'admin',
    joinDate: new Date('2024-11-20'),
    ordersCount: 0,
    totalSpending: 0,
    status: 'active'
  },
  {
    id: 'user-003',
    name: 'Lê Minh C',
    email: 'leminhc@gmail.com',
    phone: '0923456789',
    role: 'customer',
    joinDate: new Date('2026-02-10'),
    ordersCount: 8,
    totalSpending: 28900000,
    status: 'active'
  },
  {
    id: 'user-004',
    name: 'Phạm Văn D',
    email: 'phamvand@gmail.com',
    phone: '0934567890',
    role: 'customer',
    joinDate: new Date('2025-12-05'),
    ordersCount: 25,
    totalSpending: 89500000,
    status: 'blocked'
  },
  {
    id: 'user-005',
    name: 'Hoàng Thị E',
    email: 'hoangthie@gmail.com',
    phone: '0945678901',
    role: 'customer',
    joinDate: new Date('2026-01-22'),
    ordersCount: 15,
    totalSpending: 52300000,
    status: 'active'
  },
  {
    id: 'user-006',
    name: 'Vũ Minh F',
    email: 'vuminhf@gmail.com',
    phone: '0956789012',
    role: 'admin',
    joinDate: new Date('2024-10-10'),
    ordersCount: 0,
    totalSpending: 0,
    status: 'active'
  },
  {
    id: 'user-007',
    name: 'Đỗ Thị G',
    email: 'dothig@gmail.com',
    phone: '0967890123',
    role: 'customer',
    joinDate: new Date('2026-03-01'),
    ordersCount: 3,
    totalSpending: 12400000,
    status: 'active'
  },
  {
    id: 'user-008',
    name: 'Bùi Văn H',
    email: 'buivanh@gmail.com',
    phone: '0978901234',
    role: 'customer',
    joinDate: new Date('2025-09-18'),
    ordersCount: 18,
    totalSpending: 67800000,
    status: 'active'
  },
  {
    id: 'user-009',
    name: 'Đinh Thị I',
    email: 'dinhthii@gmail.com',
    phone: '0989012345',
    role: 'customer',
    joinDate: new Date('2026-02-28'),
    ordersCount: 6,
    totalSpending: 19200000,
    status: 'blocked'
  },
  {
    id: 'user-010',
    name: 'Cao Văn K',
    email: 'caovank@gmail.com',
    phone: '0990123456',
    role: 'customer',
    joinDate: new Date('2025-11-12'),
    ordersCount: 22,
    totalSpending: 78900000,
    status: 'active'
  }
];

// Get summary statistics
export const getUserStats = (userList: User[]) => {
  return {
    total: userList.length,
    customers: userList.filter(u => u.role === 'customer').length,
    admins: userList.filter(u => u.role === 'admin').length,
    active: userList.filter(u => u.status === 'active').length
  };
};

// Helper function for role badge color
export const getRoleBadgeColor = (role: UserRole): string => {
  return role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
};

// Helper function for status badge color
export const getStatusBadgeColor = (status: UserStatus): string => {
  return status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
};
