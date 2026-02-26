/**
 * posCart.ts
 * Lightweight localStorage utility for passing POS cart data to the checkout page.
 * Swap out the storage mechanism here when integrating a real API / state manager.
 */

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
  /** ISO timestamp – used to detect stale carts */
  savedAt: string;
}

const STORAGE_KEY = 'pos_cart_payload';

/** Persist the current cart before navigating to /checkout-order */
export function savePosCart(payload: Omit<PosCartPayload, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  const data: PosCartPayload = { ...payload, savedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Read the cart on the checkout-order page */
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

/** Clear after a successful order so stale data doesn't persist */
export function clearPosCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
