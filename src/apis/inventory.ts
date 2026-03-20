import { apiClient } from "../configs/axios";

export interface Inventory {
  inventoryId: number;
  shopId: number;
  currentQuantity: number;
  minimumThreshold: number;
  reorderQuantity: number;
  lastRestockAt: string | null;
  updateAt: string | null;
}

export interface InventoryItem {
  inventoryItemId: number;
  productId?: number | null;
  shopProductId?: number | null;
  productType?: "SYSTEM" | "SHOP";
  inventoryId: number;
  quantity: number;
  reservedQuantity: number;
  updatedAt: string | null;
}

export interface CreateInventoryPayload {
  shopId: number;
  currentQuantity?: number;
  minimumThreshold?: number;
  reorderQuantity?: number;
}

export interface UpdateInventoryPayload {
  shopId?: number;
  currentQuantity?: number;
  minimumThreshold?: number;
  reorderQuantity?: number;
  lastRestockAt?: string;
}

export interface CreateInventoryItemPayload {
  productId?: number;
  shopProductId?: number;
  inventoryId: number;
  quantity?: number;
  reservedQuantity?: number;
}

export interface UpdateInventoryItemPayload {
  productId?: number;
  shopProductId?: number;
  inventoryId?: number;
  quantity?: number;
  reservedQuantity?: number;
}

function sanitizeInventoryItemPayload(
  payload: CreateInventoryItemPayload | UpdateInventoryItemPayload,
) {
  const cleaned: Record<string, number> = {};

  if (payload.productId != null) cleaned.productId = payload.productId;
  if (payload.shopProductId != null) cleaned.shopProductId = payload.shopProductId;
  if (payload.inventoryId != null) cleaned.inventoryId = payload.inventoryId;
  if (payload.quantity != null) cleaned.quantity = payload.quantity;
  if (payload.reservedQuantity != null) {
    cleaned.reservedQuantity = payload.reservedQuantity;
  }

  return cleaned;
}

function toErrorMessage(error: unknown): string {
  const defaultMessage = "Có lỗi xảy ra. Vui lòng thử lại.";

  if (!error || typeof error !== "object") {
    return defaultMessage;
  }

  const maybe = error as { message?: unknown; status?: number };

  if (Array.isArray(maybe.message)) {
    return String(maybe.message[0] ?? defaultMessage);
  }

  if (typeof maybe.message === "string" && maybe.message.trim()) {
    return maybe.message;
  }

  if (maybe.status === 400) return "Dữ liệu không hợp lệ.";
  if (maybe.status === 404) return "Không tìm thấy dữ liệu.";
  if (maybe.status === 500) return "Lỗi hệ thống. Vui lòng thử lại sau.";

  return defaultMessage;
}

export function normalizeApiError(error: unknown): Error {
  return new Error(toErrorMessage(error));
}

export async function getInventories(shopId?: number): Promise<Inventory[]> {
  const params = shopId ? { shopId } : undefined;
  const response = await apiClient.get<Inventory[]>("/inventories", { params });
  return Array.isArray(response.data) ? response.data : [];
}

export async function getInventoryById(id: number): Promise<Inventory> {
  const response = await apiClient.get<Inventory>(`/inventories/${id}`);
  return response.data;
}

export async function createInventory(
  payload: CreateInventoryPayload,
): Promise<Inventory> {
  const response = await apiClient.post<Inventory>("/inventories", payload);
  return response.data;
}

export async function updateInventory(
  id: number,
  payload: UpdateInventoryPayload,
): Promise<Inventory> {
  const response = await apiClient.patch<Inventory>(`/inventories/${id}`, payload);
  return response.data;
}

export async function deleteInventory(id: number): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/inventories/${id}`);
  return response.data;
}

export async function getInventoryItems(params?: {
  inventoryId?: number;
  productId?: number;
  shopProductId?: number;
}): Promise<InventoryItem[]> {
  const response = await apiClient.get<InventoryItem[]>("/inventories/items/all", {
    params,
  });
  return Array.isArray(response.data) ? response.data : [];
}

export async function createInventoryItem(
  payload: CreateInventoryItemPayload,
): Promise<InventoryItem> {
  const response = await apiClient.post<InventoryItem>(
    "/inventories/items",
    sanitizeInventoryItemPayload(payload),
  );
  return response.data;
}

export async function updateInventoryItem(
  id: number,
  payload: UpdateInventoryItemPayload,
): Promise<InventoryItem> {
  const response = await apiClient.patch<InventoryItem>(
    `/inventories/items/${id}`,
    sanitizeInventoryItemPayload(payload),
  );
  return response.data;
}

export async function deleteInventoryItem(
  id: number,
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/inventories/items/${id}`,
  );
  return response.data;
}
