<template>
  <div
    class="notes-page -m-6 flex h-[calc(100vh-56px-3rem)] min-h-[320px] flex-col overflow-hidden rounded-xl border border-card-border bg-page shadow-sm ring-1 ring-black/[0.04]"
  >
    <NotesTextModal
      v-if="textModalOpen"
      :heading="textModalHeading"
      :model-value="textModalValue"
      :placeholder="textModalPlaceholder"
      @confirm="onTextModalConfirm"
      @cancel="closeTextModal"
    />

    <div class="flex min-h-0 min-w-0 flex-1">
      <NoteGroupTreePanel
        :roots="groupTree"
        :selected-group-id="selectedGroupId"
        :selected-group-visibility="selectedGroupVisibility"
        :group-visibility-saving="groupVisibilitySaving"
        :group-visibility-error="groupVisibilityError"
        :expanded-ids="expandedIds"
        :loading="treeLoading"
        :load-error="treeError"
        :can-edit="canEdit"
        @select-group="onSelectGroup"
        @toggle-expand="onToggleExpand"
        @add-root-group="openCreateRootModal"
        @add-child-group="openCreateChildModal"
        @rename-group="openRenameModal"
        @delete-group="onDeleteGroup"
        @update-group-visibility="onGroupVisibilityChange"
      />
      <NoteListPanel
        :group-id="selectedGroupId"
        :notes="notes"
        :selected-note-id="selectedNoteId"
        :loading="notesLoading"
        :load-error="notesError"
        :can-edit="canEdit"
        @select-note="onSelectNote"
        @add-note="onAddNote"
        @delete-note="onDeleteNote"
      />
      <NoteEditorPanel
        :title="draftTitle"
        :content="draftContent"
        :edit-mode="editMode"
        :has-note="!!selectedNoteId"
        :can-edit="canEdit"
        :note-visibility="draftNoteVisibility"
        :visibility-updating="noteVisibilitySaving"
        :saving="saving"
        :detail-loading="editorDetailLoading"
        :load-error="editorLoadError"
        :save-error="editorSaveError"
        :save-success="saveSuccessVisible"
        @update:title="draftTitle = $event"
        @update:content="draftContent = $event"
        @update:edit-mode="editMode = $event"
        @change-note-visibility="onNoteVisibilityChange"
        @save="onSaveNote"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { FirebaseError } from 'firebase/app'
import { storeToRefs } from 'pinia'
import { computed, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createGroup,
  createNote,
  deleteGroup,
  deleteNote,
  getGroupTree,
  getNoteDetail,
  getNotesByGroup,
  updateGroup,
  updateNote
} from '@/api/firebase/notes'
import { usePageAccess } from '@/composables/usePageAccess'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import type {
  NoteEntry,
  NoteGroupTreeNode,
  NoteVisibility
} from '@/types/notes'
import NoteEditorPanel from './components/NoteEditorPanel.vue'
import NoteGroupTreePanel from './components/NoteGroupTreePanel.vue'
import NoteListPanel from './components/NoteListPanel.vue'
import NotesTextModal from './components/NotesTextModal.vue'

const { t } = useI18n()
const { canEdit } = usePageAccess()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const { isAuthenticated } = storeToRefs(userStore)

const groupTree = ref<NoteGroupTreeNode[]>([])
const treeLoading = ref(false)
const treeError = ref<string | null>(null)
const expandedIds = ref<Set<string>>(new Set())

const selectedGroupId = ref<string | null>(null)
const notes = ref<NoteEntry[]>([])
const notesLoading = ref(false)
const notesError = ref<string | null>(null)

const selectedNoteId = ref<string | null>(null)
/** 右欄編輯草稿（與伺服器同步於載入成功或儲存成功後） */
const draftTitle = ref('')
const draftContent = ref('')
const draftNoteVisibility = ref<NoteVisibility>('private')
const noteVisibilitySaving = ref(false)
const groupVisibilitySaving = ref(false)
const groupVisibilityError = ref<string | null>(null)
const editMode = ref<'edit' | 'preview'>('edit')
watch(
  () => canEdit.value,
  editOk => {
    if (!editOk) editMode.value = 'preview'
  },
  { immediate: true }
)
const saving = ref(false)
const editorDetailLoading = ref(false)
const editorLoadError = ref<string | null>(null)
const editorSaveError = ref<string | null>(null)
const saveSuccessVisible = ref(false)
let saveSuccessTimer: ReturnType<typeof setTimeout> | null = null
let noteDetailLoadSeq = 0

function clearSaveSuccessTimer() {
  if (saveSuccessTimer != null) {
    clearTimeout(saveSuccessTimer)
    saveSuccessTimer = null
  }
}

function flashSaveSuccess() {
  clearSaveSuccessTimer()
  saveSuccessVisible.value = true
  saveSuccessTimer = setTimeout(() => {
    saveSuccessVisible.value = false
    saveSuccessTimer = null
  }, 2200)
}

type TextModalMode = 'idle' | 'create-root' | 'create-child' | 'rename'
const textModalOpen = ref(false)
const textModalMode = ref<TextModalMode>('idle')
const textModalHeading = ref('')
const textModalValue = ref('')
const textModalPlaceholder = ref('')
const renameTargetId = ref<string | null>(null)

function flattenGroupTree(
  nodes: NoteGroupTreeNode[],
  out: NoteGroupTreeNode[] = []
): NoteGroupTreeNode[] {
  for (const n of nodes) {
    out.push(n)
    flattenGroupTree(n.children, out)
  }
  return out
}

function findGroupName(
  nodes: NoteGroupTreeNode[],
  id: string
): string | undefined {
  for (const n of nodes) {
    if (n.id === id) return n.name
    const inner = findGroupName(n.children, id)
    if (inner !== undefined) return inner
  }
  return undefined
}

function findGroupVisibility(
  nodes: NoteGroupTreeNode[],
  id: string
): NoteVisibility | null {
  for (const n of nodes) {
    if (n.id === id) return n.visibility
    const inner = findGroupVisibility(n.children, id)
    if (inner !== null) return inner
  }
  return null
}

const selectedGroupVisibility = computed((): NoteVisibility | null => {
  const id = selectedGroupId.value
  if (!id) return null
  return findGroupVisibility(groupTree.value, id)
})

function collectExpandableIds(nodes: NoteGroupTreeNode[]): Set<string> {
  const s = new Set<string>()
  function walk(n: NoteGroupTreeNode) {
    if (n.children.length) {
      s.add(n.id)
      n.children.forEach(walk)
    }
  }
  nodes.forEach(walk)
  return s
}

/**
 * 載入分類樹。
 * - 初次：展開所有有子節點的分支。
 * - 變更後：盡量保留仍存在的展開狀態，並強制展開 ensureExpandedIds（例如新建子分類的父節點）。
 */
async function loadGroupTree(options?: {
  preserveExpansion?: boolean
  ensureExpandedIds?: string[]
}) {
  const prevExpanded = expandedIds.value
  treeLoading.value = true
  treeError.value = null
  try {
    const roots = await getGroupTree()
    groupTree.value = roots
    const allIds = new Set(flattenGroupTree(roots).map(g => g.id))

    const nextExpanded = new Set<string>()
    if (options?.preserveExpansion) {
      for (const id of prevExpanded) {
        if (allIds.has(id)) nextExpanded.add(id)
      }
    } else {
      collectExpandableIds(roots).forEach(id => nextExpanded.add(id))
    }
    for (const id of options?.ensureExpandedIds ?? []) {
      if (allIds.has(id)) nextExpanded.add(id)
    }
    expandedIds.value = nextExpanded

    const sel = selectedGroupId.value
    if (sel && allIds.has(sel)) {
      /* 維持選取 */
    } else {
      selectedGroupId.value = roots[0]?.id ?? null
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    treeError.value = msg
  } finally {
    treeLoading.value = false
  }
}

async function loadNotesForGroup() {
  const gid = selectedGroupId.value
  if (!gid) {
    notes.value = []
    return
  }
  notesLoading.value = true
  notesError.value = null
  try {
    notes.value = await getNotesByGroup(gid)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    notesError.value = msg
  } finally {
    notesLoading.value = false
  }
}

function onSelectGroup(id: string) {
  selectedGroupId.value = id
}

function onToggleExpand(id: string) {
  const next = new Set(expandedIds.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expandedIds.value = next
}

function closeTextModal() {
  textModalOpen.value = false
  textModalMode.value = 'idle'
  renameTargetId.value = null
}

function openCreateRootModal() {
  if (!canEdit.value) return
  textModalMode.value = 'create-root'
  textModalHeading.value = t('notes.modalCreateRoot')
  textModalValue.value = ''
  textModalPlaceholder.value = t('notes.groupNamePlaceholder')
  textModalOpen.value = true
}

function openCreateChildModal() {
  if (!canEdit.value || !selectedGroupId.value) return
  textModalMode.value = 'create-child'
  textModalHeading.value = t('notes.modalCreateChild')
  textModalValue.value = ''
  textModalPlaceholder.value = t('notes.groupNamePlaceholder')
  textModalOpen.value = true
}
import { seedRbac } from '@/api/firebase/rbacSeed'

if (import.meta.env.DEV) {
  // @ts-ignore
  window.seedRbac = seedRbac
  console.log("~~~~~~~~")
}
function openRenameModal(id: string) {
  if (!canEdit.value) return
  const name = findGroupName(groupTree.value, id) ?? ''
  textModalMode.value = 'rename'
  renameTargetId.value = id
  textModalHeading.value = t('notes.modalRenameGroup')
  textModalValue.value = name
  textModalPlaceholder.value = t('notes.groupNamePlaceholder')
  textModalOpen.value = true
}

async function onTextModalConfirm(value: string) {
  if (!canEdit.value) {
    closeTextModal()
    return
  }
  const mode = textModalMode.value
  treeError.value = null
  try {
    if (mode === 'create-root') {
      const g = await createGroup({ name: value })
      await loadGroupTree({
        preserveExpansion: groupTree.value.length > 0,
        ensureExpandedIds: []
      })
      selectedGroupId.value = g.id
    } else if (mode === 'create-child') {
      const parentId = selectedGroupId.value
      if (!parentId) {
        closeTextModal()
        return
      }
      const g = await createGroup({ name: value, parentId })
      await loadGroupTree({
        preserveExpansion: true,
        ensureExpandedIds: [parentId]
      })
      selectedGroupId.value = g.id
    } else if (mode === 'rename' && renameTargetId.value) {
      const rid = renameTargetId.value
      await updateGroup(rid, { name: value })
      await loadGroupTree({ preserveExpansion: true })
    }
    closeTextModal()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    treeError.value = msg
    closeTextModal()
  }
}

async function onDeleteGroup(id: string) {
  if (!canEdit.value) return
  if (!window.confirm(t('notes.confirmDeleteGroup'))) return
  treeError.value = null
  try {
    await deleteGroup(id)
    const wasSelected = selectedGroupId.value === id
    await loadGroupTree({ preserveExpansion: true })
    if (wasSelected && !selectedGroupId.value) {
      notes.value = []
      selectedNoteId.value = null
      draftTitle.value = ''
      draftContent.value = ''
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    treeError.value = msg
  }
}

function onSelectNote(id: string) {
  selectedNoteId.value = id
}

async function onAddNote() {
  const gid = selectedGroupId.value
  if (!gid) {
    notesError.value = t('notes.mustSelectGroupToCreateNote')
    return
  }
  if (!canEdit.value) return
  notesError.value = null
  try {
    const created = await createNote({
      groupId: gid,
      title: t('notes.untitledNote'),
      content: '',
      format: 'markdown'
    })
    await loadNotesForGroup()
    selectedNoteId.value = created.id
    editMode.value = 'edit'
    /* 草稿由 watch(selectedNoteId) 載入 getNoteDetail，避免與伺服器狀態脫節 */
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    notesError.value = msg
  }
}

async function onDeleteNote(id: string) {
  if (!canEdit.value) return
  if (!window.confirm(t('notes.confirmDeleteNote'))) return
  notesError.value = null
  try {
    await deleteNote(id)
    if (selectedNoteId.value === id) {
      selectedNoteId.value = null
      draftTitle.value = ''
      draftContent.value = ''
    }
    await loadNotesForGroup()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    notesError.value = msg
  }
}

async function onNoteVisibilityChange(v: NoteVisibility) {
  const nid = selectedNoteId.value
  if (!nid || !canEdit.value) return
  const prev = draftNoteVisibility.value
  editorSaveError.value = null
  draftNoteVisibility.value = v
  noteVisibilitySaving.value = true
  try {
    await updateNote(nid, { visibility: v })
    await loadNotesForGroup()
    const refreshed = await getNoteDetail(nid)
    if (refreshed && selectedNoteId.value === nid) {
      draftNoteVisibility.value = refreshed.visibility
    }
  } catch (e: unknown) {
    draftNoteVisibility.value = prev
    const msg = e instanceof Error ? e.message : String(e)
    editorSaveError.value = `${t('notes.visibilityUpdateFailed')} ${msg}`
  } finally {
    noteVisibilitySaving.value = false
  }
}

async function onGroupVisibilityChange(v: NoteVisibility) {
  const gid = selectedGroupId.value
  if (!gid || !canEdit.value) return
  groupVisibilityError.value = null
  groupVisibilitySaving.value = true
  try {
    await updateGroup(gid, { visibility: v })
    await loadGroupTree({ preserveExpansion: true })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    groupVisibilityError.value = `${t('notes.visibilityUpdateFailed')} ${msg}`
  } finally {
    groupVisibilitySaving.value = false
  }
}

async function onSaveNote() {
  const nid = selectedNoteId.value
  if (!nid || !canEdit.value) return
  editorSaveError.value = null
  saving.value = true
  try {
    await updateNote(nid, {
      title: draftTitle.value,
      content: draftContent.value
    })
    await loadNotesForGroup()
    try {
      const refreshed = await getNoteDetail(nid)
      if (refreshed && selectedNoteId.value === nid) {
        draftTitle.value = refreshed.title
        draftContent.value = refreshed.content
        draftNoteVisibility.value = refreshed.visibility
      }
    } catch {
      /* 列表已更新；草稿維持使用者剛儲存的內容 */
    }
    flashSaveSuccess()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    editorSaveError.value = msg
  } finally {
    saving.value = false
  }
}

watch(selectedGroupId, () => {
  selectedNoteId.value = null
  draftTitle.value = ''
  draftContent.value = ''
  draftNoteVisibility.value = 'private'
  editMode.value = canEdit.value ? 'edit' : 'preview'
  editorLoadError.value = null
  editorSaveError.value = null
  groupVisibilityError.value = null
  saveSuccessVisible.value = false
  clearSaveSuccessTimer()
  loadNotesForGroup()
})

watch(selectedNoteId, async id => {
  noteDetailLoadSeq += 1
  const seq = noteDetailLoadSeq
  editorLoadError.value = null
  editorSaveError.value = null
  saveSuccessVisible.value = false
  clearSaveSuccessTimer()

  if (!id) {
    editorDetailLoading.value = false
    draftTitle.value = ''
    draftContent.value = ''
    draftNoteVisibility.value = 'private'
    return
  }

  editorDetailLoading.value = true
  draftTitle.value = ''
  draftContent.value = ''
  draftNoteVisibility.value = 'private'

  try {
    const n = await getNoteDetail(id)
    if (seq !== noteDetailLoadSeq) return
    if (!n) {
      editorLoadError.value = t('notes.noteLoadNotFound')
      return
    }
    draftTitle.value = n.title
    draftContent.value = n.content
    draftNoteVisibility.value = n.visibility
  } catch (e: unknown) {
    if (seq !== noteDetailLoadSeq) return
    if (e instanceof FirebaseError && e.code === 'permission-denied') {
      notesError.value = t('notes.noteAccessDenied')
      selectedNoteId.value = null
      return
    }
    editorLoadError.value =
      e instanceof Error ? e.message : String(e)
  } finally {
    if (seq === noteDetailLoadSeq) {
      editorDetailLoading.value = false
    }
  }
})

watch(
  () => ({
    auth: isAuthenticated.value,
    uid: userStore.currentUser?.uid ?? null,
    permLoadedFor: permissionStore.loadedForUid
  }),
  () => {
    loadGroupTree({ preserveExpansion: true })
    loadNotesForGroup()
  },
  { immediate: true }
)

onUnmounted(() => {
  clearSaveSuccessTimer()
})
</script>
