/**
 * API 使用的 Composables
 * 提供響應式的 API 呼叫封裝
 */

import { ref, type Ref } from 'vue'
import { api, type ApiResponse } from '@/api/client'

export function useApi<T = any>() {
  const data: Ref<T | null> = ref(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function execute(
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      const response = await apiCall()
      if (response.error) {
        error.value = response.error
        return null
      }
      data.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.message || 'An error occurred'
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    execute
  }
}


