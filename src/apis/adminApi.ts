import { apiClient } from '../configs/axios';

// ===== TYPES (khớp backend UserResponseDto, ProfileResponseDto - snake_case) =====

/** Profile từ backend - ProfileResponseDto (backend có thể trả profile_id hoặc id) */
export interface AppUserProfile {
  profile_id?: string;
  id?: string;
  full_name: string;
  avatar?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}

/** User từ backend - UserResponseDto */
export interface AppUser {
  user_id: number;
  shop_id?: number | null;
  owner_manager_id?: number | null;
  role_id?: number | null;
  email: string;
  username: string;
  is_active: boolean;
  last_login?: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
  profile?: AppUserProfile | null;
}

/** Dùng cho UI tab Admin (map từ AppUser) */
export interface AdminUser {
  adminId: number;
  email: string;
  fullName: string;
  phone?: string | null;
  isActive: boolean;
  lastLogin?: string | null;
  createdAt: string;
}

/** Body tạo admin: tạo user qua POST /users với role_code ADMIN, sau đó PATCH profile */
export interface CreateAdminDto {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phone?: string;
}

/** Backend CreateUserDto - POST /users */
export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
  role_code?: string;
  shop_id?: number;
  owner_manager_id?: number;
}

/** Backend UpdateUserDto - PATCH /users/:id */
export interface UpdateUserDto {
  email?: string;
  username?: string;
  full_name?: string;
  phone?: string;
  avatar?: string;
  shop_id?: number;
  role_id?: number | null;
  is_active?: boolean;
}

/** Backend CreateManagedUserDto - POST /users/managed (SHOPOWNER tạo user, backend gửi username/password qua email) */
export interface CreateManagedUserDto {
  email: string;
  username: string;
  password: string;
  role_code: 'SHOPOWNER' | 'STAFF';
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

/** Khớp backend SubscriptionResponseDto */
export interface SubscriptionPlan {
  subscription_id: number;
  package_code: string;
  description?: string;
  price: number;
  billing_cycle: string;
  features?: unknown;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
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

// ===== USER APIs (backend chỉ có /users, không có /admins) =====

/** ADMIN: Lấy tất cả user (GET /users) - backend chỉ cho phép role ADMIN */
export const getUsers = async (): Promise<AppUser[]> => {
  const res = await apiClient.get('/users');
  return unwrap<AppUser[]>(res.data);
};

/**
 * SHOPOWNER lấy danh sách user do mình quản lý - GET /users/managed.
 * Backend trả users có owner_manager_id = current user id.
 */
export const getManagedUsers = async (): Promise<AppUser[]> => {
  const res = await apiClient.get('/users/managed');
  const list = unwrap<AppUser[]>(res.data);
  return Array.isArray(list) ? list : [];
};

/**
 * Trang Quản lý nhân viên: backend có GET /users (ADMIN only) và GET /users/managed (mọi user đã đăng nhập).
 * - ADMIN: gọi GET /users thành công → trả danh sách, lọc owner_manager_id ở FE.
 * - SHOPOWNER: gọi GET /users → 403 → trả { users: [], isAdmin: false }, dùng getManagedUsers() để lấy danh sách.
 */
export const getUsersForStaffPage = async (): Promise<{
  users: AppUser[];
  isAdmin: boolean;
}> => {
  try {
    const res = await apiClient.get('/users');
    const list = unwrap<AppUser[]>(res.data);
    const users = Array.isArray(list) ? list : [];
    return { users, isAdmin: true };
  } catch (e: unknown) {
    const err = e as { status?: number; response?: { status?: number } };
    const status = err?.status ?? err?.response?.status;
    if (status === 403) {
      return { users: [], isAdmin: false };
    }
    throw e;
  }
};

/** Tạo user - POST /users. Backend nhận snake_case. */
export const createUser = async (dto: CreateUserDto): Promise<AppUser> => {
  const res = await apiClient.post('/users', {
    email: dto.email,
    username: dto.username,
    password: dto.password,
    role_code: dto.role_code,
    shop_id: dto.shop_id,
    owner_manager_id: dto.owner_manager_id,
  });
  return unwrap<AppUser>(res.data);
};

/**
 * Cập nhật user - PATCH /users/:id (backend UpdateUserDto, snake_case).
 * Backend hỗ trợ: is_active (vô hiệu hóa/bật lại), role_id (gán role hoặc null để bỏ quyền).
 */
export const updateUser = async (id: number, dto: UpdateUserDto): Promise<AppUser> => {
  const body: Record<string, unknown> = {};
  if (dto.email !== undefined) body.email = dto.email;
  if (dto.username !== undefined) body.username = dto.username;
  if (dto.full_name !== undefined) body.full_name = dto.full_name;
  if (dto.phone !== undefined) body.phone = dto.phone;
  if (dto.avatar !== undefined) body.avatar = dto.avatar;
  if (dto.shop_id !== undefined) body.shop_id = dto.shop_id;
  if (dto.role_id !== undefined) body.role_id = dto.role_id;
  if (dto.is_active !== undefined) body.is_active = dto.is_active;
  const res = await apiClient.patch(`/users/${id}`, body);
  return unwrap<AppUser>(res.data);
};

/** Gán role cho user - PUT /users/:id/role. Backend chỉ cho phép gán role ADMIN qua API này. */
export const assignAdminRole = async (userId: number, role_id: number): Promise<AppUser> => {
  const res = await apiClient.put(`/users/${userId}/role`, { role_id });
  return unwrap<AppUser>(res.data);
};

/**
 * SHOPOWNER tạo user mới (SHOPOWNER hoặc STAFF) - POST /users/managed.
 * Backend tự gửi username & password qua email cho người dùng (sendUserCredentials).
 * Cần đăng nhập với role SHOPOWNER.
 */
export const createManagedUser = async (dto: CreateManagedUserDto): Promise<AppUser> => {
  const res = await apiClient.post('/users/managed', {
    email: dto.email,
    username: dto.username,
    password: dto.password,
    role_code: dto.role_code,
  });
  return unwrap<AppUser>(res.data);
};

// ===== TENANT APIs (backend có thể chưa có /tenants - trả về [] nếu 404) =====

export const getTenants = async (): Promise<Tenant[]> => {
  try {
    const res = await apiClient.get('/tenants');
    return Array.isArray(res.data) ? res.data : unwrap<Tenant[]>(res.data);
  } catch {
    return [];
  }
};

export const deleteTenant = async (id: number): Promise<void> => {
  await apiClient.delete(`/tenants/${id}`);
};

// ===== SUBSCRIPTION APIs =====

function normalizeSubscriptionPlan(raw: Record<string, unknown>): SubscriptionPlan {
  return {
    subscription_id: Number(raw.subscription_id ?? raw.id),
    package_code: String(raw.package_code ?? ''),
    description: raw.description != null ? String(raw.description) : undefined,
    price: Number(raw.price ?? 0),
    billing_cycle: String(raw.billing_cycle ?? ''),
    features: raw.features,
    is_active: raw.is_active !== undefined ? Boolean(raw.is_active) : true,
    created_at: raw.created_at != null ? String(raw.created_at) : undefined,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : undefined,
  };
}

export const getSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  const res = await apiClient.get('/subscriptions');
  const raw = res.data;
  const list = Array.isArray(raw) ? raw : unwrap<Record<string, unknown>[]>(raw);
  const arr = Array.isArray(list) ? list : [];
  return arr.map(normalizeSubscriptionPlan);
};

/** Backend CreateSubscriptionDto - snake_case: package_code, billing_cycle. AdminOnly. */
export const createSubscription = async (dto: CreateSubscriptionDto): Promise<SubscriptionPlan> => {
  const res = await apiClient.post('/subscriptions', {
    package_code: dto.packageCode,
    description: dto.description,
    price: dto.price,
    billing_cycle: dto.billingCycle,
    features: dto.features,
  });
  const raw = unwrap<Record<string, unknown>>(res.data);
  return normalizeSubscriptionPlan(raw ?? {});
};

export const deleteSubscription = async (id: number): Promise<void> => {
  await apiClient.delete(`/subscriptions/${id}`);
};
