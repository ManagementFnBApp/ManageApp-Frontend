import { useState, useEffect, useCallback, useRef } from "react";
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
  const retryRef = useRef(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getShopProducts();
      setProducts(data);
      setError(null);
      retryRef.current = 0;
    } catch (err: any) {
      const status = err?.status ?? err?.originalError?.response?.status;
      const msg = err?.message ?? err?.originalError?.message;
      if (status === 500 || msg?.toLowerCase?.().includes("internal server error")) {
        setError("Máy chủ trả lỗi 500. Chạy backend (port 2999) rồi bấm Thử lại.");
      } else {
        setError(msg ?? "Không thể tải danh sách sản phẩm.");
      }
      if (status === 403 && retryRef.current < 3) {
        retryRef.current += 1;
        // Backend vừa activate subscription có thể cần thêm chút thời gian.
        // Retry vài lần để tránh phải logout/login.
        const delayMs = [1200, 2400, 4200][retryRef.current - 1] ?? 3000;
        setTimeout(() => {
          void fetchProducts();
        }, delayMs);
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

  const toggleActive = useCallback(async (id: number) => {
    setProducts((prevProducts) => {
      const current = prevProducts.find((p) => p.productId === id);
      if (!current) return prevProducts;

      const optimisticProducts = prevProducts.map((p) =>
        p.productId === id ? { ...p, isActive: !p.isActive } : p
      );

      updateShopProduct(id, { isActive: !current.isActive })
        .then((updated) => {
          setProducts((prev) =>
            prev.map((p) => (p.productId === id ? updated : p))
          );
        })
        .catch((err) => {
          console.error('Toggle active failed:', err);
          setProducts((prev) =>
            prev.map((p) => (p.productId === id ? current : p))
          );
        });

      return optimisticProducts;
    });
  }, []);

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
