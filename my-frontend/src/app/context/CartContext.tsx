import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode, useEffect, useRef } from 'react';
import { Product } from '../types/product';
import { getCachedProducts, PRODUCTS_UPDATED_EVENT } from '../utils/productApi';
import { CART_CLEAR_EVENT, CART_USER_LOGIN_EVENT } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
}

type CartMutationResult = {
  ok: boolean;
  message?: string;
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => CartMutationResult;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => CartMutationResult;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getAvailableStock: (product: Product) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_STORAGE_KEY = 'cart_items';

const readStoredCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readUserCartItems = (userId: string): CartItem[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`${CART_STORAGE_KEY}_${userId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => readStoredCartItems());
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    if (userIdRef.current) {
      localStorage.setItem(`${CART_STORAGE_KEY}_${userIdRef.current}`, JSON.stringify(items));
    }
  }, [items]);

  useEffect(() => {
    const handleProductsUpdated = () => {
      const cachedProducts = getCachedProducts();
      if (!cachedProducts) {
        return;
      }

      const productsById = new Map(cachedProducts.map((product) => [product.id, product]));
      setItems((currentItems) => currentItems.flatMap((item) => {
        const latestProduct = productsById.get(item.product.id);

        if (!latestProduct || latestProduct.stock <= 0) {
          return [];
        }

        return [{
          product: latestProduct,
          quantity: Math.min(item.quantity, latestProduct.stock),
        }];
      }));
    };

    const handleCartClear = () => {
      setItems(prevItems => {
        // Save current cart to user-specific key before clearing
        if (userIdRef.current && prevItems.length > 0) {
          localStorage.setItem(`${CART_STORAGE_KEY}_${userIdRef.current}`, JSON.stringify(prevItems));
        }
        userIdRef.current = null;
        return [];
      });
    };

    const handleCartUserLogin = (e: Event) => {
      const userId = (e as CustomEvent<{ userId: string }>).detail?.userId;
      if (!userId) return;
      userIdRef.current = userId;
      const userCart = readUserCartItems(userId);
      if (userCart.length > 0) {
        setItems(userCart);
      }
    };

    window.addEventListener(CART_CLEAR_EVENT, handleCartClear);
    window.addEventListener(CART_USER_LOGIN_EVENT, handleCartUserLogin);
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);

    return () => {
      window.removeEventListener(CART_CLEAR_EVENT, handleCartClear);
      window.removeEventListener(CART_USER_LOGIN_EVENT, handleCartUserLogin);
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, handleProductsUpdated);
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    if (product.stock <= 0) {
      return { ok: false, message: 'Sản phẩm này đã hết hàng' };
    }

    let result: CartMutationResult = { ok: true };

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity;

        if (nextQuantity > product.stock) {
          result = { ok: false, message: `Bạn chỉ có thể thêm tối đa ${product.stock} sản phẩm này` };
          return prevItems;
        }

        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, product, quantity: nextQuantity }
            : item
        );
      }

      if (quantity > product.stock) {
        result = { ok: false, message: `Bạn chỉ có thể thêm tối đa ${product.stock} sản phẩm này` };
        return prevItems;
      }
      
      return [...prevItems, { product, quantity }];
    });

    return result;
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { ok: true };
    }

    let result: CartMutationResult = { ok: true };
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id !== productId) {
          return item;
        }

        if (quantity > item.product.stock) {
          result = { ok: false, message: `Số lượng tối đa còn lại là ${item.product.stock}` };
          return { ...item, quantity: item.product.stock };
        }

        return { ...item, quantity };
      })
    );

    return result;
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getAvailableStock = useCallback((product: Product): number => {
    const cartItem = items.find(item => item.product.id === product.id);
    const inCart = cartItem ? cartItem.quantity : 0;
    return Math.max(0, product.stock - inCart);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice,
      getAvailableStock,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems, getTotalPrice, getAvailableStock]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};