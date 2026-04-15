import { useState, useEffect } from 'react';
import { Product, ProductCategory, GundamGrade, CardRarity } from '../data/products';

const API_URL = 'http://localhost:5000';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        // MongoDB dùng _id, map lại thành id cho frontend dùng được
        const mapped = data.map((p: any) => ({ ...p, id: p.id || p._id }));
        setProducts(mapped);
        setLoading(false);
      })
      .catch(err => {
        setError('Không thể tải sản phẩm');
        setLoading(false);
      });
  }, []);

  return { products, loading, error };
};