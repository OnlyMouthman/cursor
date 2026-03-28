import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permissions'
import { getDeepestRouteMetaValue } from '@/utils/access'
import type { PermissionSlug } from '@/types/rbac'

export type PageAccessMode = 'view' | 'edit'

/**
 * 平台層：瀏覽模式（view）／編輯模式（edit）
 * - 未登入或帳號停用 → 僅 view
 * - 已登入且啟用、且路由未設 editablePermission → 視為可編輯（模組骨架預設）
 * - 路由設了 editablePermission 時 → 依 RBAC hasPermission 決定（預留擴充）
 */
export function usePageAccess() {
  const route = useRoute()
  const userStore = useUserStore()

  const isLoggedIn = computed(() => userStore.isAuthenticated)

  const editablePermission = computed((): string | undefined => {
    const raw = getDeepestRouteMetaValue(route.matched, 'editablePermission')
    return typeof raw === 'string' ? raw : undefined
  })

  const canEdit = computed((): boolean => {
    if (!userStore.isAuthenticated || !userStore.isActive) return false
    const perm = editablePermission.value
    if (!perm) return true
    return hasPermission(userStore.currentUser, perm as PermissionSlug)
  })

  const mode = computed((): PageAccessMode => (canEdit.value ? 'edit' : 'view'))

  /** 未登入訪客：顯示「請登入以使用編輯」類提示 */
  const showGuestViewNotice = computed(() => !isLoggedIn.value)

  /** 已登入但不可編輯（例如無權限）：顯示僅瀏覽說明 */
  const showNoEditPermissionNotice = computed(
    () => isLoggedIn.value && !canEdit.value
  )

  return {
    isLoggedIn,
    canEdit,
    mode,
    editablePermission,
    showGuestViewNotice,
    showNoEditPermissionNotice
  }
}
