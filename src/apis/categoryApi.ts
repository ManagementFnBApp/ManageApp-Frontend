import { apiClient } from "../configs/axios";

export interface Category {
  id: number;
  categoryName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  categoryName: string;
  isActive?: boolean;
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === "object" && "data" in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function mapBackendCategoryToFrontend(raw: Record<string, unknown>): Category {
  return {
    id: Number(raw.id ?? raw.categoryId),
    categoryName: String(raw.categoryName ?? raw.category_name ?? ""),
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ""),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ""),
  };
}

export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get("/categories");
  const list = unwrap<Record<string, unknown>[]>(res.data);
  const arr = Array.isArray(list) ? list : [];
  return arr.map(mapBackendCategoryToFrontend);
};

/** BE AdminCreateCategoryDto nhận category_name (snake_case). */
export const createCategory = async (
  payload: CreateCategoryPayload,
): Promise<Category> => {
  const res = await apiClient.post("/categories", {
    category_name: payload.categoryName,
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapBackendCategoryToFrontend(raw ?? {});
};

// // ===== SHOP-CATEGORY APIs =====interface ShopCategoryRaw {
//   shop_id: number;
//   category_id: number;
//   category: { id: number; category_name: string; is_active: boolean };
// }/** Lấy các category đã được gắn vào shop của user đang đăng nhập. */
// export const getShopCategories = async (): Promise<Category[]> => {
//   const res = await apiClient.get("/shop-categories");
//   const list = unwrap<ShopCategoryRaw[]>(res.data);
//   const arr = Array.isArray(list) ? list : [];
//   return arr.map((item) => ({
//     id: item.category_id,
//     categoryName: item.category?.category_name ?? "",
//     isActive: item.category?.is_active ?? true,
//   }));
// };

// /** Gắn một hoặc nhiều category vào shop (chọn trong danh sách category tổng). */
// export const addShopCategories = async (
//   categoryIds: number[],
// ): Promise<void> => {
//   await apiClient.post("/shop-categories", { category_id: categoryIds });
// };
