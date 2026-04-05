import { User } from '../src/models/user.model';

const users = [
  {
    name: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    password: "hashed_password",
    phone: "0901234567",
    role: "customer",
    status: "active",
    totalOrders: 12,
    totalSpent: 45600000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Trần Thị B",
    email: "tranthib@gmail.com",
    password: "hashed_password",
    phone: "0912345678",
    role: "admin",
    status: "active",
    totalOrders: 0,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Phạm Văn D",
    email: "phamvand@gmail.com",
    password: "hashed_password",
    phone: "0934567890",
    role: "customer",
    status: "blocked",
    totalOrders: 25,
    totalSpent: 89500000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const seedUsers = async () => {
  try {
    await User.deleteMany({});
    await User.insertMany(users);
    console.log("User seed data has been added successfully.");
  } catch (error) {
    console.error("Error seeding user data:", error);
  }
};

seedUsers();