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

/** Backend ProductResponseDto dùng listPrice (giá bán), importPrice (giá vốn) */
function mapBackendProductToFrontend(raw: Record<string, unknown>): Product {
  return {
    productId: Number(raw.productId ?? raw.id),
    categoryId: Number(raw.categoryId ?? raw.category_id),
    productName: String(raw.productName ?? raw.product_name ?? ''),
    sku: String(raw.sku ?? ''),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit: raw.measureUnit != null ? String(raw.measureUnit) : raw.measure_unit != null ? String(raw.measure_unit) : null,
    importPrice: Number(raw.importPrice ?? raw.import_price ?? 0),
    listPrice: Number(raw.listPrice ?? raw.list_price ?? 0),
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  };
}

// ===== PRODUCT APIs =====

export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  const params = isActive !== undefined ? { isActive } : {};
  const res = await apiClient.get('/products', { params });
  const list = unwrap<Record<string, unknown>[]>(res.data);
  const arr = Array.isArray(list) ? list : [];
  return arr.map(mapBackendProductToFrontend);
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get(`/products/${id}`);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapBackendProductToFrontend(raw ?? {});
};

/** Backend CreateProductDto: listPrice (giá bán), importPrice (giá vốn) - camelCase */
export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await apiClient.post('/products', {
    categoryId: payload.categoryId,
    productName: payload.productName,
    sku: payload.sku,
    barcode: payload.barcode,
    description: payload.description,
    measureUnit: payload.measureUnit,
    listPrice: payload.listPrice,
    importPrice: payload.importPrice,
    isActive: payload.isActive ?? true,
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapBackendProductToFrontend(raw ?? {});
};

export const updateProduct = async (id: number, payload: UpdateProductPayload): Promise<Product> => {
  const body: Record<string, unknown> = {};
  if (payload.categoryId !== undefined) body.categoryId = payload.categoryId;
  if (payload.productName !== undefined) body.productName = payload.productName;
  if (payload.sku !== undefined) body.sku = payload.sku;
  if (payload.barcode !== undefined) body.barcode = payload.barcode;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.measureUnit !== undefined) body.measureUnit = payload.measureUnit;
  if (payload.listPrice !== undefined) body.listPrice = payload.listPrice;
  if (payload.importPrice !== undefined) body.importPrice = payload.importPrice;
  if (payload.isActive !== undefined) body.isActive = payload.isActive;
  const res = await apiClient.patch(`/products/${id}`, body);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapBackendProductToFrontend(raw ?? {});
};

export const softDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const hardDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}/hard`);
  return res.data;
};
