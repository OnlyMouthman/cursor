<template>
  <section
    class="flex w-60 shrink-0 flex-col border-r border-card-border bg-white md:w-72"
    :aria-label="$t('notes.listSection')"
  >
    <header class="flex shrink-0 flex-col gap-2.5 border-b border-line bg-page/40 px-4 py-3">
      <h2 class="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
        {{ $t('notes.noteList') }}
      </h2>
      <button
        type="button"
        class="btn-primary w-full justify-center py-2 text-xs font-semibold shadow-md disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        :disabled="!canEdit || !groupId || loading"
        :title="!groupId ? $t('notes.pickGroupFirst') : undefined"
        @click="$emit('add-note')"
      >
        {{ $t('notes.addNote') }}
      </button>
      <p
        v-if="!groupId && canEdit"
        class="text-[11px] leading-snug text-ink-muted/90"
      >
        {{ $t('notes.mustSelectGroupToCreateNote') }}
      </p>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div v-if="!groupId" class="px-4 py-5">
        <p class="text-sm font-medium text-ink-strong">
          {{ $t('notes.noGroupSelected') }}
        </p>
        <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">
          {{ $t('notes.noGroupSelectedHint') }}
        </p>
      </div>
      <p v-else-if="loading" class="px-4 py-5 text-sm text-ink-muted">
        {{ $t('common.loading') }}
      </p>
      <p v-else-if="loadError" class="px-4 py-5 text-sm text-red-600 dark:text-red-400">
        {{ loadError }}
      </p>
      <p v-else-if="!notes.length" class="px-4 py-5 text-sm leading-relaxed text-ink-muted">
        {{ emptyNotesMessage }}
      </p>
      <ul v-else class="m-0 list-none divide-y divide-line p-0">
        <li v-for="n in notes" :key="n.id">
          <div
            class="flex items-stretch gap-0 transition"
            :class="
              n.id === selectedNoteId
                ? 'border-l-[3px] border-l-primary bg-primary-subtle shadow-[inset_0_0_0_1px_rgba(144,78,85,0.08)]'
                : 'border-l-[3px] border-l-transparent hover:bg-sidebar-row-hover'
            "
          >
            <button
              type="button"
              class="grid min-w-0 flex-1 grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 px-4 py-3 text-left text-sm transition"
              :class="
                n.id === selectedNoteId
                  ? 'font-semibold text-ink-strong'
                  : 'font-normal text-ink-main'
              "
              @click="$emit('select-note', n.id)"
            >
              <span
                class="row-span-2 mt-0.5 inline-flex shrink-0 self-start"
                :title="
                  n.visibility === 'public'
                    ? $t('notes.visIconPublicTitle')
                    : $t('notes.visIconPrivateTitle')
                "
              >
                <NotesMsIcon
                  :name="n.visibility === 'public' ? 'public' : 'lock'"
                  size="sm"
                  :tone="n.visibility === 'public' ? 'success' : 'muted'"
                />
              </span>
              <span class="min-w-0 truncate leading-snug">{{ n.title }}</span>
              <span class="col-start-2 text-[11px] font-normal text-ink-muted">{{
                formatUpdated(n.updatedAt)
              }}</span>
            </button>
            <button
              v-if="canEdit"
              type="button"
              class="flex w-10 shrink-0 items-center justify-center border-l border-line text-ink-muted transition hover:bg-red-500/10 hover:text-red-600 active:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-muted"
              :disabled="loading"
              :aria-label="$t('notes.deleteNote')"
              :title="$t('notes.deleteNote')"
              @click.stop="$emit('delete-note', n.id)"
            >
              <NotesMsIcon name="delete_outline" size="md" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotesDataAccess } from '@/composables/useNotesDataAccess'
import { useUserStore } from '@/stores/user'
import type { NoteEntry } from '@/types/notes'
import NotesMsIcon from './NotesMsIcon.vue'

const props = defineProps<{
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

const { t } = useI18n()
const userStore = useUserStore()
const { canReadAllNotes } = useNotesDataAccess()

const emptyNotesMessage = computed(() => {
  if (!props.groupId) return ''
  if (props.canEdit) return t('notes.emptyNotesWithEdit')
  if (!userStore.isAuthenticated || !canReadAllNotes.value) {
    return t('notes.emptyNotesBrowseOnly')
  }
  return t('notes.emptyNotesInGroup')
})

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
