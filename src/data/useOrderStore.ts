export interface OrderItem {
  productId: number;
  /** ID sản phẩm của shop — dùng khi gửi shop_product_id lên backend */
  shopProductId?: number;
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
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface SavedDraft {
  tableId: string;
  items: OrderItem[];
  total: number;
  cashier: string;
  createdAt: string;
}

const STORAGE_KEY = 'pos_orders';
const DRAFTS_KEY = 'pos_saved_drafts';

// ── API Base URLs ──
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ── Orders ──────────────────────────────────────────────────────────────────

async function fetchOrdersFromAPI(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.warn('API fetch failed, falling back to localStorage', err);
    return loadOrdersFromStorage();
  }
}

function loadOrdersFromStorage(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Order[];
  } catch { /* ignore */ }
  return [];
}

export function loadOrders(): Order[] {
  // Trả về từ localStorage trước (sync), sau sẽ fetch từ API nếu cần
  return loadOrdersFromStorage();
}

async function saveOrderToAPI(order: Order): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error('Failed to save order');
  } catch (err) {
    console.warn('API save failed, falling back to localStorage', err);
    saveOrderToStorage(order);
  }
}

function saveOrderToStorage(order: Order): void {
  if (typeof window === 'undefined') return;
  const existing = loadOrdersFromStorage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify([order, ...existing]));
}

export function saveOrder(order: Order): void {
  // Lưu vào localStorage ngay, sau đó sync với API
  saveOrderToStorage(order);
  saveOrderToAPI(order).catch(console.error);
}

export function clearOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  // TODO: Gọi API để clear orders trên backend
}

// ─── Drafts (Đơn lưu theo bàn) ───────────────────────────────────────────

function loadDraftsFromStorage(): Record<string, SavedDraft> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DRAFTS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, SavedDraft>;
  } catch { /* ignore */ }
  return {};
}

async function fetchDraftFromAPI(tableId: string): Promise<SavedDraft | null> {
  try {
    const res = await fetch(`${API_BASE}/drafts/${tableId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch draft');
    return await res.json();
  } catch (err) {
    console.warn('API fetch draft failed, falling back to localStorage', err);
    const drafts = loadDraftsFromStorage();
    const d = drafts[tableId];
    return d && d.items && d.items.length > 0 ? d : null;
  }
}

export function getDraft(tableId: string): SavedDraft | null {
  const drafts = loadDraftsFromStorage();
  const d = drafts[tableId];
  return d && d.items && d.items.length > 0 ? d : null;
}

async function saveDraftToAPI(
  tableId: string,
  data: { items: OrderItem[]; total: number; cashier: string }
): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/drafts/${tableId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save draft');
  } catch (err) {
    console.warn('API save draft failed, falling back to localStorage', err);
    saveDraftToStorage(tableId, data);
  }
}

function saveDraftToStorage(
  tableId: string,
  data: { items: OrderItem[]; total: number; cashier: string }
): void {
  if (typeof window === 'undefined') return;
  const drafts = loadDraftsFromStorage();
  drafts[tableId] = {
    tableId,
    items: data.items,
    total: data.total,
    createdAt: new Date().toISOString(),
    cashier: data.cashier,
  };
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function saveDraft(
  tableId: string,
  data: { items: OrderItem[]; total: number; cashier: string }
): void {
  saveDraftToStorage(tableId, data);
  saveDraftToAPI(tableId, data).catch(console.error);
}

async function clearDraftFromAPI(tableId: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/drafts/${tableId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok && res.status !== 404) throw new Error('Failed to clear draft');
  } catch (err) {
    console.warn('API clear draft failed, falling back to localStorage', err);
    clearDraftFromStorage(tableId);
  }
}

function clearDraftFromStorage(tableId: string): void {
  if (typeof window === 'undefined') return;
  const drafts = loadDraftsFromStorage();
  delete drafts[tableId];
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function clearDraft(tableId: string): void {
  clearDraftFromStorage(tableId);
  clearDraftFromAPI(tableId).catch(console.error);
}

export function getActiveTableIds(): string[] {
  const drafts = loadDraftsFromStorage();
  return Object.keys(drafts).filter((id) => {
    const d = drafts[id];
    return d && d.items && d.items.length > 0;
  });
}
