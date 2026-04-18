import { buildApiUrl } from './api';

const API_URL = buildApiUrl('/categories');

export interface CategoryAttributeOption {
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryAttributeGroup {
  key: string;
  label: string;
  options: CategoryAttributeOption[];
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  label: string;
  description: string;
  attributeGroup?: CategoryAttributeGroup;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  label: string;
  description?: string;
  attributeGroup?: CategoryAttributeGroupPayload | null;
}

export interface CategoryAttributeGroupPayload {
  key: string;
  label: string;
  options: CategoryAttributeOption[];
  isActive?: boolean;
}

const getErrorMessage = async (response: Response, fallback: string) => {
  const err = await response.json().catch(() => ({ message: fallback }));
  return err.message || fallback;
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Không thể tải danh mục');
  return res.json();
}

export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Lỗi tạo danh mục'));
  }
  return res.json();
}

export async function updateCategory(id: string, payload: CategoryPayload): Promise<Category> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Lỗi cập nhật danh mục'));
  }
  return res.json();
}

export async function updateCategoryAttributeGroup(id: string, payload: CategoryAttributeGroupPayload, category: Pick<Category, 'name' | 'slug' | 'label' | 'description'>): Promise<Category> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: category.name,
      slug: category.slug,
      label: category.label,
      description: category.description,
      attributeGroup: payload,
    }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Lỗi lưu nhóm thuộc tính con'));
  }
  return res.json();
}

export async function clearCategoryAttributeGroup(id: string, category: Pick<Category, 'name' | 'slug' | 'label' | 'description'>): Promise<Category> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: category.name,
      slug: category.slug,
      label: category.label,
      description: category.description,
      attributeGroup: null,
    }),
  });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Lỗi xóa nhóm thuộc tính con'));
  }
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(await getErrorMessage(res, 'Lỗi xóa danh mục'));
  }
}
