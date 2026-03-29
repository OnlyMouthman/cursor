/**
 * Notes 模組資料模型（對應 docs/notes_module.md）
 * 欄位命名採 camelCase，與 Firestore 存檔一致，未來對接 REST 時可再建 adapter。
 */

export type NoteFormat = 'text' | 'markdown'

/** 分類（Firestore：notes_groups） */
export interface NoteGroup {
  id: string
  name: string
  /** 根節點為 null */
  parentId: string | null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

/** 樹狀 API 回傳節點 */
export interface NoteGroupTreeNode extends NoteGroup {
  children: NoteGroupTreeNode[]
}

/** 筆記（Firestore：notes_entries） */
export interface NoteEntry {
  id: string
  groupId: string
  title: string
  content: string
  format: NoteFormat
  createdAt: Date
  updatedAt: Date
}

export interface CreateNoteGroupPayload {
  name: string
  parentId?: string | null
  sortOrder?: number
}

export interface UpdateNoteGroupPayload {
  name?: string
  parentId?: string | null
  sortOrder?: number
}

export interface CreateNotePayload {
  groupId: string
  title: string
  content?: string
  /** 預設 markdown */
  format?: NoteFormat
}

export interface UpdateNotePayload {
  title?: string
  content?: string
  format?: NoteFormat
  groupId?: string
}
