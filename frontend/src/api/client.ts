/**
 * API 客戶端統一入口
 * 這是整個專案的核心抽象層
 * 
 * 設計理念：
 * 1. 提供 RESTful 風格的統一介面
 * 2. 隱藏 Firebase 的具體實作
 * 3. 未來可無縫切換到 Django 或其他後端
 */

import { firestoreClient } from './firebase/firestore'
import type { ApiClient, ApiResponse, RequestConfig } from './types'

/**
 * 統一的 API 客戶端
 * 目前使用 Firestore 實作，未來可切換為 HTTP 客戶端
 */
class ApiClientImpl implements ApiClient {
  /**
   * 設定基礎路徑（collection 名稱）
   * 例如：api.setBasePath('users') 後，所有操作都在 users collection 下
   */
  setBasePath(path: string): void {
    firestoreClient.setBasePath(path)
  }

  /**
   * GET 請求
   * @param path - 文件 ID 或路徑
   * @param config - 請求配置
   * 
   * 範例：
   * - api.get('users/123') - 取得單一文件
   * - api.get('users', { params: { where: { status: 'active' } } }) - 查詢列表
   */
  async get<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    // 判斷是取得單一文件還是列表
    // 如果 path 包含 '/' 且最後一段不是查詢參數，視為單一文件
    const parts = path.split('/')
    
    if (parts.length === 1 || (parts.length === 2 && !config?.params)) {
      // 單一文件：users/123
      return firestoreClient.get<T>(path, config)
    } else {
      // 列表查詢：users
      return firestoreClient.list<T>(parts[0], config)
    }
  }

  /**
   * POST 請求 - 新增資源
   * @param path - Collection 路徑
   * @param data - 要新增的資料
   */
  async post<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return firestoreClient.post<T>(path, data, config)
  }

  /**
   * PUT 請求 - 完整更新資源
   * @param path - 文件路徑（包含 ID）
   * @param data - 完整的更新資料
   */
  async put<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return firestoreClient.put<T>(path, data, config)
  }

  /**
   * PATCH 請求 - 部分更新資源
   * @param path - 文件路徑（包含 ID）
   * @param data - 部分更新資料
   */
  async patch<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return firestoreClient.patch<T>(path, data, config)
  }

  /**
   * DELETE 請求 - 刪除資源
   * @param path - 文件路徑（包含 ID）
   */
  async delete<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return firestoreClient.delete<T>(path, config)
  }
}

/**
 * 匯出單例 API 客戶端
 * 使用方式：
 * 
 * import { api } from '@/api/client'
 * 
 * // 設定基礎路徑
 * api.setBasePath('users')
 * 
 * // 取得列表
 * const users = await api.get('', { params: { where: { status: 'active' } } })
 * 
 * // 取得單一文件
 * const user = await api.get('123')
 * 
 * // 新增
 * const newUser = await api.post('', { name: 'John', email: 'john@example.com' })
 * 
 * // 更新
 * await api.put('123', { name: 'Jane' })
 * 
 * // 刪除
 * await api.delete('123')
 */
export const api = new ApiClientImpl()

/**
 * 未來切換到 Django 時的範例實作
 * 
 * 只需修改此檔案，將 firestoreClient 替換為 httpClient：
 * 
 * class ApiClientImpl implements ApiClient {
 *   async get<T>(path: string, config?: RequestConfig): Promise<ApiResponse<T>> {
 *     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/${path}`, {
 *       method: 'GET',
 *       headers: config?.headers
 *     })
 *     return await response.json()
 *   }
 *   // ... 其他方法
 * }
 */


