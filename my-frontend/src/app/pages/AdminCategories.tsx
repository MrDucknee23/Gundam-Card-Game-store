import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCategories } from '../hooks/useCategories';
import { RefreshButton } from '../components/RefreshButton';
import {
  clearCategoryAttributeGroup,
  createCategory,
  deleteCategory,
  updateCategory,
  updateCategoryAttributeGroup,
  type Category,
  type CategoryPayload,
} from '../utils/categoryApi';

type AttributeType = 'grade' | 'rarity' | 'custom';

type AttributeForm = {
  type: AttributeType;
  label: string;
  options: string[];
};

const emptyCategoryForm: CategoryPayload = {
  name: '',
  slug: '',
  label: '',
  description: '',
};

const defaultOptionsByType: Record<'grade' | 'rarity', string[]> = {
  grade: ['HG', 'RG', 'MG', 'PG'],
  rarity: ['Common', 'Rare', 'Super Rare', 'Ultra Rare'],
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const getDefaultAttributeType = (category: Category): AttributeType => {
  if (category.attributeGroup?.key === 'grade') return 'grade';
  if (category.attributeGroup?.key === 'rarity') return 'rarity';
  if (category.attributeGroup?.key) return 'custom';
  if (category.slug === 'gundam') return 'grade';
  if (category.slug === 'pokemon' || category.slug === 'onepiece') return 'rarity';
  return 'custom';
};

const buildAttributeForm = (category: Category): AttributeForm => {
  const type = getDefaultAttributeType(category);
  const existingOptions = category.attributeGroup?.options
    ?.filter(option => option.isActive !== false)
    .map(option => option.label)
    .filter(Boolean);

  return {
    type,
    label:
      category.attributeGroup?.label ||
      (type === 'grade' ? 'Cấp độ' : type === 'rarity' ? 'Độ hiếm' : ''),
    options:
      existingOptions && existingOptions.length > 0
        ? existingOptions
        : type === 'grade' || type === 'rarity'
          ? [...defaultOptionsByType[type]]
          : [''],
  };
};

export const AdminCategories: React.FC = () => {
  const { categories, loading, error, reload } = useCategories();
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [attributeForms, setAttributeForms] = useState<Record<string, AttributeForm>>({});
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryPayload>(emptyCategoryForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingAttributeId, setSavingAttributeId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategoryId('');
      setAttributeForms({});
      return;
    }

    setAttributeForms(current =>
      categories.reduce<Record<string, AttributeForm>>((next, category) => {
        next[category.id] = current[category.id] ?? buildAttributeForm(category);
        return next;
      }, {})
    );

    setSelectedCategoryId(current =>
      categories.some(category => category.id === current) ? current : categories[0].id
    );
  }, [categories]);

  const selectedCategory = useMemo(
    () => categories.find(category => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const selectedAttributeForm = selectedCategory
    ? attributeForms[selectedCategory.id] ?? buildAttributeForm(selectedCategory)
    : null;

  const updateSelectedAttributeForm = (updater: (current: AttributeForm) => AttributeForm) => {
    if (!selectedCategory) return;
    setAttributeForms(current => ({
      ...current,
      [selectedCategory.id]: updater(
        current[selectedCategory.id] ?? buildAttributeForm(selectedCategory)
      ),
    }));
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryForm(emptyCategoryForm);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      label: category.label,
      description: category.description || '',
    });
    setShowModal(true);
  };

  const handleCategoryNameChange = (value: string) => {
    setCategoryForm(current => ({
      ...current,
      name: value,
      slug: editingCategory ? current.slug : slugify(value),
      label: editingCategory ? current.label : value,
    }));
  };

  const handleSaveCategory = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: CategoryPayload = {
      name: categoryForm.name.trim(),
      slug: slugify(categoryForm.slug.trim()),
      label: categoryForm.label.trim(),
      description: categoryForm.description?.trim() || '',
    };

    if (!payload.name || !payload.slug || !payload.label) {
      toast.error('Vui lòng điền đầy đủ tên, slug và label');
      return;
    }

    try {
      setSavingCategory(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success('Đã cập nhật danh mục');
        setSelectedCategoryId(editingCategory.id);
      } else {
        const created = await createCategory(payload);
        toast.success('Đã thêm danh mục mới');
        setSelectedCategoryId(created.id);
      }
      setShowModal(false);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu danh mục');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteConfirm) return;

    try {
      await deleteCategory(deleteConfirm.id);
      toast.success('Đã xóa danh mục');
      setDeleteConfirm(null);
      if (selectedCategoryId === deleteConfirm.id) setSelectedCategoryId('');
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa danh mục');
    }
  };

  const handleChangeAttributeType = (type: AttributeType) => {
    if (!selectedCategory) return;
    updateSelectedAttributeForm(current => {
      const nextLabel =
        current.label ||
        (type === 'grade' ? 'Cấp độ' : type === 'rarity' ? 'Độ hiếm' : '');
      const nextOptions =
        current.options.some(option => option.trim())
          ? current.options
          : type === 'grade' || type === 'rarity'
            ? [...defaultOptionsByType[type]]
            : [''];

      return { ...current, type, label: nextLabel, options: nextOptions };
    });
  };

  const handleSaveAttributes = async () => {
    if (!selectedCategory || !selectedAttributeForm) return;

    const label = selectedAttributeForm.label.trim();
    const options = Array.from(
      new Set(selectedAttributeForm.options.map(option => option.trim()).filter(Boolean))
    );

    if (!label) {
      toast.error('Vui lòng nhập tên nhóm con');
      return;
    }

    if (options.length === 0) {
      toast.error('Vui lòng nhập ít nhất một giá trị con');
      return;
    }

    const key = selectedAttributeForm.type === 'custom' ? slugify(label) || 'custom' : selectedAttributeForm.type;

    try {
      setSavingAttributeId(selectedCategory.id);
      await updateCategoryAttributeGroup(
        selectedCategory.id,
        {
          key,
          label,
          isActive: true,
          options: options.map((option, index) => ({
            label: option,
            value: option,
            sortOrder: index,
            isActive: true,
          })),
        },
        selectedCategory
      );
      toast.success(`Đã lưu cấu hình cho ${selectedCategory.label}`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu cấu hình');
    } finally {
      setSavingAttributeId(null);
    }
  };

  const handleClearAttributes = async () => {
    if (!selectedCategory) return;
    if (!window.confirm(`Xóa toàn bộ cấu hình thuộc tính con của ${selectedCategory.label}?`)) return;

    try {
      setSavingAttributeId(selectedCategory.id);
      await clearCategoryAttributeGroup(selectedCategory.id, selectedCategory);
      toast.success(`Đã xóa cấu hình của ${selectedCategory.label}`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa cấu hình');
    } finally {
      setSavingAttributeId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-black">Danh mục sản phẩm</h1>
          <p className="text-gray-500 mt-1">Quản lý danh mục sản phẩm và nhóm con cấp độ hoặc độ hiếm trong cùng một màn hình.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={reload} />
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
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
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-600 mb-4">Chưa có danh mục nào</p>
          <button
            onClick={openCreateModal}
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            Tạo danh mục đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">Danh mục</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">Slug</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">Thuộc tính con</th>
                  <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => {
                  const isSelected = category.id === selectedCategoryId;
                  const hasAttributeConfig = Boolean(
                    category.attributeGroup?.label && category.attributeGroup?.options?.length
                  );

                  return (
                    <tr
                      key={category.id}
                      className={`border-b border-gray-100 last:border-b-0 ${isSelected ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedCategoryId(category.id)}
                          className="text-left"
                        >
                          <p className="font-semibold text-black">{category.label}</p>
                          <p className="text-sm text-gray-500">{category.description || 'Không có mô tả'}</p>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700">{category.slug}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${hasAttributeConfig ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {hasAttributeConfig ? category.attributeGroup?.label : 'Chưa cấu hình'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCategoryId(category.id);
                              openEditModal(category);
                            }}
                            className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(category)}
                            className="px-3 py-1.5 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            {selectedCategory && selectedAttributeForm ? (
              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-black">Cấu hình thuộc tính con</h2>
                  <p className="text-sm text-gray-500 mt-1">Đang chỉnh sửa: {selectedCategory.label}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhóm con</label>
                    <select
                      value={selectedAttributeForm.type}
                      onChange={e => handleChangeAttributeType(e.target.value as AttributeType)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                    >
                      <option value="grade">Cấp độ</option>
                      <option value="rarity">Độ hiếm</option>
                      <option value="custom">Tùy chỉnh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm con</label>
                    <input
                      type="text"
                      value={selectedAttributeForm.label}
                      onChange={e => updateSelectedAttributeForm(current => ({ ...current, label: e.target.value }))}
                      placeholder="Ví dụ: Cấp độ, Độ hiếm"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Giá trị con</h3>
                    <button
                      type="button"
                      onClick={() => updateSelectedAttributeForm(current => ({ ...current, options: [...current.options, ''] }))}
                      className="px-3 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/15 rounded-lg font-semibold"
                    >
                      + Thêm dòng
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedAttributeForm.options.map((option, index) => (
                      <div key={`${selectedCategory.id}-${index}`} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={e =>
                            updateSelectedAttributeForm(current => ({
                              ...current,
                              options: current.options.map((item, optionIndex) =>
                                optionIndex === index ? e.target.value : item
                              ),
                            }))
                          }
                          placeholder="Nhập giá trị"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSelectedAttributeForm(current => ({
                              ...current,
                              options: current.options.length > 1
                                ? current.options.filter((_, optionIndex) => optionIndex !== index)
                                : [''],
                            }))
                          }
                          className="px-3 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClearAttributes}
                    className="px-4 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    Xóa cấu hình
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAttributes}
                    disabled={savingAttributeId === selectedCategory.id}
                    className="px-5 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold disabled:opacity-60"
                  >
                    {savingAttributeId === selectedCategory.id ? 'Đang lưu...' : 'Lưu cấu hình'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-gray-500">Chọn một danh mục để chỉnh sửa thuộc tính con</div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-black mb-6">
              {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={e => handleCategoryNameChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={e => setCategoryForm(current => ({ ...current, slug: slugify(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                <input
                  type="text"
                  value={categoryForm.label}
                  onChange={e => setCategoryForm(current => ({ ...current, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={categoryForm.description || ''}
                  onChange={e => setCategoryForm(current => ({ ...current, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="px-6 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {savingCategory ? 'Đang lưu...' : editingCategory ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold text-black mb-2">Xóa danh mục</h2>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa danh mục <strong>{deleteConfirm.label}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-6 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
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
