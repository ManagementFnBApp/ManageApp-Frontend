import axios from "axios";
import { BASE_URL } from "../global-configs";
import { handleLogout } from "@/apis/auth";

const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 1000,
    headers: { 
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

axios.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      handleLogout();
      // Trả về promise reject để component ngừng xử lý
      return Promise.reject(error); 
    }

    // Case 2: Lỗi 403 (Forbidden) - Có token nhưng không đủ quyền
    if (error.response?.status === 403) {
      // Tùy chọn: Redirect sang trang thông báo "Không có quyền truy cập"
      // window.location.href = '/403';
    }

    // Format lại error message cho gọn
    const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Mẹo: Trả về object lỗi có cấu trúc thống nhất
    return Promise.reject({
      status: error.response?.status,
      message: errorMessage,
      originalError: error
    });
  }
);