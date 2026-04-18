import { Product, ProductCategory } from '../types/product';
import { buildApiUrl } from './api';

const API_URL = buildApiUrl('/products');

type ApiProduct = Partial<Product> & {
  _id?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

export interface ProductPayload {
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  stock: number;
  images: string[];
  grade?: string;
  rarity?: string;
  subCategoryKey?: string;
  subCategoryValue?: string;
  scale?: string;
  material?: string;
  cardType?: string;
  featured?: boolean;
}

const getErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    return data.message || 'Yeu cau san pham that bai';
  } catch {
    return 'Yeu cau san pham that bai';
  }
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });
  } catch {
    throw new Error('Khong the ket noi den may chu san pham');
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const normalizeImages = (images: unknown): string[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images.filter((image): image is string => typeof image === 'string' && image.trim() !== '');
};

export const mapApiProduct = (product: ApiProduct): Product => ({
  id: product.id || product._id || '',
  name: product.name || '',
  category: (product.category || 'gundam') as ProductCategory,
  price: Number(product.price) || 0,
  description: product.description || '',
  stock: Number(product.stock) || 0,
  images: normalizeImages(product.images),
  grade: product.grade || undefined,
  rarity: product.rarity || undefined,
  subCategoryKey: product.subCategoryKey || undefined,
  subCategoryValue: product.subCategoryValue || undefined,
  scale: product.scale || undefined,
  material: product.material || undefined,
  cardType: product.cardType || undefined,
  featured: Boolean(product.featured),
});

export const fetchProducts = async (): Promise<Product[]> => {
  const products = await requestJson<ApiProduct[]>(API_URL);
  return products.map(mapApiProduct);
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const product = await requestJson<ApiProduct>(`${API_URL}/${id}`);
  return mapApiProduct(product);
};

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  const product = await requestJson<ApiProduct>(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return mapApiProduct(product);
};

export const updateProduct = async (id: string, payload: ProductPayload): Promise<Product> => {
  const product = await requestJson<ApiProduct>(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  return mapApiProduct(product);
};

export const deleteProduct = async (id: string) => {
  await requestJson<{ message: string }>(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
};