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

<<<<<<< HEAD
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
=======
  const load = useCallback(async (options?: { skipCache?: boolean; background?: boolean }) => {
    const skipCache = options?.skipCache ?? false;
    const background = options?.background ?? false;
    const cached = skipCache ? null : getCached<Category[]>(CACHE_KEY);

    if (cached) {
      setCategories(cached);
      if (!background) {
        setLoading(false);
      }
    } else {
      setLoading(true);
    }

    try {
>>>>>>> main
      setError(null);
      const data = await fetchCategories();
      if (isMounted.current) {
        setCategories(data);
        setCache(CACHE_KEY, data);
      }
    } catch (err) {
      if (isMounted.current) {
<<<<<<< HEAD
        setError(err instanceof Error ? err.message : 'Lỗi tải danh mục');
=======
        if (!cached || skipCache) {
          setError(err instanceof Error ? err.message : 'Lỗi tải danh mục');
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
    load();
=======
    load({ background: true });
>>>>>>> main
  }, [load]);

  const reload = useCallback(() => {
    invalidateCache(CACHE_KEY);
<<<<<<< HEAD
    return load(true);
=======
    return load({ skipCache: true });
>>>>>>> main
  }, [load]);

  return { categories, loading, error, reload };
}
