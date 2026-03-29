/**
 * Firestore RBAC 集合與 API
 * 對應規格：permission_groups, permissions, roles, role_permissions, menus
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore'
import { getFirebaseFirestore } from './config'
import type {
  Role,
  Permission,
  PermissionGroup,
  RolePermission,
  MenuItem
} from '@/types/rbac'

const firestore = () => getFirebaseFirestore()

function mapRoleFields(data: DocumentData): Omit<Role, 'id'> {
  const base: Omit<Role, 'id'> = {
    name: data.name ?? '',
    slug: data.slug ?? '',
    description: data.description
  }
  if (typeof data.isSystem === 'boolean') base.isSystem = data.isSystem
  if (typeof data.isDeletable === 'boolean') base.isDeletable = data.isDeletable
  if (typeof data.assignable === 'boolean') base.assignable = data.assignable
  return base
}

function toData<T extends { id: string }>(
  docSnap: QueryDocumentSnapshot<DocumentData>,
  map: (data: DocumentData) => Omit<T, 'id'>
): T {
  const data = docSnap.data()
  return { id: docSnap.id, ...map(data) } as T
}

// --- Permission Groups ---

export async function listPermissionGroups(): Promise<PermissionGroup[]> {
  const ref = collection(firestore(), 'permission_groups')
  const q = query(ref, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d =>
    toData<PermissionGroup>(d, data => ({
      name: data.name ?? '',
      order: data.order ?? 0
    }))
  )
}

export async function getPermissionGroup(id: string): Promise<PermissionGroup | null> {
  const ref = doc(firestore(), 'permission_groups', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toData<PermissionGroup>(snap as QueryDocumentSnapshot<DocumentData>, data => ({
    name: data.name ?? '',
    order: data.order ?? 0
  }))
}

/** 建立或覆寫權限群組（用於 seed） */
export async function setPermissionGroup(
  id: string,
  data: Omit<PermissionGroup, 'id'>
): Promise<void> {
  const ref = doc(firestore(), 'permission_groups', id)
  await setDoc(ref, { name: data.name, order: data.order }, { merge: true })
}

// --- Permissions ---

export async function listPermissions(): Promise<Permission[]> {
  const ref = collection(firestore(), 'permissions')
  const snap = await getDocs(ref)
  const list = snap.docs.map(d =>
    toData<Permission>(d, data => ({
      permissionGroupId: data.permissionGroupId ?? '',
      name: data.name ?? '',
      slug: data.slug ?? '',
      description: data.description
    }))
  )
  list.sort((a, b) => (a.permissionGroupId + a.slug).localeCompare(b.permissionGroupId + b.slug))
  return list
}

export async function listPermissionsByGroup(groupId: string): Promise<Permission[]> {
  const all = await listPermissions()
  return all.filter(p => p.permissionGroupId === groupId).sort((a, b) => a.slug.localeCompare(b.slug))
}

export async function getPermissionBySlug(slug: string): Promise<Permission | null> {
  const ref = collection(firestore(), 'permissions')
  const q = query(ref, where('slug', '==', slug))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return toData<Permission>(d, data => ({
    permissionGroupId: data.permissionGroupId ?? '',
    name: data.name ?? '',
    slug: data.slug ?? '',
    description: data.description
  }))
}

/** 建立或覆寫權限（用於 seed） */
export async function setPermission(
  id: string,
  data: Omit<Permission, 'id'>
): Promise<void> {
  const ref = doc(firestore(), 'permissions', id)
  await setDoc(
    ref,
    {
      permissionGroupId: data.permissionGroupId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null
    },
    { merge: true }
  )
}

// --- Roles ---

export async function listRoles(): Promise<Role[]> {
  const ref = collection(firestore(), 'roles')
  const q = query(ref, orderBy('slug'))
  const snap = await getDocs(q)
  return snap.docs.map(d => toData<Role>(d, mapRoleFields))
}

export async function getRole(id: string): Promise<Role | null> {
  const ref = doc(firestore(), 'roles', id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return toData<Role>(snap as QueryDocumentSnapshot<DocumentData>, mapRoleFields)
}

export async function getRoleBySlug(slug: string): Promise<Role | null> {
  const ref = collection(firestore(), 'roles')
  const q = query(ref, where('slug', '==', slug))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return toData<Role>(d, mapRoleFields)
}

/** 建立或覆寫角色（用於 seed / 管理） */
export async function setRole(id: string, data: Omit<Role, 'id'>): Promise<void> {
  const ref = doc(firestore(), 'roles', id)
  const payload: Record<string, unknown> = {
    name: data.name,
    slug: data.slug,
    description: data.description ?? null
  }
  if (typeof data.isSystem === 'boolean') payload.isSystem = data.isSystem
  if (typeof data.isDeletable === 'boolean') payload.isDeletable = data.isDeletable
  if (typeof data.assignable === 'boolean') payload.assignable = data.assignable
  await setDoc(ref, payload, { merge: true })
}

/** 新增角色（產生 id 為 role_<slug>） */
export async function createRole(data: Omit<Role, 'id'>): Promise<Role> {
  const id = `role_${data.slug}`
  await setRole(id, data)
  const created = await getRole(id)
  if (!created) throw new Error('Failed to create role')
  return created
}

/** 刪除角色（禁止刪除 super_admin；若文件含 isDeletable:false 亦禁止） */
export async function deleteRole(roleId: string): Promise<void> {
  const role = await getRole(roleId)
  if (!role) return
  if (role.isDeletable === false) {
    throw new Error('Cannot delete protected role')
  }
  const { SUPER_ADMIN_SLUG } = await import('@/types/rbac')
  if (role.slug === SUPER_ADMIN_SLUG) {
    throw new Error('Cannot delete SuperAdmin role')
  }
  await setRolePermissions(roleId, [])
  const roleRef = doc(firestore(), 'roles', roleId)
  await deleteDoc(roleRef)
}

// --- Role Permissions ---

export async function listRolePermissionsByRole(roleId: string): Promise<RolePermission[]> {
  const ref = collection(firestore(), 'role_permissions')
  const q = query(ref, where('roleId', '==', roleId))
  const snap = await getDocs(q)
  return snap.docs.map(d =>
    toData<RolePermission>(d, data => ({
      roleId: data.roleId ?? '',
      permissionId: data.permissionId ?? ''
    }))
  )
}

/** 取得角色擁有的所有權限 ID */
export async function getPermissionIdsByRoleId(roleId: string): Promise<string[]> {
  const rps = await listRolePermissionsByRole(roleId)
  return rps.map(rp => rp.permissionId)
}

/** 取得角色擁有的所有權限 slug（用於 can/canAny/canAll） */
export async function getPermissionSlugsByRoleId(roleId: string): Promise<string[]> {
  const permIds = await getPermissionIdsByRoleId(roleId)
  if (permIds.length === 0) return []
  const allPerms = await listPermissions()
  const idSet = new Set(permIds)
  return allPerms.filter(p => idSet.has(p.id)).map(p => p.slug)
}

/** 新增角色權限綁定（用於 seed） */
export async function addRolePermission(roleId: string, permissionId: string): Promise<string> {
  const ref = collection(firestore(), 'role_permissions')
  const docRef = await addDoc(ref, { roleId, permissionId })
  return docRef.id
}

/** 清除角色所有權限綁定後重新綁定（用於管理介面或 seed） */
export async function setRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
  const collRef = collection(firestore(), 'role_permissions')
  const q = query(collRef, where('roleId', '==', roleId))
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    await deleteDoc(d.ref)
  }
  for (const permissionId of permissionIds) {
    await addDoc(collRef, { roleId, permissionId })
  }
}

// --- Menus ---

export async function listMenus(): Promise<MenuItem[]> {
  const ref = collection(firestore(), 'menus')
  const q = query(ref, orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d =>
    toData<MenuItem>(d, data => ({
      parentId: data.parentId ?? null,
      name: data.name ?? '',
      route: data.route ?? '',
      icon: data.icon ?? '',
      order: data.order ?? 0,
      permissionId: data.permissionId ?? ''
    }))
  )
}

/** 建立或覆寫選單（用於 seed） */
export async function setMenu(id: string, data: Omit<MenuItem, 'id'>): Promise<void> {
  const ref = doc(firestore(), 'menus', id)
  await setDoc(
    ref,
    {
      parentId: data.parentId ?? null,
      name: data.name,
      route: data.route,
      icon: data.icon,
      order: data.order,
      permissionId: data.permissionId
    },
    { merge: true }
  )
}
