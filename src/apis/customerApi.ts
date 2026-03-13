import { apiClient } from '../configs/axios';

// ===== TYPES (khớp backend CustomerResponseDto, CreateCustomerDto) =====

export interface Customer {
  id: number;
  shop_id: number;
  phone: string;
  full_name: string | null;
  loyalty_point: number;
  created_at: string;
}

export interface CreateCustomerPayload {
  shop_id: number;
  phone: string;
  full_name?: string;
  loyalty_point?: number;
}

export interface UpdateCustomerPayload {
  phone?: string;
  full_name?: string;
  loyalty_point?: number;
}

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

function mapCustomer(raw: Record<string, unknown>): Customer {
  return {
    id: Number(raw.id),
    shop_id: Number(raw.shop_id),
    phone: String(raw.phone ?? ''),
    full_name: raw.full_name != null ? String(raw.full_name) : null,
    loyalty_point: Number(raw.loyalty_point ?? 0),
    created_at: String(raw.created_at ?? ''),
  };
}

/** GET /customers - Backend lấy shop_id từ JWT (SHOPOWNER) */
export const getCustomers = async (): Promise<Customer[]> => {
  const res = await apiClient.get('/customers');
  const list = unwrap<Record<string, unknown>[]>(res.data);
  return Array.isArray(list) ? list.map(mapCustomer) : [];
};

/** GET /customers/:id */
export const getCustomerById = async (id: number): Promise<Customer> => {
  const res = await apiClient.get(`/customers/${id}`);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapCustomer(raw ?? {});
};

/** POST /customers - STAFF, body: shop_id, phone, full_name?, loyalty_point? */
export const createCustomer = async (
  payload: CreateCustomerPayload,
): Promise<Customer> => {
  const res = await apiClient.post('/customers', {
    shop_id: payload.shop_id,
    phone: payload.phone.trim(),
    full_name: payload.full_name?.trim(),
    loyalty_point: payload.loyalty_point,
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapCustomer(raw ?? {});
};

/** PUT /customers/:id - STAFF */
export const updateCustomer = async (
  id: number,
  payload: UpdateCustomerPayload,
): Promise<Customer> => {
  const res = await apiClient.put(`/customers/${id}`, payload);
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapCustomer(raw ?? {});
};

/** DELETE /customers/:id - SHOPOWNER */
export const deleteCustomer = async (
  id: number,
): Promise<{ message: string }> => {
  const res = await apiClient.delete(`/customers/${id}`);
  return (res.data && (res.data as any).data) || { message: 'OK' };
};

/** PUT /customers/:id/loyalty-points - STAFF, body: { points: number } */
export const updateLoyaltyPoints = async (
  id: number,
  points: number,
): Promise<Customer> => {
  const res = await apiClient.put(`/customers/${id}/loyalty-points`, {
    points,
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return mapCustomer(raw ?? {});
};
