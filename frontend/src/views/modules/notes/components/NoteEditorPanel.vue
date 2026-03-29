<template>
  <section
    class="flex min-w-0 flex-1 flex-col border-l border-card-border bg-white"
    :aria-label="$t('notes.editorSection')"
  >
    <header
      class="flex shrink-0 flex-wrap items-center gap-3 border-b border-line bg-page/40 px-4 py-3"
    >
      <div
        v-if="canEdit"
        class="flex rounded-lg border border-line bg-white p-0.5 shadow-sm"
      >
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-semibold transition"
          :class="
            editMode === 'edit'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-ink-muted hover:bg-page hover:text-ink-strong'
          "
          :disabled="!canUseEditor"
          @click="setMode('edit')"
        >
          {{ $t('notes.modeEdit') }}
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1.5 text-xs font-semibold transition"
          :class="
            editMode === 'preview'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-ink-muted hover:bg-page hover:text-ink-strong'
          "
          :disabled="!canUseEditor"
          @click="setMode('preview')"
        >
          {{ $t('notes.modePreview') }}
        </button>
      </div>
      <span
        v-else
        class="rounded-lg border border-line bg-page/60 px-3 py-1.5 text-xs font-medium text-ink-muted"
      >
        {{ $t('notes.modePreview') }}
      </span>
      <p
        v-if="saveSuccess"
        class="text-xs font-medium text-emerald-600 dark:text-emerald-400"
        role="status"
      >
        {{ $t('notes.saveSuccess') }}
      </p>
      <p v-if="saveError" class="max-w-[200px] truncate text-xs text-red-600 dark:text-red-400">
        {{ saveError }}
      </p>
      <button
        type="button"
        class="btn-primary ml-auto min-w-[5rem] px-4 py-2 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        :disabled="!canEdit || !hasNote || !canSave"
        @click="$emit('save')"
      >
        {{ saving ? $t('notes.saving') : $t('common.save') }}
      </button>
    </header>

    <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4">
      <div v-if="!hasNote" class="text-sm leading-relaxed text-ink-muted">
        <p class="font-medium text-ink-strong">
          {{ canEdit ? $t('notes.selectNotePromptCanEdit') : $t('notes.selectNotePrompt') }}
        </p>
      </div>

      <template v-else-if="detailLoading">
        <p class="text-sm text-ink-muted">{{ $t('notes.editorLoading') }}</p>
      </template>

      <template v-else-if="loadError">
        <p class="text-sm font-medium text-red-600 dark:text-red-400">{{ loadError }}</p>
        <p class="text-xs leading-relaxed text-ink-muted">{{ $t('notes.editorLoadErrorHint') }}</p>
      </template>

      <template v-else>
        <p
          v-if="!canEdit && hasNote && !detailLoading && !loadError"
          class="shrink-0 rounded-lg border border-line bg-page/50 px-3 py-2 text-xs leading-relaxed text-ink-muted"
        >
          {{ $t('notes.readOnlyEditorHint') }}
        </p>

        <div
          v-if="hasNote"
          class="flex shrink-0 flex-wrap items-center gap-2 text-xs"
        >
          <NotesMsIcon
            :name="noteVisibility === 'public' ? 'public' : 'lock'"
            size="sm"
            :tone="noteVisibility === 'public' ? 'success' : 'muted'"
          />
          <span class="font-medium text-ink-muted">{{ $t('notes.visibilityLabel') }}</span>
          <template v-if="canEdit">
            <select
              :value="noteVisibility"
              class="max-w-[10rem] rounded-lg border border-line bg-white px-2 py-1.5 text-ink-strong shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="visibilityUpdating || !canUseEditor"
              @change="onNoteVisibilitySelect($event)"
            >
              <option value="public">{{ $t('notes.visibilityPublic') }}</option>
              <option value="private">{{ $t('notes.visibilityPrivate') }}</option>
            </select>
          </template>
          <span
            v-else
            class="font-medium text-ink-strong"
          >
            {{
              noteVisibility === 'public'
                ? $t('notes.visibilityPublic')
                : $t('notes.visibilityPrivate')
            }}
          </span>
        </div>

        <div
          v-if="canEdit"
          class="block shrink-0"
        >
          <span class="sr-only">{{ $t('notes.noteTitle') }}</span>
          <input
            v-model="titleModel"
            type="text"
            class="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-base font-semibold text-ink-strong shadow-sm outline-none ring-focus focus:border-primary/40 focus:ring-2 disabled:opacity-60"
            :disabled="editMode === 'preview'"
            :placeholder="$t('notes.noteTitle')"
          />
        </div>
        <div
          v-else-if="hasNote && !detailLoading && !loadError"
          class="shrink-0 rounded-lg border border-line bg-page/40 px-3 py-2.5 text-base font-semibold text-ink-strong"
        >
          {{ title || $t('notes.noteTitle') }}
        </div>

        <div class="min-h-0 flex-1 overflow-hidden">
          <textarea
            v-if="canEdit"
            v-show="editMode === 'edit'"
            v-model="contentModel"
            class="h-full min-h-[220px] w-full resize-none rounded-lg border border-line bg-white px-4 py-3 font-mono text-sm leading-relaxed text-ink-main shadow-sm outline-none ring-focus focus:border-primary/35 focus:ring-2"
            :placeholder="$t('notes.contentPlaceholder')"
          />
          <div
            v-show="!canEdit || editMode === 'preview'"
            class="notes-md-preview notes-md-preview-card h-full min-h-[220px] overflow-y-auto rounded-lg border border-line bg-white px-4 py-4 text-[15px] leading-relaxed text-ink-main shadow-sm"
          >
            <p
              v-if="!previewHasContent"
              class="text-sm text-ink-muted"
            >
              {{ canEdit ? $t('notes.previewEmpty') : $t('notes.previewEmptyReadOnly') }}
            </p>
            <div
              v-else
              v-html="previewHtml"
            />
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
/** 右欄展示：表單／預覽；不呼叫 Firebase，資料皆由 NotesPage 以 props 注入。 */
import { computed } from 'vue'
import { markdownToSafeHtml } from '@/utils/markdownPreview'
import type { NoteVisibility } from '@/types/notes'
import NotesMsIcon from './NotesMsIcon.vue'

const props = defineProps<{
  title: string
  content: string
  editMode: 'edit' | 'preview'
  hasNote: boolean
  canEdit: boolean
  saving: boolean
  /** 目前筆記可見性（有選取筆記時由父層同步） */
  noteVisibility: NoteVisibility
  /** 正在寫入可見性 */
  visibilityUpdating: boolean
  /** 正在向 Firestore 載入筆記本文 */
  detailLoading: boolean
  /** 載入失敗（含不存在） */
  loadError: string | null
  /** 儲存失敗；不應清空草稿 */
  saveError: string | null
  /** 剛成功儲存，短暫顯示提示 */
  saveSuccess: boolean
}>()

const emit = defineEmits<{
  'update:title': [v: string]
  'update:content': [v: string]
  'update:editMode': [v: 'edit' | 'preview']
  'change-note-visibility': [v: NoteVisibility]
  save: []
}>()

function onNoteVisibilitySelect(ev: Event) {
  const el = ev.target as HTMLSelectElement
  const v = el.value === 'public' ? 'public' : 'private'
  emit('change-note-visibility', v)
}

const canUseEditor = computed(
  () => props.hasNote && !props.detailLoading && !props.loadError
)

const canSave = computed(
  () => canUseEditor.value && !props.saving && !props.visibilityUpdating
)

const titleModel = computed({
  get: () => props.title,
  set: v => emit('update:title', v)
})

const contentModel = computed({
  get: () => props.content,
  set: v => emit('update:content', v)
})

/** 預覽目前草稿（未儲存亦即時反映） */
const previewHasContent = computed(() => props.content.trim().length > 0)

const previewHtml = computed(() => markdownToSafeHtml(props.content))

function setMode(m: 'edit' | 'preview') {
  emit('update:editMode', m)
}
</script>

<style scoped>
.notes-md-preview-card :deep(pre) {
  background-color: rgba(37, 38, 39, 0.045);
  border-color: var(--color-border);
}
.notes-md-preview-card :deep(p code),
.notes-md-preview-card :deep(li code) {
  background-color: rgba(37, 38, 39, 0.06);
}

.notes-md-preview :deep(h1),
.notes-md-preview :deep(h2),
.notes-md-preview :deep(h3),
.notes-md-preview :deep(h4),
.notes-md-preview :deep(h5),
.notes-md-preview :deep(h6) {
  font-weight: 600;
  color: var(--color-text-strong);
  margin: 0.75rem 0 0.4rem;
  line-height: 1.3;
}
.notes-md-preview :deep(h1) {
  font-size: 1.35rem;
}
.notes-md-preview :deep(h2) {
  font-size: 1.2rem;
}
.notes-md-preview :deep(h3) {
  font-size: 1.05rem;
}
.notes-md-preview :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.55;
}
.notes-md-preview :deep(ul),
.notes-md-preview :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.35rem;
}
.notes-md-preview :deep(li) {
  margin: 0.2rem 0;
}
.notes-md-preview :deep(blockquote) {
  margin: 0.5rem 0;
  padding-left: 0.75rem;
  border-left: 3px solid var(--color-border);
  color: var(--color-text-muted);
}
.notes-md-preview :deep(a) {
  color: var(--color-primary);
  text-decoration: underline;
  word-break: break-word;
}
.notes-md-preview :deep(pre) {
  margin: 0.5rem 0;
  padding: 0.65rem 0.75rem;
  border-radius: 0.375rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  overflow-x: auto;
  font-size: 0.8125rem;
  line-height: 1.45;
}
.notes-md-preview :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.85em;
}
.notes-md-preview :deep(p code),
.notes-md-preview :deep(li code) {
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-divider);
}
.notes-md-preview :deep(pre code) {
  padding: 0;
  border: none;
  background: transparent;
  font-size: inherit;
}
.notes-md-preview :deep(strong) {
  font-weight: 600;
}
.notes-md-preview :deep(em) {
  font-style: italic;
}
.notes-md-preview :deep(hr) {
  margin: 0.75rem 0;
  border: none;
  border-top: 1px solid var(--color-divider);
}
</style>
