<template>
  <section
    class="flex w-60 shrink-0 flex-col border-r border-line bg-surface md:w-72"
    :aria-label="$t('notes.listSection')"
  >
    <header class="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2">
      <h2 class="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {{ $t('notes.noteList') }}
      </h2>
      <button
        type="button"
        class="btn-primary w-full justify-center py-1.5 text-xs disabled:opacity-50"
        :disabled="!canEdit || !groupId || loading"
        :title="!groupId ? $t('notes.pickGroupFirst') : undefined"
        @click="$emit('add-note')"
      >
        {{ $t('notes.addNote') }}
      </button>
      <p
        v-if="!groupId && canEdit"
        class="text-[11px] leading-snug text-ink-muted"
      >
        {{ $t('notes.mustSelectGroupToCreateNote') }}
      </p>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <p v-if="!groupId" class="px-3 py-4 text-sm text-ink-muted">
        {{ $t('notes.noGroupSelected') }}
      </p>
      <p v-else-if="loading" class="px-3 py-4 text-sm text-ink-muted">
        {{ $t('common.loading') }}
      </p>
      <p v-else-if="loadError" class="px-3 py-4 text-sm text-red-600 dark:text-red-400">
        {{ loadError }}
      </p>
      <p v-else-if="!notes.length" class="px-3 py-4 text-sm text-ink-muted">
        {{ $t('notes.emptyNotes') }}
      </p>
      <ul v-else class="m-0 list-none divide-y divide-line p-0">
        <li v-for="n in notes" :key="n.id">
          <div
            class="flex items-stretch gap-0 transition hover:bg-soft"
            :class="
              n.id === selectedNoteId ? 'bg-primary-subtle' : ''
            "
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-2.5 text-left text-sm text-ink-main"
              :class="
                n.id === selectedNoteId ? 'font-medium text-ink-strong' : ''
              "
              @click="$emit('select-note', n.id)"
            >
              <span class="truncate">{{ n.title }}</span>
              <span class="text-xs text-ink-muted">{{ formatUpdated(n.updatedAt) }}</span>
            </button>
            <button
              v-if="canEdit"
              type="button"
              class="shrink-0 border-l border-line px-2 text-[10px] text-ink-muted hover:bg-soft hover:text-red-600"
              :disabled="loading"
              :title="$t('notes.deleteNote')"
              @click.stop="$emit('delete-note', n.id)"
            >
              {{ $t('notes.deleteShort') }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { NoteEntry } from '@/types/notes'

defineProps<{
  groupId: string | null
  notes: NoteEntry[]
  selectedNoteId: string | null
  loading: boolean
  loadError: string | null
  canEdit: boolean
}>()

defineEmits<{
  'select-note': [id: string]
  'add-note': []
  'delete-note': [id: string]
}>()

function formatUpdated(d: Date): string {
  try {
    return d.toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  } catch {
    return ''
  }
}
</script>
