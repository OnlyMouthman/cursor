/**
 * RBAC 權限系統型別定義
 * 依 docs/RBAC_SYSTEM_SPECIFICATION.md
 */

/** 權限 slug 格式：module.action，基底僅 view / edit */
export type PermissionSlug = string

/** 權限群組 */
export interface PermissionGroup {
  id: string
  name: string
  order: number
}

/** 權限（存於 Firestore permissions 集合） */
export interface Permission {
  id: string
  permissionGroupId: string
  name: string
  slug: PermissionSlug
  description?: string
}

/** 角色（存於 Firestore roles 集合） */
export interface Role {
  id: string
  name: string
  slug: string
  description?: string
}

/** 角色–權限關聯（存於 Firestore role_permissions 集合） */
export interface RolePermission {
  id: string
  roleId: string
  permissionId: string
}

/** 選單項目（存於 Firestore menus 集合） */
export interface MenuItem {
  id: string
  parentId: string | null
  name: string
  route: string
  icon: string
  order: number
  permissionId: string
  /** 解析後的權限 slug，由 API 或前端填入 */
  permissionSlug?: PermissionSlug
}

/** 選單樹節點（含子選單與權限 slug） */
export interface MenuTreeNode extends MenuItem {
  permissionSlug?: string
  children: MenuTreeNode[]
}

/** 基底模組 slug，用於權限自動產生 */
export const RBAC_MODULES = [
  'user',
  'role',
  'permission',
  'menu',
  'settings'
] as const

export type RbacModuleSlug = (typeof RBAC_MODULES)[number]

/** SuperAdmin 角色 slug（規格約定） */
export const SUPER_ADMIN_SLUG = 'super_admin'
