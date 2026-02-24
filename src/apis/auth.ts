import { apiClient } from '../configs/axios';

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
}

export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await apiClient.post<{ data?: LoginResponse } & LoginResponse>('/auth/login', data);
  // Backend wraps in ResponseData: { data, statusCode, message }
  const authData = response.data?.data ?? response.data;
  if (authData?.token) {
    localStorage.setItem('accessToken', authData.token);
    localStorage.setItem('userId', authData.user_id.toString());
    if (authData.username) {
      localStorage.setItem('username', authData.username);
    }
  }
  return authData as LoginResponse;
};

// Register
export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  username?: string;
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
    email: data.email,
    password: data.password,
    fullName: data.fullName,
    username: data.username || data.email.split('@')[0],
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

    // Sau khi đăng xuất, luôn quay về trang chủ
    window.location.href = '/';
  }
};