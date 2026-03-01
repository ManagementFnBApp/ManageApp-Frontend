import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/apis/productApi';
import { MOCK_MENU_PRODUCTS, MENU_CATEGORIES } from '@/data/mockMenu';

const STORAGE_KEY = 'pos_menu_products';
const CATEGORIES_STORAGE_KEY = 'pos_menu_categories';

export interface MenuCategory {
  id: number;
  slug: string;
  label: string;
}

function loadCustomCategories(): MenuCategory[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MenuCategory[];
  } catch { /* ignore */ }
  return [];
}

function saveCustomCategories(cats: MenuCategory[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(cats));
}

/** Danh sách loại sản phẩm: mặc định + loại thêm mới (lưu localStorage) */
export function getCategories(): MenuCategory[] {
  const custom = loadCustomCategories();
  const builtIn: MenuCategory[] = MENU_CATEGORIES.map((c) => ({ id: c.id, slug: c.slug, label: c.label }));
  return [...builtIn, ...custom];
}

/** Thêm loại sản phẩm mới (tên hiển thị). Trả về category vừa tạo. */
export function addCategory(label: string): MenuCategory {
  const trimmed = label.trim();
  if (!trimmed) throw new Error('Tên loại sản phẩm không được trống.');
  const all = getCategories();
  const maxId = all.length ? Math.max(...all.map((c) => c.id)) : 0;
  const nextId = maxId + 1;
  const slug = 'cat-' + nextId;
  const custom = loadCustomCategories();
  const newCat: MenuCategory = { id: nextId, slug, label: trimmed };
  saveCustomCategories([...custom, newCat]);
  return newCat;
}

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
  const categories = getCategories();
  return loadFromStorage()
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      name: p.productName,
      price: p.unitPrice,
      categoryId: categories.find((c) => c.id === p.categoryId)?.slug ?? 'other',
    }));
}
