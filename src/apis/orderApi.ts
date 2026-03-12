import { apiClient } from '../configs/axios';

// ===== TYPES (khớp backend OrderDto, OrderResponseDto) =====

export interface OrderItemPayload {
  /** ID sản phẩm toàn hệ thống (dùng khi order từ catalog global) */
  product_id?: number;
  /** ID sản phẩm của shop (dùng khi order từ /shop-products — ưu tiên) */
  shop_product_id?: number;
  quantity: number;
  unit_price: number;
}

/** Body tạo đơn - backend OrderDto: shiftUserId (id bảng shift_users), customerId?, note?, totalAmount, order_items */
export interface CreateOrderPayload {
  customerId?: number;
  /** ID ca làm (shift_users.id) - bắt buộc */
  shiftUserId: number;
  note?: string;
  totalAmount: number;
  order_items: OrderItemPayload[];
}

/** Body cập nhật đơn - backend OrderDto yêu cầu shiftUserId + order_items (bắt buộc) */
export interface UpdateOrderPayload {
  customerId?: number;
  shiftUserId?: number;
  note?: string;
  totalAmount?: number;
  /** Bắt buộc gửi kèm: backend sẽ xóa items cũ và tạo lại */
  order_items?: OrderItemPayload[];
}

export interface OrderItemResponse {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  product: { product_name: string };
}

/** Khớp backend OrderResponseDto - có shiftUserId */
export interface OrderResponse {
  id: number;
  customerId?: number | null;
  shiftUserId: number;
  note: string | null;
  totalAmount: number;
  orderStatus: string;
  createdAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  order_items?: OrderItemResponse[];
}

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

// ===== ORDER APIs =====

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<OrderResponse> => {
  const res = await apiClient.post('/orders', {
    customerId: payload.customerId,
    shiftUserId: payload.shiftUserId,
    note: payload.note,
    totalAmount: payload.totalAmount,
    order_items: payload.order_items,
  });
  return unwrap<OrderResponse>(res.data);
};

export const updateOrder = async (
  id: number,
  payload: UpdateOrderPayload,
): Promise<OrderResponse> => {
  const res = await apiClient.put(`/orders/${id}`, payload);
  return unwrap<OrderResponse>(res.data);
};

export const completeOrder = async (
  id: number,
): Promise<OrderResponse> => {
  const res = await apiClient.put(`/orders/${id}/complete`);
  return unwrap<OrderResponse>(res.data);
};

export const cancelOrder = async (
  id: number,
): Promise<OrderResponse> => {
  const res = await apiClient.put(`/orders/${id}/cancel`);
  return unwrap<OrderResponse>(res.data);
};

/** POST /orders/list - body { status?: string } - Backend lấy user từ JWT */
export const getOrders = async (
  status?: string,
): Promise<OrderResponse[]> => {
  const res = await apiClient.post('/orders/list', status ? { status } : {});
  const list = unwrap<OrderResponse[]>(res.data);
  return Array.isArray(list) ? list : [];
};

// ===== SHIFT APIs =====

export interface ShiftUserInfo {
  id: number;
  shift_id: number;
  shift_name: string;
  user_id: number;
  username: string;
  shop_id: number;
  notes: string | null;
  created_at: string;
}

/** GET /shifts/users - Lấy tất cả shift assignments của shop (SHOPOWNER) */
export const getShiftUsers = async (): Promise<ShiftUserInfo[]> => {
  const res = await apiClient.get('/shifts/users');
  const list = unwrap<ShiftUserInfo[]>(res.data);
  return Array.isArray(list) ? list : [];
};
