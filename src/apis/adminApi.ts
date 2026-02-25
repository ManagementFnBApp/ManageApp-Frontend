import { apiClient } from '../configs/axios';

// ===== TYPES =====

export interface AdminUser {
  adminId: number;
  managerId?: number | null;
  email: string;
  fullName: string;
  phone?: string | null;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
}

export interface CreateAdminDto {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface AppUser {
  user_id: number;
  tenantId?: number | null;
  shopId?: number | null;
  ownerManagerId?: number | null;
  roleId?: number | null;
  email: string;
  username: string;
  isActive: boolean;
  lastLogin?: string | null;
  role?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    full_name?: string;
    phone?: string;
    avatar?: string;
  } | null;
}

export interface Tenant {
  tenant_id: number;
  admin_id: number;
  tenant_name: string;
  loyal_point_per_unit?: number;
  is_active: boolean;
  created_at: string;
  update_at: string;
}

export interface SubscriptionPlan {
  subscription_id: number;
  package_code: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: unknown;
}

export interface CreateSubscriptionDto {
  packageCode: string;
  description?: string;
  price: number;
  billingCycle: string;
  features?: unknown;
}

// ===== HELPERS =====

function unwrap<T>(raw: unknown): T {
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: T }).data;
  }
  return raw as T;
}

// ===== ADMIN APIs =====

export const getAdmins = async (): Promise<AdminUser[]> => {
  const res = await apiClient.get('/admins');
  return unwrap<AdminUser[]>(res.data);
};

export const createAdmin = async (dto: CreateAdminDto): Promise<AdminUser> => {
  const res = await apiClient.post('/admins', dto);
  return unwrap<AdminUser>(res.data);
};

export const deleteAdmin = async (id: number): Promise<void> => {
  await apiClient.delete(`/admins/${id}`);
};

export const toggleAdminStatus = async (id: number, isActive: boolean): Promise<AdminUser> => {
  const res = await apiClient.put(`/admins/${id}`, { isActive });
  return unwrap<AdminUser>(res.data);
};

// ===== USER APIs =====

export const getUsers = async (): Promise<AppUser[]> => {
  const res = await apiClient.get('/users');
  return unwrap<AppUser[]>(res.data);
};

// ===== TENANT APIs =====

export const getTenants = async (): Promise<Tenant[]> => {
  const res = await apiClient.get('/tenants');
  return Array.isArray(res.data) ? res.data : unwrap<Tenant[]>(res.data);
};

export const deleteTenant = async (id: number): Promise<void> => {
  await apiClient.delete(`/tenants/${id}`);
};

// ===== SUBSCRIPTION APIs =====

export const getSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  const res = await apiClient.get('/subscriptions');
  const raw = res.data;
  return Array.isArray(raw) ? raw : unwrap<SubscriptionPlan[]>(raw);
};

export const createSubscription = async (dto: CreateSubscriptionDto): Promise<SubscriptionPlan> => {
  const res = await apiClient.post('/subscriptions', dto);
  return unwrap<SubscriptionPlan>(res.data);
};

export const deleteSubscription = async (id: number): Promise<void> => {
  await apiClient.delete(`/subscriptions/${id}`);
};
