require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order'); // Đảm bảo đường dẫn này trỏ đúng tới file Model

const dummyOrders = [
  {
    orderCode: 'ORD-100001',
    customer: {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0901234567',
      address: '123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP.HCM'
    },
    totalAmount: 1050000,
    subtotal: 1000000,
    shippingFee: 50000,
    paymentStatus: 'Chưa thanh toán',
    orderStatus: 'Đang xử lý',
    items: [
      {
        productName: 'Mô hình Gundam Aerial 1/144 HG',
        quantity: 2,
        price: 500000,
        productImage: 'https://placehold.co/150x150?text=Gundam+Aerial'
      }
    ],
    history: [{ note: 'Khách hàng đặt hàng lần đầu' }]
  },
  {
    orderCode: 'ORD-100002',
    customer: {
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0987654321',
      address: '456 Đường Trần Hưng Đạo, Quận Hoàn Kiếm, Hà Nội'
    },
    totalAmount: 2500000,
    subtotal: 2500000,
    shippingFee: 0, // Freeship
    paymentStatus: 'Đã thanh toán',
    orderStatus: 'Đã giao hàng',
    items: [
      {
        productName: 'Mô hình Gundam Barbatos Lupus Rex 1/100',
        quantity: 1,
        price: 1500000,
        productImage: 'https://placehold.co/150x150?text=Barbatos'
      },
      {
        productName: 'Bộ dụng cụ lắp ráp Gundam Cơ Bản',
        quantity: 2,
        price: 500000,
        productImage: 'https://placehold.co/150x150?text=Tool+Set'
      }
    ],
    history: [{ note: 'Giao hàng thành công ngày hôm qua' }]
  },
  {
    orderCode: 'ORD-100003',
    customer: {
      name: 'Lê Văn C',
      email: 'levanc@test.com',
      phone: '0912345678',
      address: '789 Đường Nguyễn Văn Linh, Đà Nẵng'
    },
    totalAmount: 750000,
    subtotal: 700000,
    shippingFee: 50000,
    paymentStatus: 'Đã thanh toán',
    orderStatus: 'Đã hủy',
    items: [
      {
        productName: 'Gundam RX-78-2 Entry Grade',
        quantity: 1,
        price: 700000,
        productImage: 'https://placehold.co/150x150?text=RX-78-2'
      }
    ],
    history: [{ note: 'Khách yêu cầu hủy do đặt nhầm' }]
  }
];

async function seedDB() {
  try {
    // Kết nối CSDL
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Đã kết nối MongoDB');

    // Xóa dữ liệu cũ (Tùy chọn, giúp làm sạch DB mỗi lần chạy seed)
    await Order.deleteMany({});
    console.log('🗑️ Đã xóa toàn bộ đơn hàng cũ trong Database');

    // Thêm dữ liệu mới
    await Order.insertMany(dummyOrders);
    console.log('🌱 Đã thêm 3 đơn hàng mẫu thành công!');

    // Thoát chương trình sau khi hoàn thành
    process.exit();
  } catch (error) {
    console.error('❌ Lỗi quá trình Seed:', error);
    process.exit(1);
  }
}

seedDB();