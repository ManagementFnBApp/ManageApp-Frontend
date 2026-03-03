import { apiClient } from '../configs/axios';

// ===== TYPES =====

export interface Product {
  productId: number;
  categoryId: number;
  productName: string;
  sku: string;
  barcode?: string | null;
  description?: string | null;
  measureUnit?: string | null;
  /** Giá nhập (import price) - khớp với BE field importPrice */
  importPrice: number;
  /** Giá bán (list price) - khớp với BE field listPrice */
  listPrice: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  categoryId: number;
  productName: string;
  sku: string;
  barcode?: string;
  description?: string;
  measureUnit?: string;
  /** Giá nhập kho */
  importPrice: number;
  /** Giá bán lẻ */
  listPrice: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

// ===== PRODUCT APIs =====

export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  const params = isActive !== undefined ? { isActive } : {};
  const res = await apiClient.get('/products', { params });
  return unwrap<Product[]>(res.data);
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get(`/products/${id}`);
  return unwrap<Product>(res.data);
};

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await apiClient.post('/products', payload);
  return unwrap<Product>(res.data);
};

export const updateProduct = async (id: number, payload: UpdateProductPayload): Promise<Product> => {
  const res = await apiClient.patch(`/products/${id}`, payload);
  return unwrap<Product>(res.data);
};

export const softDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const hardDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}/hard`);
  return res.data;
};
