import { apiClient } from '../configs/axios';

// ===== TYPES =====

export interface SubscriptionPlan {
  subscription_id: number;
  package_code: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: Record<string, unknown> | string[] | null;
}

export interface SubscriptionTenant {
  sub_tenant_id: number;
  subscription_id: number;
  tenant_id: number;
  number_of_renewals: number;
  created_at: string;
  updated_at: string;
  is_expired: boolean;
}

export interface SubscriptionPayment {
  sub_payment_id: number;
  sub_tenant_id: number;
  method: string;
  amount: number;
  created_at: string;
  payment_status: string;
  tenant?: {
    tenant_id: number;
    tenant_name: string;
  };
  user?: {
    user_id: number;
    username: string;
    role: string;
  };
}

// ===== API FUNCTIONS =====

/** Lấy tất cả gói subscription (Public) */
export const getSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  const response = await apiClient.get<{ data?: SubscriptionPlan[] } | SubscriptionPlan[]>(
    '/subscriptions'
  );
  const result = (response.data as { data?: SubscriptionPlan[] }).data ?? response.data;
  return result as SubscriptionPlan[];
};

/** Đăng ký gói subscription (tạo SubscriptionTenant) - cần login */
export const createSubscriptionTenant = async (
  subscriptionId: number
): Promise<SubscriptionTenant> => {
  const response = await apiClient.post<{ data?: SubscriptionTenant } | SubscriptionTenant>(
    '/subscriptions/tenants',
    { subscriptionId }
  );
  const result = (response.data as { data?: SubscriptionTenant }).data ?? response.data;
  return result as SubscriptionTenant;
};

/** Tạo payment cho subscription - cần login */
export const createSubscriptionPayment = async (
  subTenantId: number,
  method: string,
  amount: number,
  paymentStatus: 'pending' | 'success' | 'failed' = 'success'
): Promise<SubscriptionPayment> => {
  const response = await apiClient.post<{ data?: SubscriptionPayment } | SubscriptionPayment>(
    '/subscriptions/payments',
    { subTenantId, method, amount, paymentStatus }
  );
  const result = (response.data as { data?: SubscriptionPayment }).data ?? response.data;
  return result as SubscriptionPayment;
};
