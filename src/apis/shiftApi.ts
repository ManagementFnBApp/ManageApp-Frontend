import { apiClient } from '../configs/axios';

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

// ===== TYPES =====

export interface ShiftTemplate {
  id: number;
  shift_name: string;
}

export interface ShiftAssignment {
  id: number;
  shift_id: number;
  shift_name: string;
  user_id: number;
  username: string;
  shop_id: number;
  notes: string | null;
  created_at: string;
}

// ===== SHIFT TEMPLATE APIs =====

/** GET /shifts — Lấy tất cả ca mẫu */
export const getShiftTemplates = async (): Promise<ShiftTemplate[]> => {
  const res = await apiClient.get('/shifts');
  const list = unwrap<ShiftTemplate[]>(res.data);
  return Array.isArray(list) ? list : [];
};

/** POST /shifts — Tạo ca mẫu mới (Public) */
export const createShiftTemplate = async (shift_name: string): Promise<ShiftTemplate> => {
  const res = await apiClient.post('/shifts', { shift_name });
  return unwrap<ShiftTemplate>(res.data);
};

// ===== SHIFT ASSIGNMENT APIs =====

/**
 * GET /shifts/users — SHOPOWNER xem toàn bộ lịch ca của shop.
 * Chỉ SHOPOWNER có quyền gọi endpoint này.
 */
export const getShiftAssignments = async (): Promise<ShiftAssignment[]> => {
  const res = await apiClient.get('/shifts/users');
  const list = unwrap<ShiftAssignment[]>(res.data);
  return Array.isArray(list) ? list : [];
};

/**
 * Lấy ca làm việc của chính SHOPOWNER đang đăng nhập.
 * Gọi GET /shifts/users (lấy tất cả ca của shop) rồi lọc theo userId.
 * Chỉ dùng khi role === 'SHOPOWNER'.
 */
export const getMyShiftAssignmentsAsOwner = async (
  userId: number,
): Promise<ShiftAssignment[]> => {
  const allShifts = await getShiftAssignments();
  return allShifts.filter((s) => s.user_id === userId);
};

/** POST /shifts/assign — SHOPOWNER gán ca cho nhân viên */
export const assignShift = async (dto: {
  shift_id: number;
  user_id: number;
  notes?: string;
}): Promise<ShiftAssignment> => {
  const res = await apiClient.post('/shifts/assign', dto);
  return unwrap<ShiftAssignment>(res.data);
};

/** PUT /shifts/users/:id — Cập nhật ghi chú của ca */
export const updateShiftAssignment = async (
  id: number,
  notes: string,
): Promise<ShiftAssignment> => {
  const res = await apiClient.put(`/shifts/users/${id}`, { notes });
  return unwrap<ShiftAssignment>(res.data);
};

/** DELETE /shifts/users/:id — Xóa phân ca */
export const deleteShiftAssignment = async (id: number): Promise<void> => {
  await apiClient.delete(`/shifts/users/${id}`);
};
