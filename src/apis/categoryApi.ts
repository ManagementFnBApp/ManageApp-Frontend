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

