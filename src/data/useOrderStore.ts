export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  orderId: string;
  createdAt: string;
  items: OrderItem[];
  total: number;
  orderType: 'eat-in' | 'takeaway';
  cashier: string;
  status: 'paid';
}

const STORAGE_KEY = 'pos_orders';
const DRAFTS_KEY = 'pos_saved_drafts';

export function loadOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch { /* ignore */ }
  return [];
}

export function saveOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  const existing = loadOrders();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]));
}

export function clearOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Đơn lưu theo bàn (chưa thanh toán) ───

function loadDraftsRaw(): Record<string, SavedDraft> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, SavedDraft>;
  } catch { /* ignore */ }
  return {};
}

export function getDraft(tableId: string): SavedDraft | null {
  const drafts = loadDraftsRaw();
  const d = drafts[tableId];
  return d && d.items && d.items.length > 0 ? d : null;
}

export function saveDraft(tableId: string, data: { items: OrderItem[]; total: number; cashier: string }): void {
  if (typeof window === 'undefined') return;
  const drafts = loadDraftsRaw();
  drafts[tableId] = {
    tableId,
    items: data.items,
    total: data.total,
    createdAt: new Date().toISOString(),
    cashier: data.cashier,
  };
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function clearDraft(tableId: string): void {
  if (typeof window === 'undefined') return;
  const drafts = loadDraftsRaw();
  delete drafts[tableId];
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

/** Danh sách tableId có đơn đang lưu (chưa thanh toán) → dùng để hiển thị active trên list bàn */
export function getActiveTableIds(): string[] {
  const drafts = loadDraftsRaw();
  return Object.keys(drafts).filter((id) => {
    const d = drafts[id];
    return d && d.items && d.items.length > 0;
  });
}
