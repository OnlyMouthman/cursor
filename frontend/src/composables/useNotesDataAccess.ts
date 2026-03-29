import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permissions'
import type { PermissionSlug } from '@/types/rbac'

/**
 * Notes 讀取範圍（與 `notesUseFullReadQueries` 一致）：
 * - 已登入且 active，且具 notes.view 或 notes.edit → 可查詢含 private 的完整資料
 * - 否則（訪客或無上述權限）→ 僅 public，與 Step 3 查詢一致
 */
export function useNotesDataAccess() {
  const userStore = useUserStore()

  const canReadAllNotes = computed((): boolean => {
    if (!userStore.isAuthenticated || !userStore.isActive) return false
    const u = userStore.currentUser
    if (!u) return false
    return (
      hasPermission(u, 'notes.view' as PermissionSlug) ||
      hasPermission(u, 'notes.edit' as PermissionSlug)
    )
  })

  const canViewPrivateNotes = canReadAllNotes

  const hasNotesViewPermission = computed((): boolean => {
    if (!userStore.isAuthenticated || !userStore.isActive) return false
    const u = userStore.currentUser
    if (!u) return false
    return hasPermission(u, 'notes.view' as PermissionSlug)
  })

  return {
    canReadAllNotes,
    canViewPrivateNotes,
    hasNotesViewPermission
  }
}
