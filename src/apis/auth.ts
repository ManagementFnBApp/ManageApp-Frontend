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

export interface LoginResponse {
  user_id: number;
  username?: string;
  token: string;
  expiredTime: number;
  role?: string | null; // role_code từ JWT: 'ADMIN', 'SHOPOWNER', ...
}

/** Đúng format response backend: ResponseData<AuthPermission> */
interface BackendLoginResponse {
  data: { user_id: number; token: string; expiredTime: number; role?: string | null };
  statusCode: number;
  message: string;
}

/**
 * Đăng nhập - khớp API backend POST /auth/login.
 * Body: { username, password }. Response: { data: { user_id, token, expiredTime }, statusCode, message }.
 * Role lấy từ JWT (backend đặt payload.role = role_code).
 */
export const login = async (data: LoginDto): Promise<LoginResponse> => {
  if (typeof window !== 'undefined' && !BASE_URL) {
    throw new Error(
      'Chưa cấu hình API backend. Tạo file .env với NEXT_PUBLIC_SERVER_API_URL=http://localhost:2999 (đúng port backend).'
    );
  }

  const response = await apiClient.post<BackendLoginResponse>('/auth/login', {
    username: data.username.trim(),
    password: data.password,
  });

  const body = response.data;
  const authData = body?.data;

  if (!authData?.token) {
    throw new Error(body?.message ?? 'Đăng nhập thất bại: không nhận được token từ server.');
  }

  const payload = decodeJwt<UserJwtPayload>(authData.token);
  const roleFromJwt = (payload?.role ?? '').toString().toUpperCase();
  const roleFromApi = (authData as { role?: string | null }).role;
  const role = (roleFromApi ?? roleFromJwt).toString().toUpperCase().trim() || null;

  localStorage.setItem('accessToken', authData.token);
  localStorage.setItem('userId', String(authData.user_id));
  localStorage.setItem('username', data.username.trim());
  localStorage.setItem('role', role ?? '');

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
  username: string;
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

// Logout
export const handleLogout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');

    window.location.href = '/';
  }
};

/** Cập nhật role trong localStorage sau khi payment thành công (không cần re-login) */
export const updateLocalRole = (role: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('role', role);
  }
};