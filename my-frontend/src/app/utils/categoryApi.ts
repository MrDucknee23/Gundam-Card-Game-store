import { buildApiUrl } from './api';

const API_URL = buildApiUrl('/categories');

export interface Category {
  id: string;
  name: string;
  slug: string;
  label: string;
  description: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  label: string;
  description?: string;
}

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
    const err = await res.json().catch(() => ({ message: 'Lỗi tạo danh mục' }));
    throw new Error(err.message);
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
    const err = await res.json().catch(() => ({ message: 'Lỗi cập nhật danh mục' }));
    throw new Error(err.message);
  }
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Lỗi xóa danh mục' }));
    throw new Error(err.message);
  }
}
