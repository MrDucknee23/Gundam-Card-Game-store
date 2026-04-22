import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { fetchProducts, PRODUCTS_CACHE_KEY, PRODUCTS_UPDATED_EVENT } from '../utils/productApi';
import { getCached, invalidateCache } from '../utils/cache';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => getCached<Product[]>(PRODUCTS_CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => !getCached<Product[]>(PRODUCTS_CACHE_KEY));
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const loadProducts = useCallback(async (options?: { skipCache?: boolean; background?: boolean }) => {
    const skipCache = options?.skipCache ?? false;
    const background = options?.background ?? false;
    const cached = skipCache ? null : getCached<Product[]>(PRODUCTS_CACHE_KEY);

    if (cached) {
      setProducts(cached);
      if (!background) {
        setLoading(false);
      }
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const data = await fetchProducts();
      if (isMounted.current) {
        setProducts(data);
      }
    } catch (err) {
      if (isMounted.current) {
        if (!cached || skipCache) {
          setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
        }
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts({ background: true });
  }, [loadProducts]);

  useEffect(() => {
    const handleProductsUpdated = () => {
      const cachedProducts = getCached<Product[]>(PRODUCTS_CACHE_KEY);

      if (cachedProducts) {
        setProducts(cachedProducts);
        return;
      }

      void loadProducts({ skipCache: true, background: true });
    };

    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);
    };
  }, [loadProducts]);

  const refetch = useCallback(() => {
    invalidateCache(PRODUCTS_CACHE_KEY);
    return loadProducts({ skipCache: true });
  }, [loadProducts]);

  return { products, loading, error, refetch };
};