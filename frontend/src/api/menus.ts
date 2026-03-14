/**
 * 選單 API
 * 從 Firestore 取得選單，並解析 permission slug 供前端依權限過濾
 */

import { listMenus, listPermissions } from '@/api/firebase/rbac'
import type { MenuItem, MenuTreeNode } from '@/types/rbac'

export interface MenuItemWithSlug extends MenuItem {
  permissionSlug: string
}

/**
 * 取得所有選單項目並附上對應權限 slug
 */
export async function getMenusWithPermissionSlugs(): Promise<MenuItemWithSlug[]> {
  const [menus, permissions] = await Promise.all([listMenus(), listPermissions()])
  const slugByPermId = new Map(permissions.map(p => [p.id, p.slug]))
  return menus.map(m => ({
    ...m,
    permissionSlug: slugByPermId.get(m.permissionId) ?? ''
  }))
}

/**
 * 將扁平的選單列表組裝成樹（依 parentId、order）
 */
export function buildMenuTree(items: MenuItemWithSlug[]): MenuTreeNode[] {
  const withChildren: MenuTreeNode[] = items.map(item => ({
    ...item,
    permissionSlug: item.permissionSlug,
    children: [] as MenuTreeNode[]
  }))
  const byId = new Map(withChildren.map(n => [n.id, n]))
  const roots: MenuTreeNode[] = []

  for (const node of withChildren) {
    const parent = node.parentId ? byId.get(node.parentId) : null
    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortByOrder = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => a.order - b.order)
    nodes.forEach(n => sortByOrder(n.children))
  }
  sortByOrder(roots)
  return roots
}
