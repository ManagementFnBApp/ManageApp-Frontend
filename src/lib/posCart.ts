/**
 * posCart.ts – Tạm lưu giỏ hàng POS vào localStorage để truyền sang
 * trang checkout-order mà không cần global state / context.
 */

const STORAGE_KEY = 'pos_pending_cart';

export interface PosCartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface PosCartPayload {
  items: PosCartItem[];
  total: number;
  orderType: 'eat-in' | 'takeaway';
  /** HARDCODE: shift ID do nhân viên nhập. TODO: thay bằng API GET /shifts/active */
  shiftId: number;
  /** userId lấy từ JWT sub */
  userId: number;
}

export function savePosCart(payload: PosCartPayload): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadPosCart(): PosCartPayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PosCartPayload;
  } catch {
    return null;
  }
}

export function clearPosCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
