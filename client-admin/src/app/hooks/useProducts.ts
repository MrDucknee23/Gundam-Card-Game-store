import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Product, ProductCategory, GundamGrade, CardRarity } from '../data/products';

const API_URL = 'http://localhost:5000';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useContext(AuthContext);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let res;
        if (user && user.token) {
          res = await fetch(`${API_URL}/api/products`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } else {
          res = await fetch(`${API_URL}/api/products`);
        }
        const data = await res.json();
        const mapped = data.map((p: any) => ({ ...p, id: p.id || p._id }));
        setProducts(mapped);
      } catch {
        setError('Không thể tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  return { products, loading, error };
};