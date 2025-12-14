/**
 * API 統一型別定義
 * 這些型別確保無論使用哪個後端，介面都保持一致
 */

export interface ApiResponse<T = any> {
  data: T
  message?: string
  error?: string
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

export interface RequestConfig {
  headers?: Record<string, string>
  params?: Record<string, any>
  timeout?: number
}

export interface ApiClient {
  get<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>>
  post<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>
  put<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>
  patch<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>>
  delete<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>>
}


