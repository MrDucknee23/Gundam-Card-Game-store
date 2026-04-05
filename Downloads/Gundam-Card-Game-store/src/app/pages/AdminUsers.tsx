import React from 'react';
import { useNavigate } from 'react-router';
import { Pencil, Lock, Unlock, Trash2 } from 'lucide-react';
import { 
  users as initialUsers, 
  User, 
  UserRole, 
  UserStatus,
  getUserStats,
  getRoleBadgeColor,
  getStatusBadgeColor,
  formatCurrency 
} from '../data/users';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | UserRole>('all');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer' as UserRole,
    password: ''
  });

  const stats = getUserStats(users);

  // Menu items
  const menuItems = [
    { name: 'Dashboard', path: '/admin' },
    { name: 'Products', path: '/admin/products' },
    { name: 'Inventory', path: '/admin' },
    { name: 'Orders', path: '/admin/orders' },
    { name: 'Users', path: '/admin/users', active: true },
    { name: 'Statistics', path: '/admin/statistics' },
  ];

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Handle add user
  const handleAddUser = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      joinDate: new Date(),
      ordersCount: 0,
      totalSpending: 0,
      status: 'active'
    };
    
    setUsers([...users, newUser]);
    setIsAddModalOpen(false);
    resetForm();
  };

  // Handle edit user
  const handleEditUser = () => {
    if (!selectedUser) return;
    
    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
        : user
    ));
    
    setIsEditModalOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  // Handle delete user
  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(users.filter(user => user.id !== selectedUser.id));
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  // Toggle user status
  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
        : user
    ));
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ''
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'customer',
      password: ''
    });
  };

  // Handle logout
  const handleLogout = () => {
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-black mb-2">Quản lý người dùng</h1>
              <p className="text-gray-600">Quản lý người dùng và quyền hạn</p>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              + Thêm người dùng
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-gray-600 text-sm mb-3">Tổng người dùng</p>
              <p className="text-black text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-gray-600 text-sm mb-3">Khách hàng</p>
              <p className="text-black text-3xl font-bold">{stats.customers}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-gray-600 text-sm mb-3">Quản trị viên</p>
              <p className="text-black text-3xl font-bold">{stats.admins}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <p className="text-gray-600 text-sm mb-3">Đang hoạt động</p>
              <p className="text-black text-3xl font-bold">{stats.active}</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Tên</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Email</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Số điện thoại</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Vai trò</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Ngày tham gia</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Đơn hàng</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Chi tiêu</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Trạng thái</th>
                    <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-black">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{user.email}</td>
                      <td className="py-4 px-6 text-gray-700">{user.phone}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'customer' ? 'Khách hàng' : user.role === 'admin' ? 'Quản trị viên' : user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-sm">
                        {new Date(user.joinDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-center">{user.ordersCount}</td>
                      <td className="py-4 px-6 font-semibold text-black">
                        {formatCurrency(user.totalSpending)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusBadgeColor(user.status)}`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4 text-gray-700 group-hover:text-black" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors group ${
                              user.status === 'active' ? 'hover:bg-red-50' : 'hover:bg-green-50'
                            }`}
                            title={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.status === 'active' ? (
                              <Lock className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                            ) : (
                              <Unlock className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                            )}
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <h2 className="text-black text-2xl font-bold mb-6">Thêm người dùng mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập tên"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập email"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Mật khẩu</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập mật khẩu"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setIsAddModalOpen(false); resetForm(); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleAddUser}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Thêm người dùng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <h2 className="text-black text-2xl font-bold mb-6">Chỉnh sửa người dùng</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Tên</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Vai trò</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); resetForm(); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleEditUser}
                className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in duration-200">
            <h2 className="text-black text-2xl font-bold mb-4">Xóa người dùng</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa <span className="font-semibold text-black">{selectedUser.name}</span>? Hành động này không thể hoàn tác.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setIsDeleteModalOpen(false); setSelectedUser(null); }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};