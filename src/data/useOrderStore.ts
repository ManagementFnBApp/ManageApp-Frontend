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
