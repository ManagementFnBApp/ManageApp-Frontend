import { apiClient } from '../configs/axios';

// Login
export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  if (response.data.access_token) {
    localStorage.setItem('accessToken', response.data.access_token);
  }
  return response.data;
};

// Register
export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
}

export const register = async (data: RegisterDto): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>('/auth/register', data);
  return response.data;
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
    // 1. Xóa token cũ (nếu bạn lưu ở localStorage/sessionStorage)
    localStorage.removeItem('accessToken'); 
    
    // 2. Lấy đường dẫn hiện tại để sau khi login xong thì quay lại
    const currentPath = window.location.pathname;
    
    // 3. Chặn vòng lặp: Nếu đang ở trang login rồi thì không redirect nữa
    if (currentPath === '/auth') {
      return; 
    }

    // 4. Chuyển hướng kèm theo param ?next=...
    // encodeURIComponent để đảm bảo URL không bị lỗi ký tự đặc biệt
    window.location.href = `/auth?next=${encodeURIComponent(currentPath)}`;
  }
};