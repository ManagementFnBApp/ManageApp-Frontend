import { apiClient } from "../configs/axios";

// ================= TYPES =================

export interface Product {
  productId: number;
  categoryId: number;
  productName: string;
  image: string;
  barcode?: string | null;
  description?: string | null;
  measureUnit?: string | null;
  listPrice: number;
  importPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductPayload {
  categoryId: number;
  productName: string;
  image: string;
  barcode?: string;
  description?: string;
  measureUnit?: string;
  importPrice: number;
  listPrice: number;
  isActive?: boolean;
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

// ================= HELPERS =================

const mapProduct = (data: any): Product => ({
  ...data,
  createdAt: new Date(data.createdAt),
  updatedAt: new Date(data.updatedAt),
});

// ================= API =================

export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  const res = await apiClient.get<Product[]>("/products", {
    params: isActive !== undefined ? { isActive } : undefined,
  });

  return res.data.map(mapProduct);
};

export const getActiveProducts = async (): Promise<Product[]> => {
  return getProducts(true);
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get<Product>(`/products/${id}`);
  return mapProduct(res.data);
};

export const createProduct = async (
  payload: CreateProductPayload,
): Promise<Product> => {
  const res = await apiClient.post<Product>("/products", payload);
  return mapProduct(res.data);
};

export const updateProduct = async (
  id: number,
  payload: UpdateProductPayload,
): Promise<Product> => {
  const res = await apiClient.patch<Product>(`/products/${id}`, payload);
  return mapProduct(res.data);
};

export const softDeleteProduct = async (
  id: number,
): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const hardDeleteProduct = async (
  id: number,
): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}/hard`);
  return res.data;
};
