import { apiClient } from '../configs/axios';

// ===== TYPES =====

export interface CreateOrderPayload {
  /** ID của nhân viên (lấy từ JWT sub). */
  userId: number;
  /**
   * ID của khách hàng.
   * HARDCODE: tạm thời luôn là 1 (khách vãng lai) cho đến khi có customer management.
   * TODO: lấy từ customer management khi BE có.
   */
  customerId: number;
  /**
   * ID của ca làm việc (cột NOT NULL trong DB).
   * HARDCODE: nhân viên tự nhập qua badge "Ca #X" trong header POS.
   * TODO: lấy từ GET /shifts/active khi BE có endpoint.
   */
  shiftId: number;
  note?: string;
  totalAmount: number;
}

export interface UpdateOrderPayload {
  customerId?: number;
  userId?: number;
  shiftId?: number;
  note?: string;
  totalAmount?: number;
}

export interface OrderResponse {
  id: number;
  customerId: number;
  userId: number;
  shiftId: number;
  note: string | null;
  totalAmount: number;
  orderStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
}

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

// ===== ORDER APIs =====

/** Tạo đơn hàng mới. */
export const createOrder = async (payload: CreateOrderPayload): Promise<OrderResponse> => {
  const res = await apiClient.post('/orders', payload);
  return unwrap<OrderResponse>(res.data);
};

/** Cập nhật thông tin đơn hàng. */
export const updateOrder = async (id: number, payload: UpdateOrderPayload): Promise<OrderResponse> => {
  const res = await apiClient.put(`/orders/${id}`, payload);
  return unwrap<OrderResponse>(res.data);
};

/** Đánh dấu đơn hàng hoàn thành (COMPLETED). */
export const completeOrder = async (id: number): Promise<OrderResponse> => {
  const res = await apiClient.put(`/orders/${id}/complete`);
  return unwrap<OrderResponse>(res.data);
};

/** Huỷ đơn hàng (CANCELLED). */
export const cancelOrder = async (id: number): Promise<OrderResponse> => {
  const res = await apiClient.put(`/orders/${id}/cancel`);
  return unwrap<OrderResponse>(res.data);
};

/** Lấy danh sách đơn hàng. Truyền status để lọc: 'PENDING' | 'COMPLETED' | 'CANCELLED'. */
export const getOrders = async (status?: string): Promise<OrderResponse[]> => {
  // BE dùng @Post('list') → endpoint POST /orders/list
  const res = await apiClient.post('/orders/list', undefined, { params: status ? { status } : undefined });
  return unwrap<OrderResponse[]>(res.data);
};
