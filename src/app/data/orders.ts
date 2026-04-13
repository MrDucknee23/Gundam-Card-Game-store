export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'cod' | 'momo' | 'zalopay';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  category: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    street: string;
    city: string;
    district: string;
    ward: string;
  };
  orderDate: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
}

export const orders: Order[] = [
  {
    id: 'ORD-001',
    orderNumber: 'ORD-2024-001',
    customerName: 'Nguyễn Văn An',
    customerEmail: 'nguyenvanan@email.com',
    customerPhone: '0901234567',
    shippingAddress: {
      street: '123 Đường Lê Lợi',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-30T10:30:00',
    items: [
      {
        productId: 'gundam-001',
        productName: 'RG RX-78-2 Gundam',
        productImage: 'https://images.unsplash.com/photo-1712971724897-a9ae95e0ec44?w=400',
        category: 'Gundam',
        quantity: 1,
        price: 850000
      },
      {
        productId: 'pokemon-001',
        productName: 'Charizard VMAX',
        productImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        category: 'Pokémon',
        quantity: 2,
        price: 450000
      }
    ],
    subtotal: 1750000,
    shippingFee: 30000,
    total: 1780000,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    notes: 'Giao hàng giờ hành chính'
  },
  {
    id: 'ORD-002',
    orderNumber: 'ORD-2024-002',
    customerName: 'Trần Thị Bình',
    customerEmail: 'tranthibinh@email.com',
    customerPhone: '0912345678',
    shippingAddress: {
      street: '456 Nguyễn Huệ',
      ward: 'Phường Bến Thành',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-30T14:15:00',
    items: [
      {
        productId: 'gundam-002',
        productName: 'MG Freedom Gundam 2.0',
        productImage: 'https://images.unsplash.com/photo-1681367050714-f170aad806ca?w=400',
        category: 'Gundam',
        quantity: 1,
        price: 1200000
      }
    ],
    subtotal: 1200000,
    shippingFee: 30000,
    total: 1230000,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    notes: 'Gọi trước khi giao 30 phút'
  },
  {
    id: 'ORD-003',
    orderNumber: 'ORD-2024-003',
    customerName: 'Lê Minh Cường',
    customerEmail: 'leminhcuong@email.com',
    customerPhone: '0923456789',
    shippingAddress: {
      street: '789 Võ Văn Tần',
      ward: 'Phường 5',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-30T16:45:00',
    items: [
      {
        productId: 'onepiece-001',
        productName: 'Monkey D. Luffy SR',
        productImage: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400',
        category: 'One Piece',
        quantity: 3,
        price: 350000
      },
      {
        productId: 'onepiece-002',
        productName: 'Roronoa Zoro SR',
        productImage: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400',
        category: 'One Piece',
        quantity: 2,
        price: 350000
      }
    ],
    subtotal: 1750000,
    shippingFee: 30000,
    total: 1780000,
    paymentMethod: 'momo',
    paymentStatus: 'pending',
    orderStatus: 'processing'
  },
  {
    id: 'ORD-004',
    orderNumber: 'ORD-2024-004',
    customerName: 'Phạm Thu Dung',
    customerEmail: 'phamthudung@email.com',
    customerPhone: '0934567890',
    shippingAddress: {
      street: '321 Trần Hưng Đạo',
      ward: 'Phường Cầu Ông Lãnh',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-29T09:20:00',
    items: [
      {
        productId: 'gundam-003',
        productName: 'PG Unicorn Gundam',
        productImage: 'https://images.unsplash.com/photo-1742407881242-a867b21fb364?w=400',
        category: 'Gundam',
        quantity: 1,
        price: 3500000
      }
    ],
    subtotal: 3500000,
    shippingFee: 50000,
    total: 3550000,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'processing',
    notes: 'Kiểm tra hàng trước khi thanh toán'
  },
  {
    id: 'ORD-005',
    orderNumber: 'ORD-2024-005',
    customerName: 'Hoàng Văn Đức',
    customerEmail: 'hoangvanduc@email.com',
    customerPhone: '0945678901',
    shippingAddress: {
      street: '654 Điện Biên Phủ',
      ward: 'Phường Đa Kao',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-29T13:50:00',
    items: [
      {
        productId: 'pokemon-002',
        productName: 'Pikachu VMAX',
        productImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        category: 'Pokémon',
        quantity: 1,
        price: 550000
      },
      {
        productId: 'pokemon-003',
        productName: 'Mewtwo V',
        productImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        category: 'Pokémon',
        quantity: 1,
        price: 650000
      }
    ],
    subtotal: 1200000,
    shippingFee: 30000,
    total: 1230000,
    paymentMethod: 'zalopay',
    paymentStatus: 'paid',
    orderStatus: 'delivered'
  },
  {
    id: 'ORD-006',
    orderNumber: 'ORD-2024-006',
    customerName: 'Võ Thị Hoa',
    customerEmail: 'vothihoa@email.com',
    customerPhone: '0956789012',
    shippingAddress: {
      street: '987 Hai Bà Trưng',
      ward: 'Phường Tân Định',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-28T11:30:00',
    items: [
      {
        productId: 'gundam-004',
        productName: 'HG Strike Freedom Gundam',
        productImage: 'https://images.unsplash.com/photo-1712971724897-a9ae95e0ec44?w=400',
        category: 'Gundam',
        quantity: 2,
        price: 650000
      }
    ],
    subtotal: 1300000,
    shippingFee: 30000,
    total: 1330000,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'failed',
    orderStatus: 'cancelled',
    notes: 'Khách hàng yêu cầu hủy đơn'
  },
  {
    id: 'ORD-007',
    orderNumber: 'ORD-2024-007',
    customerName: 'Đặng Minh Khoa',
    customerEmail: 'dangminhkhoa@email.com',
    customerPhone: '0967890123',
    shippingAddress: {
      street: '147 Pasteur',
      ward: 'Phường 6',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-28T15:20:00',
    items: [
      {
        productId: 'onepiece-003',
        productName: 'Trafalgar Law SR',
        productImage: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400',
        category: 'One Piece',
        quantity: 1,
        price: 400000
      },
      {
        productId: 'pokemon-004',
        productName: 'Rayquaza VMAX',
        productImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        category: 'Pokémon',
        quantity: 1,
        price: 750000
      }
    ],
    subtotal: 1150000,
    shippingFee: 30000,
    total: 1180000,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    orderStatus: 'shipped'
  },
  {
    id: 'ORD-008',
    orderNumber: 'ORD-2024-008',
    customerName: 'Bùi Thanh Long',
    customerEmail: 'buithanhlong@email.com',
    customerPhone: '0978901234',
    shippingAddress: {
      street: '258 Cách Mạng Tháng Tám',
      ward: 'Phường 10',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh'
    },
    orderDate: '2024-01-27T10:45:00',
    items: [
      {
        productId: 'gundam-005',
        productName: 'RG Nu Gundam',
        productImage: 'https://images.unsplash.com/photo-1644898262501-6e73916dce2e?w=400',
        category: 'Gundam',
        quantity: 1,
        price: 950000
      }
    ],
    subtotal: 950000,
    shippingFee: 30000,
    total: 980000,
    paymentMethod: 'momo',
    paymentStatus: 'paid',
    orderStatus: 'delivered'
  }
];

// Helper functions
export const getOrderStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    processing: 'Đang xử lý',
    shipped: 'Đã giao hàng',
    delivered: 'Đã gửi hàng',
    cancelled: 'Đã hủy'
  };
  return labels[status];
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels: Record<PaymentStatus, string> = {
    paid: 'Đã thanh toán',
    pending: 'Chờ thanh toán',
    failed: 'Thanh toán thất bại'
  };
  return labels[status];
};

export const getPaymentMethodLabel = (method: PaymentMethod): string => {
  const labels: Record<PaymentMethod, string> = {
    credit_card: 'Thẻ tín dụng',
    bank_transfer: 'Chuyển khoản',
    cod: 'COD',
    momo: 'MoMo',
    zalopay: 'ZaloPay'
  };
  return labels[method];
};
