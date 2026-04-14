const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const users = [
  { name: 'Nguyễn Văn A', email: 'nguyenvana@gmail.com', phone: '0901234567', role: 'customer', ordersCount: 12, totalSpending: 45600000, status: 'active' },
  { name: 'Trần Thị B', email: 'tranthib@gmail.com', phone: '0912345678', role: 'admin', ordersCount: 0, totalSpending: 0, status: 'active' },
  { name: 'Lê Minh C', email: 'leminhc@gmail.com', phone: '0923456789', role: 'customer', ordersCount: 8, totalSpending: 28900000, status: 'active' },
  { name: 'Phạm Văn D', email: 'phamvand@gmail.com', phone: '0934567890', role: 'customer', ordersCount: 25, totalSpending: 89500000, status: 'blocked' },
  { name: 'Hoàng Thị E', email: 'hoangthie@gmail.com', phone: '0945678901', role: 'customer', ordersCount: 15, totalSpending: 52300000, status: 'active' },
  { name: 'Vũ Minh F', email: 'vuminhf@gmail.com', phone: '0956789012', role: 'admin', ordersCount: 0, totalSpending: 0, status: 'active' },
  { name: 'Đỗ Thị G', email: 'dothig@gmail.com', phone: '0967890123', role: 'customer', ordersCount: 3, totalSpending: 12400000, status: 'active' },
  { name: 'Bùi Văn H', email: 'buivanh@gmail.com', phone: '0978901234', role: 'customer', ordersCount: 18, totalSpending: 67800000, status: 'active' },
  { name: 'Đinh Thị I', email: 'dinhthii@gmail.com', phone: '0989012345', role: 'customer', ordersCount: 6, totalSpending: 19200000, status: 'blocked' },
  { name: 'Cao Văn K', email: 'caovank@gmail.com', phone: '0990123456', role: 'customer', ordersCount: 22, totalSpending: 78900000, status: 'active' },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected');
  await User.deleteMany({});
  await User.insertMany(users);
  console.log(`✅ Inserted ${users.length} users`);
  await mongoose.disconnect();
  console.log('👋 Done!');
}

seed().catch(console.error);