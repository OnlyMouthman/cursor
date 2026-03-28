import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    requiresPermission?: string
    /** 平台／模組識別，供 RBAC 與側欄擴展 */
    module?: 'platform' | 'manage' | 'notes' | 'gis' | 'ar'
  }
}

export {}
