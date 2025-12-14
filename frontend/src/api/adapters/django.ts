/**
 * Django 適配器範例
 * 展示如何切換到 Django 後端
 * 
 * 使用方式：
 * 1. 將 src/api/client.ts 中的 firestoreClient 替換為此適配器
 * 2. 所有業務邏輯無需修改
 */

import type { ApiClient, ApiResponse, RequestConfig } from '../types'

class DjangoApiClient implements ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
  }

  private async request<T>(
    method: string,
    path: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const url = new URL(path, this.baseURL)
      
      // 處理查詢參數
      if (config?.params) {
        Object.entries(config.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value))
        })
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config?.headers
      }

      const options: RequestInit = {
        method,
        headers
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data)
      }

      const response = await fetch(url.toString(), options)
      const result = await response.json()

      if (!response.ok) {
        return {
          data: null as any,
          error: result.message || 'Request failed'
        }
      }

      return {
        data: result
      }
    } catch (error: any) {
      return {
        data: null as any,
        error: error.message
      }
    }
  }

  async get<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, config)
  }

  async post<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, data, config)
  }

  async put<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, data, config)
  }

  async patch<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, data, config)
  }

  async delete<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, config)
  }
}

export const djangoClient = new DjangoApiClient()


