import { Product } from '../types/product';

const WISHLIST_STORAGE_KEY = 'wishlist';

type LegacyWishlistEntry = string | { id?: string; _id?: string };

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const normalizeWishlistIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  const ids = value
    .map((entry): string => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (isRecord(entry)) {
        const id = typeof entry.id === 'string' ? entry.id : typeof entry._id === 'string' ? entry._id : '';
        return id.trim();
      }

      return '';
    })
    .filter(Boolean);

  return Array.from(new Set(ids));
};

export const getWishlistIds = (): string[] => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    const ids = normalizeWishlistIds(raw ? JSON.parse(raw) as LegacyWishlistEntry[] : []);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(ids));
    return ids;
  } catch {
    return [];
  }
};

export const setWishlistIds = (ids: string[]) => {
  const normalized = Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event('wishlist-updated'));
};

export const isWishlisted = (productId?: string) => {
  if (!productId?.trim()) {
    return false;
  }

  return getWishlistIds().includes(productId.trim());
};

export const toggleWishlist = (productId?: string) => {
  const normalizedId = productId?.trim();

  if (!normalizedId) {
    throw new Error('San pham khong hop le');
  }

  const ids = getWishlistIds();
  const exists = ids.includes(normalizedId);

  if (exists) {
    setWishlistIds(ids.filter((id) => id !== normalizedId));
    return false;
  }

  setWishlistIds([normalizedId, ...ids]);
  return true;
};

export const resolveWishlistProducts = (products: Product[]) => {
  const ids = getWishlistIds();
  const productMap = new Map(products.map((product) => [product.id, product]));
  return ids.map((id) => productMap.get(id)).filter((product): product is Product => Boolean(product));
};
