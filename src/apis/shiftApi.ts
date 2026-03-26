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
  // Backend trả về date dạng YYYY-MM-DD (đã format theo timezone Asia/Ho_Chi_Minh)
  date: string;
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

export const getMyShiftAssignmentsAsStaff = async (
  userId: number,
): Promise<ShiftAssignment[]> => {
  const res = await apiClient.get(`/shifts/users/staff/${userId}`);
  const list = unwrap<ShiftAssignment[]>(res.data);
  return Array.isArray(list) ? list : [];
};
/** POST /shifts/assign — SHOPOWNER gán ca cho nhân viên */
export const assignShift = async (dto: {
  shift_id: number;
  user_id: number;
  date: string;
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
export const deleteShiftAssignment = async (id: number): Promise<string> => {
  const res = await apiClient.delete(`/shifts/users/${id}`);

  // Backend trả ResponseData: { data, statusCode, message }.
  // Controller đang catch và trả về body (không set HTTP status), nên axios không throw.
  const body = res.data as
    | {
        data?: { message?: string } | null;
        statusCode?: number;
        message?: string;
      }
    | undefined;

  const statusCode = body?.statusCode;
  const bodyMsg = body?.data?.message ?? body?.message;
  const successMsg = bodyMsg ?? "Xóa phân ca thành công.";
  const technicalMsg = String(bodyMsg ?? "").toLowerCase();
  const isLinkedOrderError =
    technicalMsg.includes("p2003") ||
    technicalMsg.includes("foreign key") ||
    technicalMsg.includes("constraint failed") ||
    technicalMsg.includes("constraint violated");

  if (typeof statusCode === "number") {
    if (statusCode !== 200) {
      const errMsg = isLinkedOrderError
        ? "Shift này hiện tại đã có order rồi và không thực hiện xóa được."
        : bodyMsg ?? "Xóa phân ca thất bại.";
      throw new Error(errMsg);
    }
  } else if (bodyMsg && !body?.data) {
    // Trường hợp backend không trả statusCode nhưng báo lỗi qua message.
    throw new Error(
      isLinkedOrderError
        ? "Shift này hiện tại đã có order rồi và không thực hiện xóa được."
        : bodyMsg,
    );
  }

  return successMsg;
};
