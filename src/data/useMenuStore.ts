import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/apis/productApi';
import {
  getProducts,
  createProduct,
  updateProduct,
  softDeleteProduct,
  hardDeleteProduct,
} from '@/apis/productApi';

// ── Hook dùng cho Menu Management page ──────────────────────────────────────
// Nguồn chính: BE API (GET /products)
export function useMenuStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Xóa localStorage cũ nếu tồn tại
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pos_menu_products');
    }

    // Fetch từ API
    getProducts()
      .then((apiProducts) => {
        setProducts(apiProducts);
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
    setProducts((prev) => [newProduct, ...prev]);
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
    setProducts((prev) => prev.map((p) => (p.productId === id ? updated : p)));
  }, []);

  const deactivateProduct = useCallback(async (id: number) => {
    await softDeleteProduct(id);
    setProducts((prev) =>
      prev.map((p) => (p.productId === id ? { ...p, isActive: false } : p))
    );
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    await hardDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.productId !== id));
  }, []);

  const toggleActive = useCallback(async (id: number) => {
    const target = products.find((p) => p.productId === id);
    if (!target) return;
    const updated = await updateProduct(id, { isActive: !target.isActive });
    setProducts((prev) => prev.map((p) => (p.productId === id ? updated : p)));
  }, [products]);

  return { products, loading, addProduct, editProduct, deactivateProduct, removeProduct, toggleActive };
}

// ── Helper dùng cho POS page ────────────────────────────────────────────────
// Lưu ý: Để lấy sản phẩm hoạt động ở POS page, hãy fetch từ API trực tiếp
// vì không có caching trong localStorage nữa.
// export function getActivePosProducts() {
//   return [].filter((p: any) => p.isActive)
//     .map((p: any) => ({
//       id: p.productId,
//       name: p.productName,
//       price: p.listPrice,
//       categoryId: String(p.categoryId),
//     }));
// }
