import { apiClient } from "../configs/axios";

export interface ShopCategoryItem {
  id: number;
  name: string;
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

/** GET /shop-categories - Danh mục mà cửa hàng đã chọn (SHOPOWNER, shop_id từ token) */
export const getShopCategories = async (): Promise<ShopCategoryItem[]> => {
  const res = await apiClient.get("/shop-categories");
  const list = unwrap<Array<{ category_id: number; category?: { id: number; category_name?: string } }>>(res.data);
  const arr = Array.isArray(list) ? list : [];
  return arr.map((item) => ({
    id: item.category?.id ?? item.category_id,
    name: String(item.category?.category_name ?? ""),
  }));
};

/** POST /shop-categories - Thêm danh mục vào cửa hàng (category_id: number[]) */
export const addShopCategories = async (
  categoryIds: number[]
): Promise<boolean> => {
  const res = await apiClient.post("/shop-categories", {
    category_id: categoryIds,
  });
  const data = unwrap<unknown>(res.data);
  return data === true || (typeof data === "object" && data !== null);
};

/** DELETE /shop-categories/:id - Xóa danh mục khỏi cửa hàng (chỉ SHOPOWNER) */
export const deleteShopCategory = async (
  categoryId: number
): Promise<boolean> => {
  const res = await apiClient.delete(`/shop-categories/${categoryId}`);
  const data = unwrap<unknown>(res.data);
  return data === true || (typeof data === "object" && data !== null);
};
