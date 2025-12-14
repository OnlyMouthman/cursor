/**
 * 全域型別定義
 */

// 使用者型別範例
export interface User {
  id: string
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

// 通用分頁型別
export interface Pagination {
  page: number
  pageSize: number
  total: number
}


