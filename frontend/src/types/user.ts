/**
 * 使用者相關型別定義
 * RBAC：使用者透過 roleId 關聯至單一角色，權限由角色取得
 */

import type { PermissionSlug } from './rbac'

/**
 * 使用者角色（舊版 slug，保留以相容既有資料；新資料以 roleId 為準）
 */
export type UserRole = 'admin' | 'editor' | 'viewer'

/**
 * 使用者狀態
 */
export type UserStatus = 'active' | 'disabled'

/**
 * 權限字串：RBAC 規格為 module.action（如 user.view, user.edit）
 * @deprecated 請改用 PermissionSlug (types/rbac)
 */
export type Permission = PermissionSlug

/**
 * Firestore 使用者文件結構
 */
export interface UserDocument {
  uid: string
  email: string
  displayName: string
  photoURL: string
  /** 角色 ID（Firestore roles 文件 id）；有值時以 RBAC 角色為準 */
  roleId?: string | null
  /**
   * 角色 slug（舊版欄位，相容用）
   * 若無 roleId 則以此判斷；新建立使用者應寫入 roleId
   */
  role: UserRole
  status: UserStatus
  createdAt: Date | string
  lastLoginAt: Date | string | null
  /** 由角色解析出的權限 slug 列表，可選快取於前端 */
  permissions?: PermissionSlug[]
}

/**
 * 使用者列表查詢參數
 */
export interface UserListParams {
  search?: string // 搜尋 displayName 或 email
  role?: UserRole // 角色篩選（舊版 slug）
  roleId?: string // 角色篩選（RBAC role 文件 id）
  status?: UserStatus // 狀態篩選
}

/**
 * 更新使用者角色參數（以角色 slug 指定，相容舊版）
 */
export interface UpdateUserRoleParams {
  uid: string
  role: UserRole
}

/**
 * 更新使用者角色參數（RBAC：以 roleId 指定）
 */
export interface UpdateUserRoleIdParams {
  uid: string
  roleId: string
}

/**
 * 更新使用者狀態參數
 */
export interface UpdateUserStatusParams {
  uid: string
  status: UserStatus
}


