/**
 * RBAC 權限 Store
 * 規格：can(permission)、canAny([])、canAll([])、SuperAdmin 一律 true、快取 permission:{uid}
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getRole, getRoleBySlug, getPermissionSlugsByRoleId } from '@/api/firebase/rbac'
import { SUPER_ADMIN_SLUG } from '@/types/rbac'
import type { PermissionSlug } from '@/types/rbac'

const CACHE_KEY_PREFIX = 'permission:'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

interface CacheEntry {
  slugs: string[]
  roleSlug: string | null
  at: number
}

function getCache(uid: string): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + uid)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    if (Date.now() - entry.at > CACHE_TTL_MS) return null
    return entry
  } catch {
    return null
  }
}

function setCache(uid: string, slugs: string[], roleSlug: string | null): void {
  try {
    localStorage.setItem(
      CACHE_KEY_PREFIX + uid,
      JSON.stringify({ slugs, roleSlug, at: Date.now() } as CacheEntry)
    )
  } catch {
    // ignore
  }
}

function clearCache(uid: string): void {
  try {
    localStorage.removeItem(CACHE_KEY_PREFIX + uid)
  } catch {
    // ignore
  }
}

export const usePermissionStore = defineStore('permission', () => {
  const permissionSlugs = ref<string[]>([])
  const roleSlug = ref<string | null>(null)
  const loadedForUid = ref<string | null>(null)

  const isSuperAdmin = computed(() => roleSlug.value === SUPER_ADMIN_SLUG)

  /** 載入指定使用者的權限（由 roleId 或 legacy role slug 解析） */
  async function loadForUser(
    uid: string,
    roleId: string | null | undefined,
    legacyRole?: string
  ): Promise<string[]> {
    const cached = getCache(uid)
    if (cached && cached.slugs[0] !== '*') {
      permissionSlugs.value = cached.slugs
      roleSlug.value = cached.roleSlug
      loadedForUid.value = uid
      return cached.slugs
    }
    if (cached && cached.slugs[0] === '*') {
      permissionSlugs.value = cached.slugs
      roleSlug.value = cached.roleSlug
      loadedForUid.value = uid
      return cached.slugs
    }

    let slugs: string[] = []
    let resolvedRoleSlug: string | null = null

    if (roleId) {
      const role = await getRole(roleId)
      if (role) {
        resolvedRoleSlug = role.slug
        if (role.slug === SUPER_ADMIN_SLUG) {
          slugs = ['*']
        } else {
          slugs = await getPermissionSlugsByRoleId(roleId)
        }
      }
    } else if (legacyRole) {
      const role = await getRoleBySlug(legacyRole)
      if (role) {
        resolvedRoleSlug = role.slug
        if (role.slug === SUPER_ADMIN_SLUG) {
          slugs = ['*']
        } else {
          slugs = await getPermissionSlugsByRoleId(role.id)
        }
      }
    }

    roleSlug.value = resolvedRoleSlug
    permissionSlugs.value = slugs
    loadedForUid.value = uid
    setCache(uid, slugs, resolvedRoleSlug)
    return slugs
  }

  function clear() {
    permissionSlugs.value = []
    roleSlug.value = null
    if (loadedForUid.value) {
      clearCache(loadedForUid.value)
      loadedForUid.value = null
    }
  }

  /** 是否擁有單一權限；SuperAdmin 一律 true */
  function can(permission: PermissionSlug): boolean {
    if (isSuperAdmin.value) return true
    const slugs = permissionSlugs.value
    if (slugs.includes('*')) return true
    return slugs.includes(permission)
  }

  /** 是否擁有任一權限 */
  function canAny(permissions: PermissionSlug[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.some(p => can(p))
  }

  /** 是否擁有全部權限 */
  function canAll(permissions: PermissionSlug[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.every(p => can(p))
  }

  return {
    permissionSlugs,
    roleSlug,
    loadedForUid,
    isSuperAdmin,
    loadForUser,
    clear,
    can,
    canAny,
    canAll
  }
})
