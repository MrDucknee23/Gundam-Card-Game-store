import React from 'react';
import { useNavigate } from 'react-router';
import { Pencil, Lock, Unlock, Trash2 } from 'lucide-react';
import { User, UserRole, UserStatus, getRoleBadgeColor, getStatusBadgeColor, formatCurrency } from '../data/users';
import { useUsers } from '../hooks/useUsers';
import { AdminActionButton, AdminActionGroup } from '../components/admin/AdminActionButton';

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const { users, loading, error, addUser, updateUser, deleteUser, toggleStatus } = useUsers();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | UserRole>('all');
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  
  const [formData, setFormData] = React.useState({
    name: '', email: '', phone: '', role: 'customer' as UserRole, password: ''
  });

  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length,
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const normalizedPhoneQuery = normalizedSearchQuery.replace(/\D/g, '');

  const filteredUsers = users.filter(user => {
    const userName = (user.name ?? '').toLowerCase();
    const userEmail = (user.email ?? '').toLowerCase();
    const userPhone = (user.phone ?? '').replace(/\D/g, '');

    const matchesSearch = normalizedSearchQuery === '' || 
      userName.includes(normalizedSearchQuery) ||
      userEmail.includes(normalizedSearchQuery) ||
      userPhone.includes(normalizedPhoneQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setFormData({...formData, phone: val});
  };

  const handleAddUser = async () => {
    await addUser(formData);
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    await updateUser(selectedUser.id, { name: formData.name, email: formData.email, phone: formData.phone, role: formData.role });
    setIsEditModalOpen(false);
    setSelectedUser(null);
    resetForm();
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    await deleteUser(selectedUser.id);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId: string) => { await toggleStatus(userId); };
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone, role: user.role, password: '' });
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (user: User) => { setSelectedUser(user); setIsDeleteModalOpen(true); };
  const resetForm = () => { setFormData({ name: '', email: '', phone: '', role: 'customer', password: '' }); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500 text-lg">Đang tải người dùng...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500 text-lg">{error}</p></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2 leading-tight">Quản lý người dùng</h1>
              <p className="text-base text-gray-600">Quản lý người dùng và quyền hạn</p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-[1.02]">
              + Thêm người dùng
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"><p className="text-gray-600 text-sm mb-3">Tổng người dùng</p><p className="text-black text-3xl font-bold">{stats.total}</p></div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"><p className="text-gray-600 text-sm mb-3">Khách hàng</p><p className="text-black text-3xl font-bold">{stats.customers}</p></div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"><p className="text-gray-600 text-sm mb-3">Quản trị viên</p><p className="text-black text-3xl font-bold">{stats.admins}</p></div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"><p className="text-gray-600 text-sm mb-3">Đang hoạt động</p><p className="text-black text-3xl font-bold">{stats.active}</p></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as 'all' | UserRole)} className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1220px] table-fixed">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[20%]">Tên</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[24%]">Email</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[11%]">Số điện thoại</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[11%]">Vai trò</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[11%]">Ngày tham gia</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[8%]">Đơn hàng</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[10%]">Chi tiêu</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[10%]">Trạng thái</th>
                    <th className="text-left py-4 px-6 text-gray-700 font-semibold text-sm leading-tight w-[9%]">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors align-middle">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover object-center"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-base">{user.name.charAt(0)}</div>
                            )}
                          </div>
                          <span className="font-semibold text-black text-base leading-tight truncate">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-sm leading-tight break-all">{user.email}</td>
                      <td className="py-4 px-6 text-gray-700 text-sm leading-tight whitespace-nowrap">{user.phone}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold leading-none ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'customer' ? 'Khách hàng' : 'Quản trị viên'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700 text-sm leading-tight whitespace-nowrap">{new Date(user.joinDate).toLocaleDateString('vi-VN')}</td>
                      <td className="py-4 px-6 text-gray-700 text-center text-sm font-medium whitespace-nowrap">{user.ordersCount}</td>
                      <td className="py-4 px-6 font-semibold text-black text-sm leading-tight whitespace-nowrap">{formatCurrency(user.totalSpending)}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold leading-none ${getStatusBadgeColor(user.status)}`}>
                          {user.status === 'active' ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <AdminActionGroup>
                          <AdminActionButton
                            onClick={() => openEditModal(user)}
                            tone="neutral"
                            label="Chỉnh sửa"
                          >
                            <Pencil />
                          </AdminActionButton>
                          <AdminActionButton
                            onClick={() => toggleUserStatus(user.id)}
                            tone={user.status === 'active' ? 'danger' : 'success'}
                            label={user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.status === 'active' ? <Lock /> : <Unlock />}
                          </AdminActionButton>
                          <AdminActionButton
                            onClick={() => openDeleteModal(user)}
                            tone="danger"
                            label="Xóa"
                          >
                            <Trash2 />
                          </AdminActionButton>
                        </AdminActionGroup>
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-black text-2xl font-bold mb-6">Thêm người dùng mới</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Tên</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nhập tên" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nhập email" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Vai trò</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Mật khẩu</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Nhập mật khẩu" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
              <button onClick={handleAddUser} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">Thêm người dùng</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-black text-2xl font-bold mb-6">Chỉnh sửa người dùng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Tên</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Vai trò</label>
                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Quản trị viên</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setIsEditModalOpen(false); setSelectedUser(null); resetForm(); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
              <button onClick={handleEditUser} className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 font-medium">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-black text-2xl font-bold mb-4">Xóa người dùng</h2>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn xóa <span className="font-semibold text-black">{selectedUser.name}</span>? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-3">
              <button onClick={() => { setIsDeleteModalOpen(false); setSelectedUser(null); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Hủy</button>
              <button onClick={handleDeleteUser} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};