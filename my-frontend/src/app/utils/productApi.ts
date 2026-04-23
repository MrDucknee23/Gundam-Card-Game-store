import { Product, ProductCategory } from '../types/product';
import { buildApiUrl, resolveMediaUrl } from './api';
import { getCached, invalidateCache, setCache } from './cache';

const API_URL = buildApiUrl('/products');
const UPLOAD_API_URL = buildApiUrl('/upload');
export const PRODUCTS_CACHE_KEY = 'products';
export const PRODUCTS_UPDATED_EVENT = 'products-updated';

type ApiProduct = Partial<Product> & {
  _id?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
};

type UploadResponse = {
  files?: string[];
};

export type ProductCategoryDistribution = {
  totalProducts: number;
  categories: {
    gundam: number;
    pokemon: number;
    onepiece: number;
  };
  gundamGrades: {
    HG: number;
    MG: number;
    RG: number;
    PG: number;
  };
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

    if (response.status === 413) {
      return data.message || 'Du lieu hinh anh qua lon. Vui long giam kich thuoc hoac so luong hinh anh';
    }

    if (response.status >= 500) {
      return data.message || 'May chu san pham dang gap loi';
    }

    return data.message || 'Yeu cau san pham that bai';
  } catch {
    if (response.status === 413) {
      return 'Du lieu hinh anh qua lon. Vui long giam kich thuoc hoac so luong hinh anh';
    }

    return 'Yeu cau san pham that bai';
  }
};

const requestJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  let response: Response;
  const isFormDataBody = typeof FormData !== 'undefined' && init?.body instanceof FormData;

  try {
    response = await fetch(url, {
      headers: isFormDataBody
        ? init?.headers
        : {
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

  return Array.from(
    new Set(images.filter((image): image is string => typeof image === 'string' && image.trim() !== '').map((image) => image.trim()))
  );
};

const normalizeUploadedImagePath = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return '';
  }

  const uploadsSegmentIndex = trimmedValue.indexOf('/uploads/');
  const normalizedValue = uploadsSegmentIndex >= 0 ? trimmedValue.slice(uploadsSegmentIndex) : trimmedValue;
  const withoutQuery = normalizedValue.split('?')[0].split('#')[0].replace(/\\/g, '/');
  const dedupedSlashes = withoutQuery.replace(/\/+/g, '/');

  return dedupedSlashes.startsWith('/uploads/') ? dedupedSlashes : '';
};

const isBase64Image = (value: string) => /^data:image\//i.test(value.trim());

const extensionByMimeType: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const dataUrlToFile = async (dataUrl: string, index: number) => {
  const mimeTypeMatch = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/i);
  const mimeType = mimeTypeMatch?.[1] || 'image/png';
  const extension = extensionByMimeType[mimeType] || 'png';
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  return new File([blob], `legacy-image-${Date.now()}-${index}.${extension}`, { type: mimeType });
};

const normalizeProductId = (product: ApiProduct) => {
  const candidateId = typeof product.id === 'string' && product.id.trim() !== ''
    ? product.id.trim()
    : typeof product._id === 'string' && product._id.trim() !== ''
      ? product._id.trim()
      : '';

  return candidateId;
};

export const getCachedProducts = () => getCached<Product[]>(PRODUCTS_CACHE_KEY);

export const setProductsCache = (products: Product[]) => {
  setCache(PRODUCTS_CACHE_KEY, products);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
  }
};

export const invalidateProductsCache = () => {
  invalidateCache(PRODUCTS_CACHE_KEY);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
  }
};

export const syncCachedProductStocks = (updatedStocks: Array<{ productId: string; stock: number }>) => {
  const cachedProducts = getCachedProducts();

  if (!cachedProducts || updatedStocks.length === 0) {
    invalidateProductsCache();
    return null;
  }

  const stockByProductId = new Map(
    updatedStocks.map((item) => [item.productId, Math.max(0, Number(item.stock) || 0)])
  );

  const nextProducts = cachedProducts.map((product) => {
    if (!stockByProductId.has(product.id)) {
      return product;
    }

    return {
      ...product,
      stock: stockByProductId.get(product.id) || 0,
    };
  });

  setProductsCache(nextProducts);
  return nextProducts;
};

const upsertCachedProduct = (nextProduct: Product) => {
  const cachedProducts = getCachedProducts();

  if (!cachedProducts) {
    invalidateProductsCache();
    return;
  }

  const nextProducts = [nextProduct, ...cachedProducts.filter((product) => product.id !== nextProduct.id)];
  setProductsCache(nextProducts);
};

const removeCachedProduct = (productId: string) => {
  const cachedProducts = getCachedProducts();

  if (!cachedProducts) {
    invalidateProductsCache();
    return;
  }

  setProductsCache(cachedProducts.filter((product) => product.id !== productId));
};

export const mapApiProduct = (product: ApiProduct): Product => ({
  id: normalizeProductId(product),
  name: product.name || '',
  category: (product.category || 'gundam') as ProductCategory,
  price: Number(product.price) || 0,
  description: product.description || '',
  stock: Number(product.stock) || 0,
  images: normalizeImages(product.images).map(resolveMediaUrl).filter((image) => image !== ''),
  grade: product.grade || undefined,
  rarity: product.rarity || undefined,
  subCategoryKey: product.subCategoryKey || undefined,
  subCategoryValue: product.subCategoryValue || undefined,
  scale: product.scale || undefined,
  material: product.material || undefined,
  cardType: product.cardType || undefined,
  featured: Boolean(product.featured),
});

export const uploadProductFiles = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => {
    formData.append('image', file);
  });

  const response = await requestJson<UploadResponse>(UPLOAD_API_URL, {
    method: 'POST',
    body: formData,
  });

  return normalizeImages(response.files)
    .map(normalizeUploadedImagePath)
    .filter((path) => path !== '')
    .map(resolveMediaUrl)
    .filter((path) => path !== '');
};

export const ensureUploadedProductImages = async (images: string[]): Promise<string[]> => {
  const normalizedImages = normalizeImages(images);
  const pendingLegacyImages: Array<{ image: string; outputIndex: number }> = [];
  const orderedImages: string[] = [];

  normalizedImages.forEach((image) => {
    const normalizedPath = normalizeUploadedImagePath(image);

    if (normalizedPath) {
      orderedImages.push(normalizedPath);
      return;
    }

    if (isBase64Image(image)) {
      pendingLegacyImages.push({ image, outputIndex: orderedImages.length });
      orderedImages.push('');
    }
  });

  if (pendingLegacyImages.length === 0) {
    return Array.from(new Set(orderedImages.filter((image) => image !== '')));
  }

  const legacyFiles = await Promise.all(
    pendingLegacyImages.map(({ image }, index) => dataUrlToFile(image, index))
  );
  const uploadedPaths = await uploadProductFiles(legacyFiles);

  pendingLegacyImages.forEach(({ outputIndex }, index) => {
    orderedImages[outputIndex] = uploadedPaths[index] || '';
  });

  return Array.from(new Set(orderedImages.filter((image) => image !== '')));
};

export const fetchProducts = async (): Promise<Product[]> => {
  const products = await requestJson<ApiProduct[]>(API_URL);
  const mappedProducts = products
    .map(mapApiProduct)
    .filter((product) => product.id !== '');

  setProductsCache(mappedProducts);
  return mappedProducts;
};

export const fetchProductCategoryDistribution = async (): Promise<ProductCategoryDistribution> => {
  return requestJson<ProductCategoryDistribution>(`${API_URL}/stats/category-distribution`);
};

export const fetchProductById = async (id: string): Promise<Product> => {
  const product = await requestJson<ApiProduct>(`${API_URL}/${id}`);
  return mapApiProduct(product);
};

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  const normalizedImages = await ensureUploadedProductImages(payload.images);
  const product = await requestJson<ApiProduct>(API_URL, {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      images: normalizedImages,
    }),
  });

  const mappedProduct = mapApiProduct(product);
  upsertCachedProduct(mappedProduct);
  return mappedProduct;
};

export const updateProduct = async (id: string, payload: ProductPayload): Promise<Product> => {
  const normalizedImages = await ensureUploadedProductImages(payload.images);
  const product = await requestJson<ApiProduct>(`${API_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...payload,
      images: normalizedImages,
    }),
  });

  const mappedProduct = mapApiProduct(product);
  upsertCachedProduct(mappedProduct);
  return mappedProduct;
};

export const deleteProduct = async (id: string) => {
  await requestJson<{ message: string }>(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  removeCachedProduct(id);
};