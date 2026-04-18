import React, { useState } from 'react';
import { Link } from 'react-router';
import { useCategories } from '../hooks/useCategories';
import { createCategory, updateCategory, deleteCategory, type Category, type CategoryPayload } from '../utils/categoryApi';
import { toast } from 'sonner';

const emptyForm: CategoryPayload = { name: '', slug: '', label: '', description: '' };

export const AdminCategories: React.FC = () => {
  const { categories, loading, error, reload } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryPayload>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, label: cat.label, description: cat.description });
    setShowModal(true);
  };

  const handleAutoSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (val: string) => {
    setForm(prev => ({
      ...prev,
      name: val,
      slug: editingId ? prev.slug : handleAutoSlug(val),
      label: editingId ? prev.label : val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim() || !form.label.trim()) {
      toast.error('Vui lòng điền đầy đủ tên, slug và label');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success('Đã cập nhật danh mục');
      } else {
        await createCategory(form);
        toast.success('Đã thêm danh mục mới');
      }
      setShowModal(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteCategory(deleteConfirm.id);
      toast.success('Đã xóa danh mục');
      setDeleteConfirm(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa danh mục');
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black">Danh mục sản phẩm</h1>
          <p className="text-gray-500 mt-1">Quản lý các loại danh mục trong cửa hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/category-attributes"
            className="px-4 py-2.5 rounded-lg font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Quản lý cấp độ / độ hiếm
          </Link>
          <button
            onClick={openAdd}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
          >
            + Thêm danh mục
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-12">Đang tải...</p>
      ) : error ? (
        <p className="text-center text-red-500 py-12">{error}</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500 py-12">Chưa có danh mục nào</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">#</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Label</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Slug</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Mô tả</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-black">{cat.label}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{cat.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(cat)}
                        className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat)}
                        className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-black mb-6">
              {editingId ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Yu-Gi-Oh"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (đường dẫn)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  placeholder="yu-gi-oh"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (hiển thị)</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={e => setForm(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Yu-Gi-Oh!"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
                <input
                  type="text"
                  value={form.description || ''}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Thẻ bài Yu-Gi-Oh Trading Card Game"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-black mb-2">Xóa danh mục</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa danh mục <strong>"{deleteConfirm.label}"</strong>?
              Danh mục chỉ có thể xóa khi không còn sản phẩm nào thuộc về nó.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
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
