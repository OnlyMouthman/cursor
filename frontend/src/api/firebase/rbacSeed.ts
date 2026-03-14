/**
 * RBAC 權限自動產生與種子資料
 * 依規格：模組註冊 → 自動產生 module.view / module.edit
 */

import {
  setPermissionGroup,
  setPermission,
  setRole,
  setMenu,
  listPermissions,
  getRoleBySlug,
  getPermissionBySlug,
  setRolePermissions
} from './rbac'
import { RBAC_MODULES, SUPER_ADMIN_SLUG } from '@/types/rbac'

/** 權限群組 ID（固定以利關聯） */
export const PERMISSION_GROUP_IDS = {
  userManagement: 'pg_user',
  roleManagement: 'pg_role',
  permissionManagement: 'pg_permission',
  menuManagement: 'pg_menu',
  system: 'pg_system'
} as const

/** 角色 ID（固定以利 users.roleId 關聯） */
export const ROLE_IDS = {
  superAdmin: 'role_super_admin',
  admin: 'role_admin',
  editor: 'role_editor',
  viewer: 'role_viewer'
} as const

/** 模組對應的權限群組 ID */
const MODULE_TO_GROUP: Record<string, string> = {
  user: PERMISSION_GROUP_IDS.userManagement,
  role: PERMISSION_GROUP_IDS.roleManagement,
  permission: PERMISSION_GROUP_IDS.permissionManagement,
  menu: PERMISSION_GROUP_IDS.menuManagement,
  settings: PERMISSION_GROUP_IDS.system
}

/** 權限 ID 命名：perm_{module}_{action} */
function permissionId(module: string, action: string): string {
  return `perm_${module}_${action}`
}

/**
 * 同步權限群組與權限（依 RBAC_MODULES 自動產生 view / edit）
 */
export async function seedPermissionGroupsAndPermissions(): Promise<void> {
  await setPermissionGroup('pg_user', { name: 'User Management', order: 10 })
  await setPermissionGroup('pg_role', { name: 'Role Management', order: 20 })
  await setPermissionGroup('pg_permission', { name: 'Permission Management', order: 30 })
  await setPermissionGroup('pg_menu', { name: 'Menu Management', order: 40 })
  await setPermissionGroup('pg_system', { name: 'System', order: 50 })

  for (const module of RBAC_MODULES) {
    const groupId = MODULE_TO_GROUP[module] ?? PERMISSION_GROUP_IDS.system
    const namePrefix = module.charAt(0).toUpperCase() + module.slice(1)
    await setPermission(permissionId(module, 'view'), {
      permissionGroupId: groupId,
      name: `${namePrefix} View`,
      slug: `${module}.view`
    })
    await setPermission(permissionId(module, 'edit'), {
      permissionGroupId: groupId,
      name: `${namePrefix} Edit`,
      slug: `${module}.edit`
    })
  }
}

/**
 * 同步角色
 */
export async function seedRoles(): Promise<void> {
  await setRole(ROLE_IDS.superAdmin, {
    name: 'Super Admin',
    slug: SUPER_ADMIN_SLUG,
    description: 'Bypasses all permission checks'
  })
  await setRole(ROLE_IDS.admin, {
    name: 'Admin',
    slug: 'admin',
    description: 'Full access to user, role, menu, settings'
  })
  await setRole(ROLE_IDS.editor, {
    name: 'Editor',
    slug: 'editor',
    description: 'Limited edit access'
  })
  await setRole(ROLE_IDS.viewer, {
    name: 'Viewer',
    slug: 'viewer',
    description: 'View only'
  })
}

/**
 * 同步角色權限綁定
 */
export async function seedRolePermissions(): Promise<void> {
  const allPerms = await listPermissions()
  const superAdminRole = await getRoleBySlug(SUPER_ADMIN_SLUG)
  const superAdminRoleId = superAdminRole?.id ?? ROLE_IDS.superAdmin

  const adminSlugs = [
    'user.view', 'user.edit',
    'role.view', 'role.edit',
    'menu.view', 'menu.edit',
    'settings.view', 'settings.edit'
  ]
  const editorSlugs = ['user.view', 'settings.view']
  const viewerSlugs = ['user.view', 'settings.view']

  const slugToId = new Map(allPerms.map(p => [p.slug, p.id]))

  const bindRoleSlugs = async (roleId: string, slugs: string[]) => {
    const ids = slugs.map(s => slugToId.get(s)).filter(Boolean) as string[]
    await setRolePermissions(roleId, ids)
  }

  await setRolePermissions(superAdminRoleId, allPerms.map(p => p.id))
  await bindRoleSlugs(ROLE_IDS.admin, adminSlugs)
  await bindRoleSlugs(ROLE_IDS.editor, editorSlugs)
  await bindRoleSlugs(ROLE_IDS.viewer, viewerSlugs)
}

/**
 * 同步選單（需先有 permissions）
 */
export async function seedMenus(): Promise<void> {
  const dashboardPerm = await getPermissionBySlug('user.view')
  const dashboardPermId = dashboardPerm?.id ?? 'perm_user_view'
  const userViewPerm = await getPermissionBySlug('user.view')
  const userViewPermId = userViewPerm?.id ?? 'perm_user_view'
  const roleViewPerm = await getPermissionBySlug('role.view')
  const roleViewPermId = roleViewPerm?.id ?? 'perm_role_view'
  const settingsViewPerm = await getPermissionBySlug('settings.view')
  const settingsViewPermId = settingsViewPerm?.id ?? 'perm_settings_view'

  await setMenu('menu_dashboard', {
    parentId: null,
    name: 'menu.dashboard',
    route: '/manage',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    order: 0,
    permissionId: dashboardPermId
  })
  await setMenu('menu_users', {
    parentId: null,
    name: 'menu.userManagement',
    route: '/manage/users',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    order: 10,
    permissionId: userViewPermId
  })
  await setMenu('menu_roles', {
    parentId: null,
    name: 'menu.roleManagement',
    route: '/manage/roles',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.187-.367-3.124M12 9v2m0 4h.01',
    order: 20,
    permissionId: roleViewPermId
  })
  await setMenu('menu_settings', {
    parentId: null,
    name: 'menu.settings',
    route: '/manage/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    order: 30,
    permissionId: settingsViewPermId
  })
}

export async function seedRbac(): Promise<void> {
  await seedPermissionGroupsAndPermissions()
  await seedRoles()
  await seedRolePermissions()
  await seedMenus()
}
