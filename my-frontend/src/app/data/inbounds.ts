export type InboundStatus = 'draft' | 'pending' | 'received' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

export interface InboundProduct {
  productId: string;
  productName: string;
  productImage: string;
  category: 'Gundam' | 'Pokémon' | 'One Piece';
  grade?: string;
  rarity?: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalAmount: number;
}

export interface Inbound {
  id: string;
  inboundNumber: string;
  supplierName: string;
  supplierContact: string;
  supplierAddress: string;
  supplierPhone: string;
  supplierEmail: string;
  importDate: string;
  receivedDate?: string;
  warehouse: string;
  staffInCharge: string;
  totalItems: number;
  totalValue: number;
  status: InboundStatus;
  paymentStatus: PaymentStatus;
  taxRate: number;
  taxAmount: number;
  notes: string;
  products: InboundProduct[];
  timeline: {
    created: string;
    shipped?: string;
    qualityCheck?: string;
    stocked?: string;
  };
}

export const inbounds: Inbound[] = [
  {
    id: 'inb-001',
    inboundNumber: 'INB-2026-001',
    supplierName: 'Bandai Co., Ltd',
    supplierContact: 'Yamada Taro',
    supplierAddress: '5-37-8 Shiba, Minato-ku, Tokyo 108-0014, Japan',
    supplierPhone: '+81-3-5419-3300',
    supplierEmail: 'orders@bandai.co.jp',
    importDate: '2026-04-01T09:00:00',
    receivedDate: '2026-04-01T14:30:00',
    warehouse: 'Kho Trung tâm - Quận 1',
    staffInCharge: 'Nguyễn Văn An',
    totalItems: 150,
    totalValue: 285000000,
    status: 'received',
    paymentStatus: 'paid',
    taxRate: 10,
    taxAmount: 28500000,
    notes: 'Đơn hàng chính thức tháng 4/2026. Đã kiểm tra chất lượng.',
    products: [
      {
        productId: 'gundam-001',
        productName: 'RX-78-2 Gundam',
        productImage: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400',
        category: 'Gundam',
        grade: 'RG',
        sku: 'RG-RX78-2',
        quantityOrdered: 50,
        quantityReceived: 50,
        unitCost: 850000,
        totalAmount: 42500000
      },
      {
        productId: 'gundam-002',
        productName: 'Wing Gundam Zero',
        productImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        category: 'Gundam',
        grade: 'MG',
        sku: 'MG-WGZ-001',
        quantityOrdered: 30,
        quantityReceived: 30,
        unitCost: 1250000,
        totalAmount: 37500000
      },
      {
        productId: 'gundam-003',
        productName: 'Unicorn Gundam',
        productImage: 'https://images.unsplash.com/photo-1610465347261-e5d033e886e6?w=400',
        category: 'Gundam',
        grade: 'PG',
        sku: 'PG-UNI-001',
        quantityOrdered: 20,
        quantityReceived: 20,
        unitCost: 4500000,
        totalAmount: 90000000
      },
      {
        productId: 'gundam-004',
        productName: 'Strike Freedom Gundam',
        productImage: 'https://images.unsplash.com/photo-1608889476518-738c9b1b6e8a?w=400',
        category: 'Gundam',
        grade: 'RG',
        sku: 'RG-SF-001',
        quantityOrdered: 50,
        quantityReceived: 50,
        unitCost: 950000,
        totalAmount: 47500000
      }
    ],
    timeline: {
      created: '2026-03-25T10:00:00',
      shipped: '2026-03-28T08:00:00',
      qualityCheck: '2026-04-01T14:00:00',
      stocked: '2026-04-01T16:00:00'
    }
  },
  {
    id: 'inb-002',
    inboundNumber: 'INB-2026-002',
    supplierName: 'The Pokémon Company',
    supplierContact: 'John Smith',
    supplierAddress: '601 108th Ave NE, Suite 1900, Bellevue, WA 98004, USA',
    supplierPhone: '+1-425-274-7500',
    supplierEmail: 'wholesale@pokemon.com',
    importDate: '2026-04-02T10:00:00',
    warehouse: 'Kho Trung tâm - Quận 1',
    staffInCharge: 'Trần Thị Bình',
    totalItems: 500,
    totalValue: 125000000,
    status: 'pending',
    paymentStatus: 'partial',
    taxRate: 10,
    taxAmount: 12500000,
    notes: 'Đang chờ giao hàng từ nhà cung cấp. Dự kiến nhận ngày 05/04.',
    products: [
      {
        productId: 'pokemon-001',
        productName: 'Pikachu VMAX',
        productImage: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=400',
        category: 'Pokémon',
        rarity: 'Secret Rare',
        sku: 'PKM-PIKA-VMAX-SR',
        quantityOrdered: 100,
        quantityReceived: 0,
        unitCost: 350000,
        totalAmount: 35000000
      },
      {
        productId: 'pokemon-002',
        productName: 'Charizard EX',
        productImage: 'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400',
        category: 'Pokémon',
        rarity: 'Ultra Rare',
        sku: 'PKM-CHAR-EX-UR',
        quantityOrdered: 150,
        quantityReceived: 0,
        unitCost: 280000,
        totalAmount: 42000000
      },
      {
        productId: 'pokemon-003',
        productName: 'Mewtwo V',
        productImage: 'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=400',
        category: 'Pokémon',
        rarity: 'Rare Holo',
        sku: 'PKM-MEW-V-RH',
        quantityOrdered: 250,
        quantityReceived: 0,
        unitCost: 180000,
        totalAmount: 45000000
      }
    ],
    timeline: {
      created: '2026-03-28T14:00:00',
      shipped: '2026-03-30T09:00:00'
    }
  },
  {
    id: 'inb-003',
    inboundNumber: 'INB-2026-003',
    supplierName: 'Toei Animation',
    supplierContact: 'Tanaka Yuki',
    supplierAddress: '2-10-5 Higashi-Oizumi, Nerima-ku, Tokyo 178-0063, Japan',
    supplierPhone: '+81-3-3978-4456',
    supplierEmail: 'sales@toei-anim.co.jp',
    importDate: '2026-03-30T11:00:00',
    receivedDate: '2026-03-30T15:00:00',
    warehouse: 'Kho Trung tâm - Quận 1',
    staffInCharge: 'Lê Văn Cường',
    totalItems: 300,
    totalValue: 90000000,
    status: 'received',
    paymentStatus: 'paid',
    taxRate: 10,
    taxAmount: 9000000,
    notes: 'Lô hàng One Piece TCG mới nhất. Đã nhập kho đầy đủ.',
    products: [
      {
        productId: 'onepiece-001',
        productName: 'Monkey D. Luffy Gear 5',
        productImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
        category: 'One Piece',
        rarity: 'Secret Rare',
        sku: 'OP-LUFFY-G5-SR',
        quantityOrdered: 80,
        quantityReceived: 80,
        unitCost: 450000,
        totalAmount: 36000000
      },
      {
        productId: 'onepiece-002',
        productName: 'Roronoa Zoro',
        productImage: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400',
        category: 'One Piece',
        rarity: 'Ultra Rare',
        sku: 'OP-ZORO-UR',
        quantityOrdered: 120,
        quantityReceived: 120,
        unitCost: 280000,
        totalAmount: 33600000
      },
      {
        productId: 'onepiece-003',
        productName: 'Trafalgar Law',
        productImage: 'https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=400',
        category: 'One Piece',
        rarity: 'Rare Holo',
        sku: 'OP-LAW-RH',
        quantityOrdered: 100,
        quantityReceived: 100,
        unitCost: 200000,
        totalAmount: 20000000
      }
    ],
    timeline: {
      created: '2026-03-20T09:00:00',
      shipped: '2026-03-26T10:00:00',
      qualityCheck: '2026-03-30T14:30:00',
      stocked: '2026-03-30T16:00:00'
    }
  },
  {
    id: 'inb-004',
    inboundNumber: 'INB-2026-004',
    supplierName: 'Bandai Co., Ltd',
    supplierContact: 'Yamada Taro',
    supplierAddress: '5-37-8 Shiba, Minato-ku, Tokyo 108-0014, Japan',
    supplierPhone: '+81-3-5419-3300',
    supplierEmail: 'orders@bandai.co.jp',
    importDate: '2026-03-15T10:00:00',
    warehouse: 'Kho Trung tâm - Quận 1',
    staffInCharge: 'Nguyễn Văn An',
    totalItems: 0,
    totalValue: 0,
    status: 'draft',
    paymentStatus: 'unpaid',
    taxRate: 10,
    taxAmount: 0,
    notes: 'Đơn nháp - Chưa hoàn thiện',
    products: [],
    timeline: {
      created: '2026-03-15T10:00:00'
    }
  },
  {
    id: 'inb-005',
    inboundNumber: 'INB-2026-005',
    supplierName: 'GoodSmile Company',
    supplierContact: 'Sato Kenji',
    supplierAddress: '1-13-10 Kuramae, Taito-ku, Tokyo 111-0051, Japan',
    supplierPhone: '+81-3-5821-7600',
    supplierEmail: 'business@goodsmile.jp',
    importDate: '2026-03-20T09:00:00',
    warehouse: 'Kho Phụ - Quận 7',
    staffInCharge: 'Phạm Thị Dung',
    totalItems: 80,
    totalValue: 156000000,
    status: 'cancelled',
    paymentStatus: 'unpaid',
    taxRate: 10,
    taxAmount: 0,
    notes: 'Đơn hàng bị hủy do nhà cung cấp hết hàng.',
    products: [
      {
        productId: 'gundam-005',
        productName: 'Nu Gundam Ver. Ka',
        productImage: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        category: 'Gundam',
        grade: 'MG',
        sku: 'MG-NU-VK',
        quantityOrdered: 40,
        quantityReceived: 0,
        unitCost: 1950000,
        totalAmount: 78000000
      },
      {
        productId: 'gundam-006',
        productName: 'Sazabi Ver. Ka',
        productImage: 'https://images.unsplash.com/photo-1608889476518-738c9b1b6e8a?w=400',
        category: 'Gundam',
        grade: 'MG',
        sku: 'MG-SAZ-VK',
        quantityOrdered: 40,
        quantityReceived: 0,
        unitCost: 1950000,
        totalAmount: 78000000
      }
    ],
    timeline: {
      created: '2026-03-18T11:00:00'
    }
  }
];

export const getInboundStatusLabel = (status: InboundStatus): string => {
  const labels: Record<InboundStatus, string> = {
    draft: 'Nháp',
    pending: 'Đang chờ',
    received: 'Đã nhận',
    cancelled: 'Đã hủy'
  };
  return labels[status];
};

export const getPaymentStatusLabel = (status: PaymentStatus): string => {
  const labels: Record<PaymentStatus, string> = {
    unpaid: 'Chưa thanh toán',
    partial: 'Thanh toán một phần',
    paid: 'Đã thanh toán'
  };
  return labels[status];
};
