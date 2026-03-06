import axios, { AxiosInstance, AxiosError } from 'axios';
import { BASE_URL } from '../global-configs';

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
    // Request interceptor - Add token to headers
    this.instance.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
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

    if (status === 401) {
      this.errorHandler?.onUnauthorized?.();
    } else if (status === 403) {
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
