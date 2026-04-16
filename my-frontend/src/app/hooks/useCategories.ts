import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchCategories, type Category } from '../utils/categoryApi';
import { getCached, setCache, invalidateCache } from '../utils/cache';

const CACHE_KEY = 'categories';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(() => getCached<Category[]>(CACHE_KEY) ?? []);
  const [loading, setLoading] = useState(() => !getCached<Category[]>(CACHE_KEY));
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const load = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cached = getCached<Category[]>(CACHE_KEY);
      if (cached) {
        setCategories(cached);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      if (isMounted.current) {
        setCategories(data);
        setCache(CACHE_KEY, data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Lỗi tải danh mục');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    invalidateCache(CACHE_KEY);
    return load(true);
  }, [load]);

  return { categories, loading, error, reload };
}
