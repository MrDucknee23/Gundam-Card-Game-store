import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCategories } from '../hooks/useCategories';
import {
  clearCategoryAttributeGroup,
  updateCategoryAttributeGroup,
  type Category,
} from '../utils/categoryApi';

type AttributeType = 'grade' | 'rarity' | 'custom';

type EditorState = {
  type: AttributeType;
  label: string;
  options: string[];
};

const defaultOptionsByType: Record<Exclude<AttributeType, 'custom'>, string[]> = {
  grade: ['HG', 'RG', 'MG', 'PG'],
  rarity: ['Common', 'Rare', 'Super Rare', 'Ultra Rare'],
};

const getDefaultType = (category: Category): AttributeType => {
  if (category.attributeGroup?.key === 'grade') return 'grade';
  if (category.attributeGroup?.key === 'rarity') return 'rarity';
  if (category.attributeGroup?.key) return 'custom';
  if (category.slug === 'gundam') return 'grade';
  if (category.slug === 'pokemon' || category.slug === 'onepiece') return 'rarity';
  return 'custom';
};

const getDefaultLabel = (category: Category, type: AttributeType) => {
  if (category.attributeGroup?.label) return category.attributeGroup.label;
  if (type === 'grade') return 'Cấp độ';
  if (type === 'rarity') return 'Độ hiếm';
  return '';
};

const getDefaultOptions = (category: Category, type: AttributeType) => {
  const existing = category.attributeGroup?.options
    ?.filter((option) => option.isActive !== false)
    .map((option) => option.label)
    .filter(Boolean);

  if (existing && existing.length > 0) {
    return existing;
  }

  if (type === 'grade' || type === 'rarity') {
    return defaultOptionsByType[type];
  }

  return [''];
};

const buildInitialState = (category: Category): EditorState => {
  const type = getDefaultType(category);
  return {
    type,
    label: getDefaultLabel(category, type),
    options: getDefaultOptions(category, type),
  };
};

const slugify = (value: string) => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

export const AdminCategoryAttributes: React.FC = () => {
  const { categories, loading, error, reload } = useCategories();
  const [forms, setForms] = useState<Record<string, EditorState>>({});
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length === 0) {
      setForms({});
      setSelectedCategoryId('');
      return;
    }

    const nextState = categories.reduce<Record<string, EditorState>>((acc, category) => {
      acc[category.id] = buildInitialState(category);
      return acc;
    }, {});

    setForms(nextState);
    setSelectedCategoryId((current) => categories.some((category) => category.id === current) ? current : categories[0].id);
  }, [categories]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  const updateForm = (categoryId: string, updater: (current: EditorState) => EditorState) => {
    setForms((current) => ({
      ...current,
      [categoryId]: updater(current[categoryId] ?? { type: 'custom', label: '', options: [''] }),
    }));
  };

  const handleTypeChange = (nextType: AttributeType) => {
    if (!selectedCategory) return;

    updateForm(selectedCategory.id, (current) => ({
      ...current,
      type: nextType,
      label: current.label || getDefaultLabel(selectedCategory, nextType),
      options: current.options.some((item) => item.trim())
        ? current.options
        : getDefaultOptions(selectedCategory, nextType),
    }));
  };

  const handleSave = async () => {
    if (!selectedCategory) return;

    const form = forms[selectedCategory.id] ?? buildInitialState(selectedCategory);
    const cleanedLabel = form.label.trim();
    const cleanedOptions = Array.from(new Set(form.options.map((option) => option.trim()).filter(Boolean)));

    if (!cleanedLabel) {
      toast.error('Vui lòng nhập tên nhóm con');
      return;
    }

    if (cleanedOptions.length === 0) {
      toast.error('Vui lòng nhập ít nhất một giá trị con');
      return;
    }

    const resolvedKey = form.type === 'custom' ? slugify(cleanedLabel) || 'custom' : form.type;

    try {
      setSavingId(selectedCategory.id);
      await updateCategoryAttributeGroup(selectedCategory.id, {
        key: resolvedKey,
        label: cleanedLabel,
        isActive: true,
        options: cleanedOptions.map((option, index) => ({
          label: option,
          value: option,
          sortOrder: index,
          isActive: true,
        })),
      }, selectedCategory);
      toast.success(`Đã lưu ${cleanedLabel} cho ${selectedCategory.label}`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi lưu cấu hình');
    } finally {
      setSavingId(null);
    }
  };

  const handleClear = async () => {
    if (!selectedCategory) return;

    const confirmed = window.confirm(`Xóa toàn bộ cấu hình cấp con của ${selectedCategory.label}?`);
    if (!confirmed) return;

    try {
      setSavingId(selectedCategory.id);
      await clearCategoryAttributeGroup(selectedCategory.id, selectedCategory);
      toast.success(`Đã xóa cấu hình của ${selectedCategory.label}`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi xóa cấu hình');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-12">Đang tải cấu hình...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 py-12">{error}</p>;
  }

  if (!selectedCategory) {
    return <p className="text-center text-gray-500 py-12">Chưa có danh mục nào để cấu hình</p>;
  }

  const form = forms[selectedCategory.id] ?? buildInitialState(selectedCategory);
  const isSaving = savingId === selectedCategory.id;
  const hasConfig = Boolean(selectedCategory.attributeGroup?.label && selectedCategory.attributeGroup?.options?.length);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-black">Quản lý cấp độ và độ hiếm</h1>
        <p className="text-gray-500 mt-2">
          Chọn danh mục lớn, sau đó chỉnh sửa nhóm con bằng dạng bảng.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục lớn</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại nhóm con</label>
              <select
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value as AttributeType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
              >
                <option value="grade">Cấp độ</option>
                <option value="rarity">Độ hiếm</option>
                <option value="custom">Tùy chỉnh</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-2.5">
                <div>
                  <p className="text-xs text-gray-500">Slug</p>
                  <p className="text-sm font-medium text-black">{selectedCategory.slug}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${hasConfig ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {hasConfig ? 'Đã cấu hình' : 'Chưa cấu hình'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên nhóm con</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => updateForm(selectedCategory.id, (current) => ({ ...current, label: e.target.value }))}
              placeholder="Ví dụ: Cấp độ, Độ hiếm"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
            />
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-black">Bảng giá trị con</h2>
              <p className="text-sm text-gray-500">Thêm, sửa hoặc xóa các giá trị của danh mục đang chọn.</p>
            </div>
            <button
              type="button"
              onClick={() => updateForm(selectedCategory.id, (current) => ({ ...current, options: [...current.options, ''] }))}
              className="px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/15 rounded-lg font-semibold"
            >
              + Thêm dòng
            </button>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700 w-16">#</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Tên giá trị con</th>
                  <th className="text-right px-4 py-3 text-sm font-semibold text-gray-700 w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {form.options.map((option, index) => (
                  <tr key={`${selectedCategory.id}-${index}`} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateForm(selectedCategory.id, (current) => ({
                          ...current,
                          options: current.options.map((item, optionIndex) => optionIndex === index ? e.target.value : item),
                        }))}
                        placeholder="Ví dụ: HG, RG, MG"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => updateForm(selectedCategory.id, (current) => ({
                          ...current,
                          options: current.options.length > 1
                            ? current.options.filter((_, optionIndex) => optionIndex !== index)
                            : [''],
                        }))}
                        className="px-3 py-2 text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-5">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Xóa cấu hình
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
