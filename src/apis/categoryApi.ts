import { apiClient } from '../configs/axios';

// ===== TYPES =====

export interface Category {
  categoryId: number;
  categoryName: string;
  slug?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryPayload {
  categoryName: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

export type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

// ===== CATEGORY APIs =====

export const getCategories = async (): Promise<Category[]> => {
  const res = await apiClient.get('/categories');
  return unwrap<Category[]>(res.data);
};

export const getCategoryById = async (id: number): Promise<Category> => {
  const res = await apiClient.get(`/categories/${id}`);
  return unwrap<Category>(res.data);
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const res = await apiClient.post('/categories', payload);
  return unwrap<Category>(res.data);
};

export const updateCategory = async (id: number, payload: UpdateCategoryPayload): Promise<Category> => {
  const res = await apiClient.patch(`/categories/${id}`, payload);
  return unwrap<Category>(res.data);
};

export const deleteCategory = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/categories/${id}`);
  return res.data;
};
