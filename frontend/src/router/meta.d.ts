import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresPermission?: string
    /** 平台／模組識別，供 RBAC 與側欄擴展 */
    module?: 'platform' | 'manage' | 'notes' | 'gis' | 'ar'
    /**
     * 可選：此頁「編輯／操作」所需權限 slug（如 notes.edit）。
     * 未設定時，已登入且帳號啟用即視為可編輯；設定後由 usePageAccess / hasPermission 判定。
     */
    editablePermission?: string
  }
}

export {}
