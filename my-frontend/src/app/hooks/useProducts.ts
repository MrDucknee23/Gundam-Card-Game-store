import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { fetchProducts } from '../utils/productApi';
import { getCached, setCache, invalidateCache } from '../utils/cache';

const CACHE_KEY = 'products';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(() => getCached<Product[]>(CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => !getCached<Product[]>(CACHE_KEY));
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

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
      setError(null);
      const data = await fetchProducts();
      if (isMounted.current) {
        setProducts(data);
        setCache(CACHE_KEY, data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Không thể tải sản phẩm');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refetch = useCallback(() => {
    invalidateCache(CACHE_KEY);
    return loadProducts(true);
  }, [loadProducts]);

  return { products, loading, error, refetch };
};