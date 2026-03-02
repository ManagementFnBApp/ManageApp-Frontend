import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/apis/productApi';
import { getProducts, createProduct, updateProduct, softDeleteProduct, hardDeleteProduct } from '@/apis/productApi';
import { MENU_CATEGORIES } from '@/data/mockMenu';

// localStorage chỉ dùng để cache - tránh mất data khi refresh nhanh
const STORAGE_KEY = 'pos_menu_products';

function saveToStorage(products: Product[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadFromCache(): Product[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Product[];
  } catch { /* ignore */ }
  return null;
}

// ── Hook dùng cho Menu Management page ──────────────────────────────────────
// Nguồn chính: BE API (GET /products)
// Cache: localStorage chỉ dùng để hiển thị nhanh trong khi chờ API
export function useMenuStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hiển thị cache trước để UI không trống trong khi chờ
    const cached = loadFromCache();
    if (cached) setProducts(cached);

    // Fetch từ API — nguồn chính
    getProducts()
      .then((apiProducts) => {
        setProducts(apiProducts);
        saveToStorage(apiProducts); // cập nhật cache
        setError(null);
      })
      .catch(() => {
        setError('Không thể tải danh sách sản phẩm từ máy chủ.');
      })
      .finally(() => setLoading(false));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    getProducts()
      .then((apiProducts) => {
        setProducts(apiProducts);
        saveToStorage(apiProducts);
        setError(null);
      })
      .catch(() => setError('Không thể tải danh sách sản phẩm từ máy chủ.'))
      .finally(() => setLoading(false));
  }, []);

  const addProduct = useCallback(async (payload: Omit<Product, 'productId' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = await createProduct({
      categoryId: payload.categoryId,
      productName: payload.productName,
      sku: payload.sku,
      barcode: payload.barcode ?? undefined,
      description: payload.description ?? undefined,
      measureUnit: payload.measureUnit ?? undefined,
      importPrice: payload.importPrice,
      listPrice: payload.listPrice,
      isActive: payload.isActive,
    });
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      saveToStorage(next);
      return next;
    });
    return newProduct;
  }, []);

  const editProduct = useCallback(async (id: number, changes: Partial<Product>) => {
    const updated = await updateProduct(id, {
      categoryId: changes.categoryId,
      productName: changes.productName,
      sku: changes.sku,
      barcode: changes.barcode ?? undefined,
      description: changes.description ?? undefined,
      measureUnit: changes.measureUnit ?? undefined,
      importPrice: changes.importPrice,
      listPrice: changes.listPrice,
      isActive: changes.isActive,
    });
    setProducts((prev) => {
      const next = prev.map((p) => (p.productId === id ? updated : p));
      saveToStorage(next);
      return next;
    });
  }, []);

  const deactivateProduct = useCallback(async (id: number) => {
    await softDeleteProduct(id);
    setProducts((prev) => {
      const next = prev.map((p) => (p.productId === id ? { ...p, isActive: false } : p));
      saveToStorage(next);
      return next;
    });
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    await hardDeleteProduct(id);
    setProducts((prev) => {
      const next = prev.filter((p) => p.productId !== id);
      saveToStorage(next);
      return next;
    });
  }, []);

  const toggleActive = useCallback(async (id: number) => {
    const target = products.find((p) => p.productId === id);
    if (!target) return;
    const updated = await updateProduct(id, { isActive: !target.isActive });
    setProducts((prev) => {
      const next = prev.map((p) => (p.productId === id ? updated : p));
      saveToStorage(next);
      return next;
    });
  }, [products]);

  return { products, loading, error, refresh, addProduct, editProduct, deactivateProduct, removeProduct, toggleActive };
}
