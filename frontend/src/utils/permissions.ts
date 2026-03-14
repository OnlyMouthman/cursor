/**
 * 權限管理工具
 * 
 * 設計理念：
 * 1. 現在使用 role 映射到 permissions
 * 2. 未來可擴充為細粒度 permissions（存在 Firestore 或由後端發 claim）
 * 3. 不綁死在 UI，可切換實作方式
 */

import type { UserRole, Permission, UserDocument } from '@/types/user'

/**
 * Role 到 Permissions 的映射
 * 未來可改為從 Firestore 或後端 API 取得
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'canManageUsers',
    'canEditProjects',
    'canViewReports',
    'canManageSettings'
  ],
  editor: [
    'canEditProjects',
    'canViewReports'
  ],
  viewer: [
    'canViewReports'
  ]
}

/**
 * 檢查使用者是否有特定權限
 * 
 * @param user - 使用者文件（含 role 和可選的 permissions）
 * @param permission - 要檢查的權限
 * @returns 是否有權限
 * 
 * @example
 * ```typescript
 * const user = { role: 'admin', ... }
 * if (hasPermission(user, 'canManageUsers')) {
 *   // 允許管理使用者
 * }
 * ```
 */
export function hasPermission(
  user: UserDocument | null | undefined,
  permission: Permission
): boolean {
  if (!user) {
    return false
  }

  // 如果使用者被停用，沒有權限
  if (user.status === 'disabled') {
    return false
  }

  // 優先檢查 permissions 陣列（未來擴充用）
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions.includes(permission)
  }

  // 否則使用 role 映射
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * 檢查使用者是否有任一權限
 * 
 * @param user - 使用者文件
 * @param permissions - 要檢查的權限陣列
 * @returns 是否有任一權限
 */
export function hasAnyPermission(
  user: UserDocument | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.some(perm => hasPermission(user, perm))
}

/**
 * 檢查使用者是否有所有權限
 * 
 * @param user - 使用者文件
 * @param permissions - 要檢查的權限陣列
 * @returns 是否有所有權限
 */
export function hasAllPermissions(
  user: UserDocument | null | undefined,
  permissions: Permission[]
): boolean {
  return permissions.every(perm => hasPermission(user, perm))
}

/**
 * 取得使用者的所有權限
 * 
 * @param user - 使用者文件
 * @returns 權限陣列
 */
export function getUserPermissions(user: UserDocument | null | undefined): Permission[] {
  if (!user || user.status === 'disabled') {
    return []
  }

  // 優先使用 permissions 陣列
  if (user.permissions && user.permissions.length > 0) {
    return user.permissions as Permission[]
  }

  // 否則使用 role 映射
  return ROLE_PERMISSIONS[user.role] || []
}


