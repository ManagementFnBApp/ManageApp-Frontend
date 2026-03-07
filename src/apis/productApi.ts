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

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapBackendProductToFrontend(raw: Record<string, unknown>): Product {
  return {
    productId: toNumber(raw.productId ?? raw.product_id ?? raw.id),
    categoryId: toNumber(raw.categoryId ?? raw.category_id),
    productName: String(raw.productName ?? raw.product_name ?? ''),
    sku: String(raw.sku ?? ''),
    barcode: raw.barcode != null ? String(raw.barcode) : null,
    description: raw.description != null ? String(raw.description) : null,
    measureUnit: raw.measureUnit != null
      ? String(raw.measureUnit)
      : raw.measure_unit != null
        ? String(raw.measure_unit)
        : null,
    importPrice: toNumber(raw.importPrice ?? raw.import_price),
    listPrice: toNumber(raw.listPrice ?? raw.list_price),
    isActive: Boolean(raw.isActive ?? raw.is_active),
    createdAt: String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt: String(raw.updatedAt ?? raw.updated_at ?? ''),
  };
}

function normalizeProductList(raw: unknown): Product[] {
  const unwrapped = unwrap<unknown>(raw);
  const list = Array.isArray(unwrapped) ? unwrapped : [];
  return list
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(mapBackendProductToFrontend);
}

function normalizeSingleProduct(raw: unknown): Product {
  const unwrapped = unwrap<unknown>(raw);
  const obj = (typeof unwrapped === 'object' && unwrapped !== null)
    ? (unwrapped as Record<string, unknown>)
    : {};
  return mapBackendProductToFrontend(obj);
}

// ===== PRODUCT APIs =====

export const getProducts = async (isActive?: boolean): Promise<Product[]> => {
  const params = isActive !== undefined ? { isActive } : {};
  const res = await apiClient.get('/products', { params });
  return normalizeProductList(res.data);
};

export const getActiveProducts = async (): Promise<Product[]> => {
  return getProducts(true);
};

export const getProductById = async (id: number): Promise<Product> => {
  const res = await apiClient.get(`/products/${id}`);
  return normalizeSingleProduct(res.data);
};

export const createProduct = async (payload: CreateProductPayload): Promise<Product> => {
  const res = await apiClient.post('/products', payload);
  return normalizeSingleProduct(res.data);
};

export const updateProduct = async (id: number, payload: UpdateProductPayload): Promise<Product> => {
  const res = await apiClient.patch(`/products/${id}`, payload);
  return normalizeSingleProduct(res.data);
};

export const softDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}`);
  return res.data;
};

export const hardDeleteProduct = async (id: number): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/products/${id}/hard`);
  return res.data;
};