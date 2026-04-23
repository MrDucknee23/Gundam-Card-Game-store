export type ActivityAction = 'import' | 'export' | 'adjustment' | 'order';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

export interface InventoryHistory {
  id: string;
  date: Date;
  productName: string;
  productId: string;
  action: 'import' | 'export' | 'adjustment';
  quantityChange: number;
  stockAfter: number;
  supplier?: string;
  note?: string;
}

export interface OrderHistory {
  id: string;
  orderId: string;
  date: Date;
  customerName: string;
  products: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
  status: OrderStatus;
}

// Mock Inventory History Data
export const inventoryHistory: InventoryHistory[] = [
  {
    id: 'inv-001',
    date: new Date('2026-03-30T14:30:00'),
    productName: 'RX-78-2 Gundam (RG)',
    productId: '1',
    action: 'import',
    quantityChange: 50,
    stockAfter: 75,
    supplier: 'Bandai Vietnam',
    note: 'New shipment from Japan'
  },
  {
    id: 'inv-002',
    date: new Date('2026-03-30T10:15:00'),
    productName: 'Pikachu VMAX - Secret Rare',
    productId: '7',
    action: 'export',
    quantityChange: -5,
    stockAfter: 15,
    note: 'Customer order #1234'
  },
  {
    id: 'inv-003',
    date: new Date('2026-03-29T16:45:00'),
    productName: 'Sazabi Ver.Ka (MG)',
    productId: '2',
    action: 'import',
    quantityChange: 30,
    stockAfter: 48,
    supplier: 'Hobby Link Japan',
    note: 'Restock - High demand item'
  },
  {
    id: 'inv-004',
    date: new Date('2026-03-29T11:20:00'),
    productName: 'Zoro Parallel Art',
    productId: '10',
    action: 'adjustment',
    quantityChange: -2,
    stockAfter: 38,
    note: 'Damaged items removed'
  },
  {
    id: 'inv-005',
    date: new Date('2026-03-28T15:30:00'),
    productName: 'Strike Freedom Gundam (RG)',
    productId: '3',
    action: 'export',
    quantityChange: -8,
    stockAfter: 32,
    note: 'Bulk order for retail partner'
  },
  {
    id: 'inv-006',
    date: new Date('2026-03-28T09:10:00'),
    productName: 'Charizard VSTAR',
    productId: '8',
    action: 'import',
    quantityChange: 100,
    stockAfter: 125,
    supplier: 'Pokémon Company',
    note: 'New release - Limited edition'
  },
  {
    id: 'inv-007',
    date: new Date('2026-03-27T14:00:00'),
    productName: 'Unicorn Gundam (PG)',
    productId: '4',
    action: 'import',
    quantityChange: 15,
    stockAfter: 20,
    supplier: 'Bandai Namco',
    note: 'Premium grade restock'
  },
  {
    id: 'inv-008',
    date: new Date('2026-03-27T10:30:00'),
    productName: 'Luffy Gear 5 - Ultra Rare',
    productId: '11',
    action: 'export',
    quantityChange: -3,
    stockAfter: 22,
    note: 'VIP customer pre-order'
  },
  {
    id: 'inv-009',
    date: new Date('2026-03-26T13:45:00'),
    productName: 'Nu Gundam Ver.Ka (MG)',
    productId: '5',
    action: 'adjustment',
    quantityChange: 5,
    stockAfter: 45,
    note: 'Found additional stock in warehouse'
  },
  {
    id: 'inv-010',
    date: new Date('2026-03-26T08:20:00'),
    productName: 'Mewtwo GX - Rainbow Rare',
    productId: '9',
    action: 'import',
    quantityChange: 40,
    stockAfter: 50,
    supplier: 'Trading Card Hub',
    note: 'Collector series restocked'
  }
];

// Mock Order History Data
export const orderHistory: OrderHistory[] = [
  {
    id: 'ord-001',
    orderId: 'ORD-2026-1245',
    date: new Date('2026-03-30T14:20:00'),
    customerName: 'Nguyễn Văn A',
    products: [
      { name: 'RX-78-2 Gundam (RG)', quantity: 2, price: 850000 },
      { name: 'Pikachu VMAX - Secret Rare', quantity: 1, price: 2500000 }
    ],
    totalPrice: 4200000,
    status: 'completed'
  },
  {
    id: 'ord-002',
    orderId: 'ORD-2026-1246',
    date: new Date('2026-03-30T11:30:00'),
    customerName: 'Trần Thị B',
    products: [
      { name: 'Sazabi Ver.Ka (MG)', quantity: 1, price: 1200000 }
    ],
    totalPrice: 1200000,
    status: 'processing'
  },
  {
    id: 'ord-003',
    orderId: 'ORD-2026-1247',
    date: new Date('2026-03-29T16:15:00'),
    customerName: 'Lê Minh C',
    products: [
      { name: 'Strike Freedom Gundam (RG)', quantity: 3, price: 950000 },
      { name: 'Charizard VSTAR', quantity: 2, price: 1800000 }
    ],
    totalPrice: 6450000,
    status: 'completed'
  },
  {
    id: 'ord-004',
    orderId: 'ORD-2026-1248',
    date: new Date('2026-03-29T10:45:00'),
    customerName: 'Phạm Văn D',
    products: [
      { name: 'Unicorn Gundam (PG)', quantity: 1, price: 3500000 }
    ],
    totalPrice: 3500000,
    status: 'pending'
  },
  {
    id: 'ord-005',
    orderId: 'ORD-2026-1249',
    date: new Date('2026-03-28T15:00:00'),
    customerName: 'Hoàng Thị E',
    products: [
      { name: 'Luffy Gear 5 - Ultra Rare', quantity: 1, price: 3200000 },
      { name: 'Zoro Parallel Art', quantity: 2, price: 1500000 }
    ],
    totalPrice: 6200000,
    status: 'completed'
  },
  {
    id: 'ord-006',
    orderId: 'ORD-2026-1250',
    date: new Date('2026-03-28T09:30:00'),
    customerName: 'Vũ Minh F',
    products: [
      { name: 'Nu Gundam Ver.Ka (MG)', quantity: 2, price: 1100000 }
    ],
    totalPrice: 2200000,
    status: 'completed'
  },
  {
    id: 'ord-007',
    orderId: 'ORD-2026-1251',
    date: new Date('2026-03-27T14:45:00'),
    customerName: 'Đỗ Thị G',
    products: [
      { name: 'Mewtwo GX - Rainbow Rare', quantity: 1, price: 2800000 },
      { name: 'RX-78-2 Gundam (RG)', quantity: 1, price: 850000 }
    ],
    totalPrice: 3650000,
    status: 'cancelled'
  },
  {
    id: 'ord-008',
    orderId: 'ORD-2026-1252',
    date: new Date('2026-03-27T11:00:00'),
    customerName: 'Bùi Văn H',
    products: [
      { name: 'Strike Freedom Gundam (RG)', quantity: 5, price: 950000 }
    ],
    totalPrice: 4750000,
    status: 'processing'
  },
  {
    id: 'ord-009',
    orderId: 'ORD-2026-1253',
    date: new Date('2026-03-26T16:30:00'),
    customerName: 'Đinh Thị I',
    products: [
      { name: 'Sazabi Ver.Ka (MG)', quantity: 1, price: 1200000 },
      { name: 'Pikachu VMAX - Secret Rare', quantity: 3, price: 2500000 }
    ],
    totalPrice: 8700000,
    status: 'completed'
  },
  {
    id: 'ord-010',
    orderId: 'ORD-2026-1254',
    date: new Date('2026-03-26T10:15:00'),
    customerName: 'Cao Văn K',
    products: [
      { name: 'Unicorn Gundam (PG)', quantity: 2, price: 3500000 }
    ],
    totalPrice: 7000000,
    status: 'completed'
  }
];

// Helper function to get action color
export const getActionColor = (action: ActivityAction): string => {
  switch (action) {
    case 'import':
      return 'text-green-600 bg-green-50';
    case 'export':
    case 'order':
      return 'text-red-600 bg-red-50';
    case 'adjustment':
      return 'text-blue-600 bg-blue-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

// Helper function to get status color
export const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-50';
    case 'processing':
      return 'text-blue-600 bg-blue-50';
    case 'pending':
      return 'text-gray-600 bg-gray-50';
    case 'cancelled':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};
