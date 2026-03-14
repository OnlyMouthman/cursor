/**
 * 使用者相關型別定義
 */

/**
 * 使用者角色
 */
export type UserRole = 'admin' | 'editor' | 'viewer'

/**
 * 使用者狀態
 */
export type UserStatus = 'active' | 'disabled'

/**
 * 權限字串（可擴充）
 */
export type Permission =
  | 'canManageUsers'      // 管理使用者
  | 'canEditProjects'     // 編輯專案
  | 'canViewReports'      // 查看報表
  | 'canManageSettings'   // 管理設定
  // 未來可擴充更多權限

/**
 * Firestore 使用者文件結構
 */
export interface UserDocument {
  uid: string
  email: string
  displayName: string
  photoURL: string
  role: UserRole
  status: UserStatus
  createdAt: Date | string
  lastLoginAt: Date | string | null
  permissions?: string[] // 預留：未來可擴充細粒度權限
}

/**
 * 使用者列表查詢參數
 */
export interface UserListParams {
  search?: string // 搜尋 displayName 或 email
  role?: UserRole // 角色篩選
  status?: UserStatus // 狀態篩選
}

/**
 * 更新使用者角色參數
 */
export interface UpdateUserRoleParams {
  uid: string
  role: UserRole
}

/**
 * 更新使用者狀態參數
 */
export interface UpdateUserStatusParams {
  uid: string
  status: UserStatus
}


