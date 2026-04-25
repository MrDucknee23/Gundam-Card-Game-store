import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
<<<<<<< HEAD
import { fetchProducts } from '../utils/productApi';
import { getCached, setCache, invalidateCache } from '../utils/cache';

const CACHE_KEY = 'products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => getCached<Product[]>(CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => !getCached<Product[]>(CACHE_KEY));
=======
import { fetchProducts, PRODUCTS_CACHE_KEY, PRODUCTS_UPDATED_EVENT } from '../utils/productApi';
import { getCached, invalidateCache } from '../utils/cache';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => getCached<Product[]>(PRODUCTS_CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => !getCached<Product[]>(PRODUCTS_CACHE_KEY));
>>>>>>> main
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

<<<<<<< HEAD
  const loadProducts = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = getCached<Product[]>(CACHE_KEY);
      if (cached) {
        setProducts(cached);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
=======
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
>>>>>>> main
      setError(null);
      const data = await fetchProducts();
      if (isMounted.current) {
        setProducts(data);
<<<<<<< HEAD
        setCache(CACHE_KEY, data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
=======
      }
    } catch (err) {
      if (isMounted.current) {
        if (!cached || skipCache) {
          setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
        }
>>>>>>> main
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
<<<<<<< HEAD
    loadProducts();
  }, [loadProducts]);

  const refetch = useCallback(() => {
    invalidateCache(CACHE_KEY);
    return loadProducts(true);
=======
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
>>>>>>> main
  }, [loadProducts]);

  return { products, loading, error, refetch };
};