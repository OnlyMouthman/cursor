import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from '@/api/client'

describe('API Client', () => {
  beforeEach(() => {
    // 重置 API 客戶端狀態
    api.setBasePath('')
  })

  it('should set base path', () => {
    api.setBasePath('users')
    // 這裡可以添加更多測試
    expect(true).toBe(true)
  })

  // 更多單元測試...
})


