import { apiClient } from '../configs/axios';
import { BASE_URL } from '../global-configs';
import { decodeJwt, UserJwtPayload } from '../lib/jwt';

// Login
export interface LoginDto {
  username: string;
  password: string;
}

/** role_code từ bảng Role (backend) - dùng cho so sánh sau khi login */
export const ROLE_CODE_ADMIN = 'ADMIN';
export const ROLE_CODE_SHOP_OWNER = 'SHOPOWNER';

/** Lấy role đã lưu (chuẩn uppercase để khớp API backend ADMIN/SHOPOWNER) */
export function getStoredRoleNormalized(): string {
  if (typeof window === 'undefined') return '';
  return ((localStorage.getItem('role') ?? '').toString()).toUpperCase();
}

/** Kiểm tra user hiện tại có phải admin (theo role từ backend) */
export function isStoredRoleAdmin(): boolean {
  return getStoredRoleNormalized() === ROLE_CODE_ADMIN;
}

/** Kiểm tra user hiện tại có phải shop owner (theo role từ backend) */
export function isStoredRoleShopOwner(): boolean {
  return getStoredRoleNormalized() === ROLE_CODE_SHOP_OWNER;
}

/** Khớp `AuthPermission` backend — `data` của POST /auth/login (không có username/role). */
export interface AuthPermissionDto {
  user_id: number;
  token: string;
  expiredTime: number;
}

/** Kết quả `login()`: payload BE + username form + role decode JWT. */
export interface LoginResponse extends AuthPermissionDto {
  username?: string;
  role?: string | null;
}

/**
 * Đăng nhập - khớp API backend POST /auth/login.
 * Body: { username, password }. Response: { data: { user_id, token, expiredTime }, statusCode, message }.
 * Role lấy từ JWT (backend đặt payload.role = role_code).
 */
export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const isEmail = data.username.includes('@');

  // Admin login: dùng fetch thuần để tránh axios interceptor gọi handleLogout khi 401
  if (isEmail) {
    try {
      const res = await fetch(`${BASE_URL}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.username, password: data.password }),
      });
      if (res.ok) {
        const json = await res.json();
        const adminData = json.data ?? json;
        if (adminData?.token) {
          localStorage.setItem('accessToken', adminData.token);
          localStorage.setItem('userId', String(adminData.adminId));
          localStorage.setItem('username', data.username);
          localStorage.setItem('role', 'ADMIN');
        }
        return {
          user_id: adminData.adminId,
          username: data.username,
          token: adminData.token,
          expiredTime: adminData.expiredTime,
          role: 'ADMIN',
        };
      }
      // Admin login thất bại → tiếp tục staff login
    } catch {
      // Network error → tiếp tục staff login
    }
  }

  // User login: dùng fetch thuần để tránh axios interceptor redirect về '/' khi BE trả 401
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: data.username, password: data.password }),
  });

  const json = await res.json();

  if (!res.ok) {
    // Lấy message lỗi từ BE (thường là "Username or password is incorrect")
    const message = json?.message || json?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
    throw new Error(Array.isArray(message) ? message[0] : message);
  }

  const authData = (json?.data ?? json) as AuthPermissionDto;
  if (authData?.token) {
    const payload = decodeJwt<UserJwtPayload>(authData.token);
    const userRole = payload?.role ?? null;
    localStorage.setItem('accessToken', authData.token);
    localStorage.setItem('userId', String(authData.user_id));
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', userRole ?? '');
  }

  const payload = decodeJwt<UserJwtPayload & { shop_id?: number }>(authData.token);
  const roleFromJwt = (payload?.role ?? '').toString().toUpperCase();
  const role = roleFromJwt.trim() || null;

  localStorage.setItem('accessToken', authData.token);
  localStorage.setItem('userId', String(authData.user_id));
  localStorage.setItem('username', data.username.trim());
  localStorage.setItem('role', role ?? '');
  if (payload?.shop_id != null) {
    localStorage.setItem('shopId', String(payload.shop_id));
  }

  return {
    user_id: authData.user_id,
    username: data.username.trim(),
    token: authData.token,
    expiredTime: authData.expiredTime,
    role,
  };
};

// Register
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  user_id: number;
  email: string;
  username: string;
  isActive: boolean;
  createdAt: Date;
}

export const register = async (data: RegisterDto): Promise<RegisterResponse> => {
  const registerPayload = {
    username: data.username.trim(),
    email: data.email.trim(),
    password: data.password,
  };
  const response = await apiClient.post<{ data?: RegisterResponse } & RegisterResponse>('/auth/register', registerPayload);
  const result = response.data?.data ?? response.data;
  return result as RegisterResponse;
};

// Forgot Password
export interface ForgotPasswordDto {
  email: string;
}

/** Backend trả { message, token? } - token dùng để redirect sang trang reset password (backend không gửi email) */
export interface ForgotPasswordResponse {
  message: string;
  token?: string;
}

export const forgotPassword = async (data: ForgotPasswordDto): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse | { data: ForgotPasswordResponse }>('/auth/forgot-password', data);
  const raw = response.data;
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: ForgotPasswordResponse }).data;
  }
  return raw as ForgotPasswordResponse;
};

// Reset Password
export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const resetPassword = async (data: ResetPasswordDto): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse | { data: ResetPasswordResponse }>('/auth/reset-password', data);
  const raw = response.data;
  if (raw && typeof raw === 'object' && 'data' in (raw as object)) {
    return (raw as { data: ResetPasswordResponse }).data;
  }
  return raw as ResetPasswordResponse;
};

/** Xóa session trên trình duyệt (không điều hướng). Dùng sau subscription: user cần đăng nhập lại để có JWT mới. */
export const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
  localStorage.removeItem('role');
  localStorage.removeItem('shopId');
};

// Logout
export const handleLogout = () => {
  if (typeof window !== 'undefined') {
    clearAuthStorage();
    window.location.href = '/';
  }
};

/** Cập nhật role trong localStorage sau khi payment thành công (không cần re-login) */
export const updateLocalRole = (role: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('role', role);
    // Notify client-side guards/layouts that depend on `localStorage.role`.
    // (So user doesn't need to logout/login after actions like subscription upgrade.)
    window.dispatchEvent(new CustomEvent("lumio:role-changed", { detail: { role } }));
  }
};

/**
 * Refresh user info từ JWT token hiện tại trong localStorage
 * Gọi hàm này sau khi payment success để cập nhật role SHOPOWNER mà không cần re-login
 */
export const refreshUserInfoFromToken = (): { role: string | null; shop_id?: number } | null => {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  try {
    const payload = decodeJwt<UserJwtPayload & { shop_id?: number }>(token);
    if (!payload) return null;

    // Cập nhật role từ JWT
    const roleFromJwt = (payload?.role ?? '').toString().toUpperCase();
    if (roleFromJwt) {
      localStorage.setItem('role', roleFromJwt);
    }

    // Cập nhật shop_id nếu có
    if (payload?.shop_id != null) {
      localStorage.setItem('shopId', String(payload.shop_id));
    }

    return {
      role: roleFromJwt || null,
      shop_id: payload?.shop_id,
    };
  } catch (error) {
    console.error('Failed to refresh user info from token:', error);
    return null;
  }
};