import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/apis/productApi';
import { MOCK_MENU_PRODUCTS, MENU_CATEGORIES } from '@/data/mockMenu';

const STORAGE_KEY = 'pos_menu_products';

function loadFromStorage(): Product[] {
  if (typeof window === 'undefined') return MOCK_MENU_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }
  return MOCK_MENU_PRODUCTS;
}

function saveToStorage(products: Product[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

// ── Hook dùng cho Menu Management page ──────────────────────────────────────
export function useMenuStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setProducts(loadFromStorage());
    setLoading(false);
  }, []);

  const persist = useCallback((next: Product[]) => {
    setProducts(next);
    saveToStorage(next);
  }, []);

  const addProduct = useCallback((payload: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...payload,
      productId: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    persist([newProduct, ...loadFromStorage()]);
    return newProduct;
  }, [persist]);

  const editProduct = useCallback((id: number, changes: Partial<Product>) => {
    const next = loadFromStorage().map((p) =>
      p.productId === id ? { ...p, ...changes, updatedAt: new Date().toISOString() } : p
    );
    persist(next);
  }, [persist]);

  const deactivateProduct = useCallback((id: number) => {
    const next = loadFromStorage().map((p) =>
      p.productId === id ? { ...p, isActive: false, updatedAt: new Date().toISOString() } : p
    );
    persist(next);
  }, [persist]);

  const removeProduct = useCallback((id: number) => {
    const next = loadFromStorage().filter((p) => p.productId !== id);
    persist(next);
  }, [persist]);

  const toggleActive = useCallback((id: number) => {
    const next = loadFromStorage().map((p) =>
      p.productId === id ? { ...p, isActive: !p.isActive, updatedAt: new Date().toISOString() } : p
    );
    persist(next);
  }, [persist]);

  return { products, loading, addProduct, editProduct, deactivateProduct, removeProduct, toggleActive };
}

// ── Helper dùng cho POS page (đọc 1 lần) ────────────────────────────────────
export function getActivePosProducts() {
  return loadFromStorage()
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      name: p.productName,
      price: p.unitPrice,
      categoryId: MENU_CATEGORIES.find((c) => c.id === p.categoryId)?.slug ?? 'other',
    }));
}
