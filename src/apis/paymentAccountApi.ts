import { apiClient } from '../configs/axios';

export interface PaymentAccount {
  id: string;
  shop_id: number;
  gateway_provider: string;
  client_id: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface CreatePaymentAccountPayload {
  client_id: string;
  api_key: string;
  checksum_key: string;
  gateway_provider?: string;
}

export interface UpdatePaymentAccountPayload {
  client_id?: string;
  api_key?: string;
  checksum_key?: string;
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

/** GET /payment-account — lấy tài khoản thanh toán active của shop */
export const getPaymentAccount = async (): Promise<PaymentAccount | null> => {
  try {
    const res = await apiClient.get('/payment-account');
    return unwrap<PaymentAccount>(res.data);
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw error;
  }
};

/** POST /payment-account — tạo tài khoản thanh toán mới cho shop */
export const createPaymentAccount = async (
  payload: CreatePaymentAccountPayload,
): Promise<PaymentAccount> => {
  const res = await apiClient.post('/payment-account', payload);
  return unwrap<PaymentAccount>(res.data);
};

/** PATCH /payment-account/:id — cập nhật thông tin */
export const updatePaymentAccount = async (
  id: string,
  payload: UpdatePaymentAccountPayload,
): Promise<PaymentAccount> => {
  const res = await apiClient.patch(`/payment-account/${id}`, payload);
  return unwrap<PaymentAccount>(res.data);
};

/** DELETE /payment-account/:id — xóa/hủy kích hoạt tài khoản */
export const deletePaymentAccount = async (id: string): Promise<void> => {
  await apiClient.delete(`/payment-account/${id}`);
};
