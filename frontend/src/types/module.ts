/**
 * 平台模組識別（Router / Sidebar / 未來 RBAC meta）
 */
export type PlatformModuleKey = 'notes' | 'gis' | 'ar' | 'manage'

/** Hub、About 等非模組殼層 */
export type PlatformShellModule = 'platform'

export type RouteModuleMeta = PlatformModuleKey | PlatformShellModule

/** Hub 卡片（可日後改為 API／設定檔） */
export interface HubModuleCard {
  key: PlatformModuleKey
  name: string
  path: string
  description?: string
}

export const HUB_MODULE_CARDS: HubModuleCard[] = [
  { key: 'notes', name: 'Notes', path: '/notes', description: '筆記與文件（預留）' },
  { key: 'gis', name: 'GIS', path: '/gis', description: '地理資訊（預留）' },
  { key: 'ar', name: 'AR', path: '/ar', description: '擴增實境（預留）' }
]

/** 側欄假資料（非 manage 時使用） */
export interface StubMenuNode {
  id: string
  name: string
  route: string
  icon: string
  children?: StubMenuNode[]
}

const ICON_HOME =
  'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'

const ICON_CUBE =
  'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'

export const MODULE_STUB_MENUS: Record<PlatformModuleKey, StubMenuNode[]> = {
  notes: [
    { id: 'notes-home', name: 'Notes 首頁', route: '/notes', icon: ICON_HOME },
    { id: 'notes-explore', name: '探索（佔位）', route: '/notes/explore', icon: ICON_CUBE }
  ],
  gis: [
    { id: 'gis-home', name: 'GIS 首頁', route: '/gis', icon: ICON_HOME },
    { id: 'gis-explore', name: '圖層（佔位）', route: '/gis/explore', icon: ICON_CUBE }
  ],
  ar: [
    { id: 'ar-home', name: 'AR 首頁', route: '/ar', icon: ICON_HOME },
    { id: 'ar-explore', name: '場景（佔位）', route: '/ar/explore', icon: ICON_CUBE }
  ],
  manage: []
}

export function sidebarTitleKey(module: PlatformModuleKey | 'manage'): string {
  switch (module) {
    case 'notes':
      return 'module.sidebarTitleNotes'
    case 'gis':
      return 'module.sidebarTitleGis'
    case 'ar':
      return 'module.sidebarTitleAr'
    case 'manage':
      return 'menu.manageTitle'
    default:
      return 'menu.manageTitle'
  }
}
