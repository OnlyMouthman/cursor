/**
 * Notes 模組資料模型（對應 docs/notes_module.md）
 * 欄位命名採 camelCase，與 Firestore 存檔一致，未來對接 REST 時可再建 adapter。
 */

export type NoteFormat = 'text' | 'markdown'

/** 可見性：缺欄位之舊資料於前端／規則皆視為 private */
export type NoteVisibility = 'public' | 'private'

/** 分類（Firestore：notes_groups） */
export interface NoteGroup {
  id: string
  name: string
  /** 根節點為 null */
  parentId: string | null
  sortOrder: number
  visibility: NoteVisibility
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
  visibility: NoteVisibility
  createdAt: Date
  updatedAt: Date
}

export interface CreateNoteGroupPayload {
  name: string
  parentId?: string | null
  sortOrder?: number
  /** 預設 private */
  visibility?: NoteVisibility
}

export interface UpdateNoteGroupPayload {
  name?: string
  parentId?: string | null
  sortOrder?: number
  visibility?: NoteVisibility
}

export interface CreateNotePayload {
  groupId: string
  title: string
  content?: string
  /** 預設 markdown */
  format?: NoteFormat
  /** 預設 private */
  visibility?: NoteVisibility
}

export interface UpdateNotePayload {
  title?: string
  content?: string
  format?: NoteFormat
  groupId?: string
  visibility?: NoteVisibility
}
