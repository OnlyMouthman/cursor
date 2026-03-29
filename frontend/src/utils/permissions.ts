/**
 * 權限檢查 Helper（RBAC 規格）
 * 使用 module.action 格式（如 user.view, user.edit）
 * 委派給 permission store；SuperAdmin 一律通過
 */

import { usePermissionStore, GUEST_LOADED_UID } from '@/stores/permission'
import type { PermissionSlug } from '@/types/rbac'
import type { UserDocument } from '@/types/user'

/**
 * 檢查使用者是否有特定權限
 * 需在 permission store 已為該使用者載入後使用（通常由 user store init 觸發）
 */
export function hasPermission(
  user: UserDocument | null | undefined,
  permission: PermissionSlug
): boolean {
  const permStore = usePermissionStore()

  if (!user) {
    if (permStore.loadedForUid !== GUEST_LOADED_UID) return false
    return permStore.can(permission)
  }

  if (user.status === 'disabled') return false
  if (permStore.loadedForUid !== user.uid) return false
  return permStore.can(permission)
}

/**
 * 檢查使用者是否有任一權限
 */
export function hasAnyPermission(
  user: UserDocument | null | undefined,
  permissions: PermissionSlug[]
): boolean {
  const permStore = usePermissionStore()

  if (!user) {
    if (permStore.loadedForUid !== GUEST_LOADED_UID) return false
    return permissions.some(perm => permStore.can(perm))
  }

  if (user.status === 'disabled') return false
  if (permStore.loadedForUid !== user.uid) return false
  return permissions.some(perm => permStore.can(perm))
}

/**
 * 檢查使用者是否有所有權限
 */
export function hasAllPermissions(
  user: UserDocument | null | undefined,
  permissions: PermissionSlug[]
): boolean {
  const permStore = usePermissionStore()

  if (!user) {
    if (permStore.loadedForUid !== GUEST_LOADED_UID) return false
    return permissions.every(perm => permStore.can(perm))
  }

  if (user.status === 'disabled') return false
  if (permStore.loadedForUid !== user.uid) return false
  return permissions.every(perm => permStore.can(perm))
}

/**
 * 取得當前使用者的權限列表（由 permission store 提供）
 * 若尚未載入則回傳空陣列
 */
export function getUserPermissions(user: UserDocument | null | undefined): PermissionSlug[] {
  const permStore = usePermissionStore()

  if (!user) {
    if (permStore.loadedForUid !== GUEST_LOADED_UID) return []
    const slugs = permStore.permissionSlugs
    return slugs[0] === '*' ? [] : [...slugs]
  }

  if (user.status === 'disabled') return []
  if (permStore.loadedForUid !== user.uid) return []
  const slugs = permStore.permissionSlugs
  return slugs[0] === '*' ? [] : [...slugs]
}
