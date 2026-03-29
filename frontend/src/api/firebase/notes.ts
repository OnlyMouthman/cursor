/**
 * Notes 模組 — Firestore 資料層（Step 1 邊界）
 *
 * - 元件與 composable 請呼叫本檔匯出之函式，勿在 UI 層直接 import firestore 操作 notes 集合。
 * - 集合與欄位見 docs/notes_module.md §十一；檔案對照見 §十二。
 */

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
  type Timestamp,
  serverTimestamp
} from 'firebase/firestore'
import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permissions'
import type { PermissionSlug } from '@/types/rbac'
import { getFirebaseFirestore } from './config'
import type {
  CreateNoteGroupPayload,
  CreateNotePayload,
  NoteEntry,
  NoteFormat,
  NoteGroup,
  NoteGroupTreeNode,
  NoteVisibility,
  UpdateNoteGroupPayload,
  UpdateNotePayload
} from '@/types/notes'

const db = () => getFirebaseFirestore()

/**
 * 是否使用「完整讀取」Firestore 查詢（含 private）。
 * 與 `useNotesDataAccess().canReadAllNotes` 邏輯須一致。
 */
export function notesUseFullReadQueries(): boolean {
  const userStore = useUserStore()
  if (!userStore.isAuthenticated || !userStore.isActive) return false
  const u = userStore.currentUser
  if (!u) return false
  return (
    hasPermission(u, 'notes.view' as PermissionSlug) ||
    hasPermission(u, 'notes.edit' as PermissionSlug)
  )
}

/** 舊資料缺 visibility 時視為 private（與 rules／查詢一致） */
function visibilityFromField(v: unknown): NoteVisibility {
  return v === 'public' ? 'public' : 'private'
}

/** 模組命名空間，避免與既有集合（users、menus…）衝突 */
export const NOTES_COLLECTION_GROUPS = 'notes_groups'
export const NOTES_COLLECTION_ENTRIES = 'notes_entries'

function tsToDate(v: unknown): Date {
  if (v != null && typeof (v as Timestamp).toDate === 'function') {
    return (v as Timestamp).toDate()
  }
  if (v instanceof Date) return v
  return new Date(0)
}

function docToGroup(
  snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): NoteGroup {
  const d = snap.data()!
  return {
    id: snap.id,
    name: String(d.name ?? ''),
    parentId: d.parentId ?? null,
    sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 0,
    visibility: visibilityFromField(d.visibility),
    createdAt: tsToDate(d.createdAt),
    updatedAt: tsToDate(d.updatedAt)
  }
}

function docToNote(
  snap: DocumentSnapshot<DocumentData> | QueryDocumentSnapshot<DocumentData>
): NoteEntry {
  const d = snap.data()!
  const format = d.format === 'text' || d.format === 'markdown' ? d.format : 'markdown'
  return {
    id: snap.id,
    groupId: String(d.groupId ?? ''),
    title: String(d.title ?? ''),
    content: String(d.content ?? ''),
    format,
    visibility: visibilityFromField(d.visibility),
    createdAt: tsToDate(d.createdAt),
    updatedAt: tsToDate(d.updatedAt)
  }
}

function sortGroupSiblings(nodes: NoteGroupTreeNode[]): void {
  nodes.sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id)
  )
  for (const n of nodes) {
    sortGroupSiblings(n.children)
  }
}

/**
 * 將平面 groups 組成樹；parent 不存在之節點視為根，避免孤兒資料無法顯示。
 */
export function buildNoteGroupTree(flat: NoteGroup[]): NoteGroupTreeNode[] {
  const map = new Map<string, NoteGroupTreeNode>()
  for (const g of flat) {
    map.set(g.id, { ...g, children: [] })
  }
  const roots: NoteGroupTreeNode[] = []
  for (const g of flat) {
    const node = map.get(g.id)!
    if (g.parentId == null) {
      roots.push(node)
      continue
    }
    const parent = map.get(g.parentId)
    if (parent) parent.children.push(node)
    else roots.push(node)
  }
  sortGroupSiblings(roots)
  return roots
}

async function listAllGroups(): Promise<NoteGroup[]> {
  const ref = collection(db(), NOTES_COLLECTION_GROUPS)
  const q = notesUseFullReadQueries()
    ? query(ref, orderBy('sortOrder', 'asc'))
    : query(
        ref,
        where('visibility', '==', 'public'),
        orderBy('sortOrder', 'asc')
      )
  const snap = await getDocs(q)
  return snap.docs.map(d => docToGroup(d as QueryDocumentSnapshot<DocumentData>))
}

/** 取得完整分類樹（根節點陣列） */
export async function getGroupTree(): Promise<NoteGroupTreeNode[]> {
  const flat = await listAllGroups()
  return buildNoteGroupTree(flat)
}

/** 建立分類 */
export async function createGroup(
  payload: CreateNoteGroupPayload
): Promise<NoteGroup> {
  const name = payload.name?.trim() ?? ''
  if (!name) {
    throw new Error('分類名稱不可為空')
  }
  const parentId = payload.parentId ?? null
  if (parentId) {
    const p = await getDoc(doc(db(), NOTES_COLLECTION_GROUPS, parentId))
    if (!p.exists()) {
      throw new Error('父分類不存在')
    }
  }
  const visibility: NoteVisibility = payload.visibility ?? 'private'
  const now = serverTimestamp()
  const col = collection(db(), NOTES_COLLECTION_GROUPS)
  const docRef = await addDoc(col, {
    name,
    parentId,
    sortOrder: payload.sortOrder ?? 0,
    visibility,
    createdAt: now,
    updatedAt: now
  })
  const created = await getDoc(docRef)
  if (!created.exists()) {
    throw new Error('建立分類失敗')
  }
  return docToGroup(created)
}

/** 更新分類（部分欄位） */
export async function updateGroup(
  id: string,
  payload: UpdateNoteGroupPayload
): Promise<NoteGroup> {
  const ref = doc(db(), NOTES_COLLECTION_GROUPS, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('分類不存在')
  }

  if (payload.parentId !== undefined && payload.parentId !== null) {
    if (payload.parentId === id) {
      throw new Error('不可將自己設為父分類')
    }
    const p = await getDoc(doc(db(), NOTES_COLLECTION_GROUPS, payload.parentId))
    if (!p.exists()) {
      throw new Error('父分類不存在')
    }
    let cursor: string | null = payload.parentId
    const seen = new Set<string>()
    while (cursor) {
      if (cursor === id) {
        throw new Error('不可將子分類設為父節點（會形成循環）')
      }
      if (seen.has(cursor)) break
      seen.add(cursor)
      const w = await getDoc(doc(db(), NOTES_COLLECTION_GROUPS, cursor))
      if (!w.exists()) break
      const next = w.data()?.parentId as string | null | undefined
      cursor = next ?? null
    }
  }

  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (payload.name !== undefined) {
    const name = payload.name.trim()
    if (!name) throw new Error('分類名稱不可為空')
    updates.name = name
  }
  if (payload.parentId !== undefined) {
    updates.parentId = payload.parentId
  }
  if (payload.sortOrder !== undefined) {
    updates.sortOrder = payload.sortOrder
  }
  if (payload.visibility !== undefined) {
    updates.visibility = payload.visibility
  }

  await updateDoc(ref, updates)
  const after = await getDoc(ref)
  return docToGroup(after)
}

/** 刪除分類（有子分類或有筆記時拒絕） */
export async function deleteGroup(id: string): Promise<void> {
  const ref = doc(db(), NOTES_COLLECTION_GROUPS, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('分類不存在')
  }

  const childQ = query(
    collection(db(), NOTES_COLLECTION_GROUPS),
    where('parentId', '==', id),
    limit(1)
  )
  if (!(await getDocs(childQ)).empty) {
    throw new Error('無法刪除：仍含有子分類')
  }

  const noteQ = query(
    collection(db(), NOTES_COLLECTION_ENTRIES),
    where('groupId', '==', id),
    limit(1)
  )
  if (!(await getDocs(noteQ)).empty) {
    throw new Error('無法刪除：仍含有筆記')
  }

  await deleteDoc(ref)
}

/** 某分類底下筆記列表（依 updatedAt 新到舊；純前端排序，免複合索引） */
export async function getNotesByGroup(groupId: string): Promise<NoteEntry[]> {
  const ref = collection(db(), NOTES_COLLECTION_ENTRIES)
  const q = notesUseFullReadQueries()
    ? query(ref, where('groupId', '==', groupId))
    : query(
        ref,
        where('groupId', '==', groupId),
        where('visibility', '==', 'public')
      )
  const snap = await getDocs(q)
  const list = snap.docs.map(d =>
    docToNote(d as QueryDocumentSnapshot<DocumentData>)
  )
  list.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  return list
}

/** 建立筆記 */
export async function createNote(payload: CreateNotePayload): Promise<NoteEntry> {
  const groupId = payload.groupId
  const g = await getDoc(doc(db(), NOTES_COLLECTION_GROUPS, groupId))
  if (!g.exists()) {
    throw new Error('分類不存在')
  }
  const title = payload.title?.trim() ?? ''
  if (!title) {
    throw new Error('筆記標題不可為空')
  }
  const format: NoteFormat = payload.format ?? 'markdown'
  const visibility: NoteVisibility = payload.visibility ?? 'private'
  const now = serverTimestamp()
  const col = collection(db(), NOTES_COLLECTION_ENTRIES)
  const docRef = await addDoc(col, {
    groupId,
    title,
    content: payload.content ?? '',
    format,
    visibility,
    createdAt: now,
    updatedAt: now
  })
  const created = await getDoc(docRef)
  if (!created.exists()) {
    throw new Error('建立筆記失敗')
  }
  return docToNote(created)
}

/** 取得單一筆記 */
export async function getNoteDetail(id: string): Promise<NoteEntry | null> {
  const snap = await getDoc(doc(db(), NOTES_COLLECTION_ENTRIES, id))
  if (!snap.exists()) return null
  return docToNote(snap)
}

/** 更新筆記 */
export async function updateNote(
  id: string,
  payload: UpdateNotePayload
): Promise<NoteEntry> {
  const ref = doc(db(), NOTES_COLLECTION_ENTRIES, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('筆記不存在')
  }

  if (payload.groupId !== undefined) {
    const g = await getDoc(doc(db(), NOTES_COLLECTION_GROUPS, payload.groupId))
    if (!g.exists()) {
      throw new Error('分類不存在')
    }
  }

  const updates: Record<string, unknown> = { updatedAt: serverTimestamp() }
  if (payload.title !== undefined) {
    const title = payload.title.trim()
    if (!title) throw new Error('筆記標題不可為空')
    updates.title = title
  }
  if (payload.content !== undefined) {
    updates.content = payload.content
  }
  if (payload.format !== undefined) {
    updates.format = payload.format
  }
  if (payload.groupId !== undefined) {
    updates.groupId = payload.groupId
  }
  if (payload.visibility !== undefined) {
    updates.visibility = payload.visibility
  }

  if (Object.keys(updates).length <= 1) {
    return docToNote(snap)
  }

  await updateDoc(ref, updates)
  const after = await getDoc(ref)
  return docToNote(after)
}

/** 刪除筆記 */
export async function deleteNote(id: string): Promise<void> {
  const ref = doc(db(), NOTES_COLLECTION_ENTRIES, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    throw new Error('筆記不存在')
  }
  await deleteDoc(ref)
}
