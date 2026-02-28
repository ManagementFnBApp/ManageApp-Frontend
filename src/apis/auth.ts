import { apiClient } from "../configs/axios";
import { BASE_URL } from "../global-configs";
import { decodeJwt, UserJwtPayload } from "../lib/jwt";

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
  // User login: POST /auth/login
  const response = await apiClient.post<
    { data?: { user_id: number; token: string; expiredTime: number } } & {
      user_id: number;
      token: string;
      expiredTime: number;
    }
  >("/auth/login", { username: data.username, password: data.password });
  const authData = response.data?.data ?? response.data;
  if (authData?.token) {
    // Decode JWT để lấy role thực sự (SHOPOWNER, null, ...)
    const payload = decodeJwt<UserJwtPayload>(authData.token);
    const userRole = payload?.role ?? null; // null = chưa mua gói
    localStorage.setItem("accessToken", authData.token);
    localStorage.setItem("userId", String(authData.user_id));
    localStorage.setItem("username", data.username);
    localStorage.setItem("role", userRole ?? "");
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

export const register = async (
  data: RegisterDto,
): Promise<RegisterResponse> => {
  const registerPayload = {
    username: data.username.trim(),
    email: data.email.trim(),
    password: data.password,
  };
  const response = await apiClient.post<
    { data?: RegisterResponse } & RegisterResponse
  >("/auth/register", registerPayload);
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

export const forgotPassword = async (
  data: ForgotPasswordDto,
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    data,
  );
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

export const resetPassword = async (
  data: ResetPasswordDto,
): Promise<ResetPasswordResponse> => {
  const response = await apiClient.post<ResetPasswordResponse>(
    "/auth/reset-password",
    data,
  );
  return response.data;
};

// Logout
export const handleLogout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("role");

    window.location.href = "/";
  }
};

/** Cập nhật role trong localStorage sau khi payment thành công (không cần re-login) */
export const updateLocalRole = (role: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("role", role);
  }
};
