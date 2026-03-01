import { apiClient } from '../configs/axios';

// ===== TYPES (khớp backend SubscriptionResponseDto) =====

export interface SubscriptionPlan {
  subscription_id: number;
  package_code: string;
  description?: string | null;
  price: number;
  billing_cycle: string;
  features?: Record<string, unknown> | string[] | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

/** Khớp backend SubscriptionShopResponseDto */
export interface ShopSubscription {
  sub_shop_id: number;         // ID của ShopSubscription (bảng shop_subscriptions)
  shop_id: number;
  subscription_id: number;
  number_of_renewals: number;
  start_date: string;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
  subscription?: {
    package_code: string;
    price: number;
    billing_cycle: string;
  };
}

/** Khớp backend SubscriptionPaymentResponseDto */
export interface SubscriptionPayment {
  sub_payment_id: number;
  sub_shop_id: number;
  method: string;
  amount: number;
  created_at: string;
  payment_status: 'pending' | 'success' | 'failed';
  shop?: {
    shop_id: number;
    shop_name: string;
  };
  user?: {
    user_id: number;
    username: string;
    role: string | null;
  };
}

// ===== API FUNCTIONS =====

/** Chuẩn hóa item từ API (backend trả subscription_id; Prisma có thể trả id) */
function normalizeSubscriptionItem(raw: Record<string, unknown>): SubscriptionPlan {
  return {
    subscription_id: Number(raw.subscription_id ?? raw.id),
    package_code: String(raw.package_code ?? ''),
    description: raw.description != null ? String(raw.description) : null,
    price: Number(raw.price ?? 0),
    billing_cycle: String(raw.billing_cycle ?? ''),
    features: (raw.features as SubscriptionPlan['features']) ?? null,
    is_active: Boolean(raw.is_active),
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
    deleted_at: raw.deleted_at != null ? String(raw.deleted_at) : null,
  };
}

/** Lấy tất cả gói subscription đang active (Public - không cần login) */
export const getSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<Record<string, unknown>[]>('/subscriptions');
  return Array.isArray(response.data)
    ? response.data.map(normalizeSubscriptionItem)
    : [];
};

/**
 * Đăng ký gói subscription - tạo Shop + ShopSubscription (cần login)
 * Backend: POST /subscriptions/shops, body { subscription_id, shop_name }
 */
export const registerShopSubscription = async (
  subscriptionId: number,
  shopName?: string,
): Promise<ShopSubscription> => {
  const response = await apiClient.post<ShopSubscription>('/subscriptions/shops', {
    subscription_id: subscriptionId,
    shop_name: shopName ?? 'My Shop',
  });
  return response.data;
};

/**
 * Tạo payment cho subscription (cần login)
 * Backend: POST /subscriptions/payments, body { sub_shop_id, method, amount } (status mặc định pending)
 */
export const createSubscriptionPayment = async (
  subShopId: number,
  method: string,
  amount: number,
): Promise<SubscriptionPayment> => {
  const response = await apiClient.post<SubscriptionPayment>('/subscriptions/payments', {
    sub_shop_id: subShopId,
    method,
    amount,
  });
  return response.data;
};

/**
 * Xác nhận thanh toán thành công (pending → success)
 * Backend: PUT /subscriptions/payments/:id/status - kích hoạt shop và gán role SHOPOWNER
 */
export const confirmPayment = async (paymentId: number): Promise<SubscriptionPayment> => {
  const response = await apiClient.put<SubscriptionPayment>(
    `/subscriptions/payments/${paymentId}/status`,
  );
  return response.data;
};

// ===== ALIASES =====
export const createSubscriptionTenant = registerShopSubscription;
