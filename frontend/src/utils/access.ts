/**
 * 路由 meta 讀取：由最深（子）層往上找第一個已定義的 meta 欄位
 * 供公開瀏覽／編輯權限判斷與 usePageAccess 使用
 */

import type { RouteLocationMatched } from 'vue-router'

export function getDeepestRouteMetaValue(
  matched: readonly RouteLocationMatched[],
  key: string
): unknown {
  for (let i = matched.length - 1; i >= 0; i--) {
    const meta = matched[i].meta as Record<string, unknown>
    const v = meta[key]
    if (v !== undefined && v !== '') return v
  }
  return undefined
}
