import { useState, useEffect, useCallback } from "react";
import {
  getShopProducts,
  createShopProduct,
  updateShopProduct,
  deleteShopProduct,
  type Product,
  type CreateShopProductPayload,
  type UpdateShopProductPayload,
} from "@/apis/shopProductApi";

// ── Hook dùng cho Menu Management page (kết nối thẳng BE) ───────────────────
export function useMenuStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShopProducts();
      setProducts(data);
      setError(null);
    } catch (err: any) {
      const status = err?.status ?? err?.originalError?.response?.status;
      const msg = err?.message ?? err?.originalError?.message;
      if (status === 500 || msg?.toLowerCase?.().includes("internal server error")) {
        setError("Máy chủ trả lỗi 500. Chạy backend (port 2999) rồi bấm Thử lại.");
      } else {
        setError(msg ?? "Không thể tải danh sách sản phẩm.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = useCallback(
    async (payload: CreateShopProductPayload) => {
      const created = await createShopProduct(payload);
      setProducts((prev) => [created, ...prev]);
      return created;
    },
    [],
  );

  const editProduct = useCallback(
    async (id: number, changes: UpdateShopProductPayload) => {
      const updated = await updateShopProduct(id, changes);
      setProducts((prev) =>
        prev.map((p) => (p.productId === id ? updated : p)),
      );
      return updated;
    },
    [],
  );

  const deactivateProduct = useCallback(async (id: number) => {
    await deleteShopProduct(id);
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === id ? { ...p, isActive: false } : p,
      ),
    );
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    await deleteShopProduct(id);
    setProducts((prev) => prev.filter((p) => p.productId !== id));
  }, []);

  const toggleActive = useCallback(
    async (id: number) => {
      const current = products.find((p) => p.productId === id);
      if (!current) return;

      const nextIsActive = !current.isActive;

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === id ? { ...p, isActive: nextIsActive } : p,
        ),
      );

      try {
        const updated = await updateShopProduct(id, {
          categoryId: current.categoryId,
          productName: current.productName,
          barcode: current.barcode ?? undefined,
          description: current.description ?? undefined,
          measureUnit: current.measureUnit ?? undefined,
          listPrice: current.listPrice,
          importPrice: current.importPrice,
          isActive: nextIsActive,
        });

        setProducts((prev) =>
          prev.map((p) => (p.productId === id ? updated : p)),
        );
      } catch (err) {
        console.error("Toggle active failed:", err);
        setProducts((prev) =>
          prev.map((p) =>
            p.productId === id ? { ...p, isActive: current.isActive } : p,
          ),
        );
        throw err;
      }
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

/**
 * Helper dùng cho POS page.
 * Lấy sản phẩm active của shop (SHOPOWNER + STAFF đều có quyền).
 * shopProductId dùng để gửi shop_product_id khi tạo đơn hàng.
 */
export async function getActivePosProducts() {
  const products = await getShopProducts(true);
  return products
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.productId,
      shopProductId: p.productId,
      name: p.productName,
      price: p.listPrice,
      categoryId: p.categoryId,
    }));
}
