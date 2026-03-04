import { useState, useEffect, useCallback } from "react";
import {
  getProducts,
  createProduct,
  updateProduct,
  softDeleteProduct,
  hardDeleteProduct,
  type Product,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/apis/productApi";

// ── Hook dùng cho Menu Management page (kết nối thẳng BE) ───────────────────
export function useMenuStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (payload: CreateProductPayload) => {
      const created = await createProduct(payload);
      setProducts((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const editProduct = useCallback(
    async (id: number, changes: UpdateProductPayload) => {
      const updated = await updateProduct(id, changes);
      setProducts((prev) =>
        prev.map((p) => (p.productId === id ? updated : p)),
      );
      return updated;
    },
    [],
  );

  const deactivateProduct = useCallback(async (id: number) => {
    await softDeleteProduct(id);
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === id ? { ...p, isActive: false } : p,
      ),
    );
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    await hardDeleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.productId !== id));
  }, []);

  const toggleActive = useCallback(
    async (id: number) => {
      const current = products.find((p) => p.productId === id);
      if (!current) return;

      const updated = await updateProduct(id, {
        isActive: !current.isActive,
      });

      setProducts((prev) =>
        prev.map((p) => (p.productId === id ? updated : p)),
      );
    },
    [products],
  );

  const refresh = useCallback(() => {
    void fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh,
    addProduct,
    editProduct,
    deactivateProduct,
    removeProduct,
    toggleActive,
  };
}

// ── Helper dùng cho POS page ────────────────────────────────────────────────
export async function getActivePosProducts() {
  const products = await getProducts(true);
  return products
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      name: p.productName,
      price: p.listPrice,
      categoryId: p.categoryId,
    }));
}
