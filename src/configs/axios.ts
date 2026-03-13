import axios, { AxiosInstance, AxiosError } from 'axios';
import { BASE_URL } from '../global-configs';

/** Decode JWT payload client-side (no verification) to check expiry */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false;
    // exp is seconds since epoch; add 5s buffer
    return Date.now() / 1000 > payload.exp - 5;
  } catch {
    return true;
  }
}

export interface ErrorHandler {
  onUnauthorized?: () => void;
  onForbidden?: () => void;
  onError?: (error: CustomError) => void;
}

export interface CustomError {
  status?: number;
  message: string;
  originalError: AxiosError;
}

export class ApiClientService {
  private instance: AxiosInstance;
  private errorHandler?: ErrorHandler;

  constructor(
    baseURL: string = BASE_URL,
    timeout: number = 50000,
    errorHandler?: ErrorHandler
  ) {
    this.errorHandler = errorHandler;
    this.instance = this.createInstance(baseURL, timeout);
    this.setupInterceptors();
  }

  private createInstance(baseURL: string, timeout: number): AxiosInstance {
    return axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
  }

  private setupInterceptors(): void {
    // Request interceptor - Add token to headers (or logout if expired)
    this.instance.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
          if (isJwtExpired(token)) {
            // Backend auth.guard throws TokenExpiredError → 500 (not 401).
            // Intercept here before the request so we can logout cleanly.
            this.errorHandler?.onUnauthorized?.();
            const axiosError = new AxiosError(
              'Token hết hạn. Vui lòng đăng nhập lại.',
              '401'
            );
            const customError: CustomError = {
              status: 401,
              message: 'Token hết hạn. Vui lòng đăng nhập lại.',
              originalError: axiosError,
            };
            this.errorHandler?.onError?.(customError);
            return Promise.reject(customError);
          }
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Response interceptor - Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => this.handleError(error)
    );
  }

  private handleError(error: AxiosError): Promise<never> {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/auth/login') && error.config?.method === 'post';
    const isManagedUserRequest = error.config?.url?.includes('/users/managed') && error.config?.method === 'post';
    const isGetUsersRequest = error.config?.url?.includes('/users') && (error.config?.method === 'get' || error.config?.method === 'GET');
    // STAFF không có quyền GET /shifts/users → POS page tự xử lý fallback, không redirect /403
    const isGetShiftUsersRequest = error.config?.url?.includes('/shifts/users') && (error.config?.method === 'get' || error.config?.method === 'GET');
    // STAFF gọi POST /orders/list → để orders page tự xử lý lỗi, không redirect /403
    const isOrdersListRequest = error.config?.url?.includes('/orders/list') && (error.config?.method === 'post' || error.config?.method === 'POST');
    // GET /shop-products → SHOPOWNER + STAFF đều có quyền; tự xử lý lỗi tại component
    const isShopProductsRequest = error.config?.url?.includes('/shop-products');

    // Không auto logout trên /users/managed vì có validation ở backend
    if (status === 401 && !isLoginRequest && !isManagedUserRequest) {
      this.errorHandler?.onUnauthorized?.();
    } else if (status === 403 && !isLoginRequest && !isGetUsersRequest && !isGetShiftUsersRequest && !isOrdersListRequest && !isShopProductsRequest) {
      // 403 từ login → không redirect. GET /users → để adminApi xử lý. GET /shifts/users → POS fallback.
      // POST /orders/list → orders page xử lý. /shop-products → component tự xử lý.
      this.errorHandler?.onForbidden?.();
    }

    const customError: CustomError = {
      status,
      message: (error.response?.data as any)?.message || error.message || 'An error occurred',
      originalError: error,
    };

    this.errorHandler?.onError?.(customError);

    return Promise.reject(customError);
  }

  public getClient(): AxiosInstance {
    return this.instance;
  }
}

export const createDefaultApiClient = (): AxiosInstance => {
  const service = new ApiClientService(BASE_URL, 50000, {
    onUnauthorized: async () => {
      const { handleLogout } = await import('@/apis/auth');
      handleLogout();
    },
    onForbidden: () => {
      if (typeof window !== 'undefined') {
        window.location.href = '/403';
      }
    }
  });

  return service.getClient();
};

export const apiClient = createDefaultApiClient();

export const endpoint: any = {
  product: '/products',
  products: '/products'
};