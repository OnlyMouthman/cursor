/**
 * Notes 模組（Step 5）：Markdown → 安全 HTML，供 `NoteEditorPanel` 預覽使用。
 * 若日後需縮小首屏 bundle，可改為在切換至 preview 時再 dynamic import('marked')。
 */
import DOMPurify from 'dompurify'
import { marked } from 'marked'

marked.use({
  gfm: true,
  breaks: true
})

/**
 * 將 Markdown 轉成可安全插入 DOM 的 HTML 字串。
 * 空字串回傳空字串（由呼叫端決定空狀態 UI）。
 */
export function markdownToSafeHtml(markdown: string): string {
  const src = markdown ?? ''
  if (!src.trim()) {
    return ''
  }
  const raw = marked.parse(src, { async: false }) as string
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true }
  })
}
