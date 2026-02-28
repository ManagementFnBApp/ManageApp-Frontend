import { apiClient } from '../configs/axios';
import { BASE_URL } from '../global-configs';
import { decodeJwt, UserJwtPayload } from '../lib/jwt';

// Login
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: number;
  username?: string;
  token: string;
  expiredTime: number;
  role?: string | null; // 'admin', 'SHOPOWNER', null (user chưa mua gói), etc.
}

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

  const authData = json?.data ?? json;
  if (authData?.token) {
    const payload = decodeJwt<UserJwtPayload>(authData.token);
    const userRole = payload?.role ?? null;
    localStorage.setItem('accessToken', authData.token);
    localStorage.setItem('userId', String(authData.user_id));
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', userRole ?? '');
  }
  const payload = decodeJwt<UserJwtPayload>(authData.token);
  return {
    user_id: authData.user_id,
    username: data.username,
    token: authData.token,
    expiredTime: authData.expiredTime,
    role: payload?.role ?? null,
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

export interface ForgotPasswordResponse {
  message: string;
}

export const forgotPassword = async (data: ForgotPasswordDto): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>('/auth/forgot-password', data);
  return response.data;
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
  const response = await apiClient.post<ResetPasswordResponse>('/auth/reset-password', data);
  return response.data;
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