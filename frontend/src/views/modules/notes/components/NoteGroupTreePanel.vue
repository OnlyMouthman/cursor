<template>
  <aside
    class="flex w-56 shrink-0 flex-col border-r border-card-border bg-white md:w-64"
    :aria-label="$t('notes.treeSection')"
  >
    <header
      class="flex shrink-0 flex-col gap-2.5 border-b border-line bg-page/40 px-4 py-3"
    >
      <h2 class="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
        {{ $t('notes.groupTree') }}
      </h2>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          class="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-strong shadow-sm transition hover:border-primary/35 hover:bg-primary-subtle hover:text-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:border-line disabled:bg-page/50 disabled:text-ink-muted disabled:opacity-60 disabled:shadow-none disabled:hover:border-line disabled:hover:bg-page/50"
          :disabled="!canEdit || loading"
          :title="
            !canEdit
              ? $t('access.signInToEditHint')
              : loading
                ? $t('common.loading')
                : $t('notes.hintAddRootGroup')
          "
          @click="$emit('add-root-group')"
        >
          {{ $t('notes.addGroup') }}
        </button>
        <button
          type="button"
          class="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink-strong shadow-sm transition hover:border-primary/35 hover:bg-primary-subtle hover:text-primary active:scale-[0.98] disabled:cursor-not-allowed disabled:border-line disabled:bg-page/50 disabled:text-ink-muted disabled:opacity-60 disabled:shadow-none disabled:hover:border-line disabled:hover:bg-page/50"
          :disabled="!canEdit || !selectedGroupId || loading"
          :title="
            !canEdit
              ? $t('access.signInToEditHint')
              : !selectedGroupId
                ? $t('notes.pickGroupFirst')
                : loading
                  ? $t('common.loading')
                  : $t('notes.hintAddChildGroup')
          "
          @click="$emit('add-child-group')"
        >
          {{ $t('notes.addChildGroup') }}
        </button>
      </div>
      <div
        v-if="selectedGroupId"
        class="flex flex-col gap-1.5 border-t border-line pt-3"
      >
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <NotesMsIcon
            :name="(selectedGroupVisibility ?? 'private') === 'public' ? 'public' : 'lock'"
            size="sm"
            :tone="(selectedGroupVisibility ?? 'private') === 'public' ? 'success' : 'muted'"
          />
          <span class="font-medium text-ink-muted">{{ $t('notes.visibilityLabel') }}</span>
          <template v-if="canEdit">
            <select
              :value="selectedGroupVisibility ?? 'private'"
              class="max-w-[10rem] flex-1 rounded-lg border border-line bg-white px-2 py-1.5 text-ink-strong shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="groupVisibilitySaving || loading"
              @change="onGroupVisibilitySelect($event)"
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
              (selectedGroupVisibility ?? 'private') === 'public'
                ? $t('notes.visibilityPublic')
                : $t('notes.visibilityPrivate')
            }}
          </span>
        </div>
        <p
          v-if="groupVisibilityError"
          class="text-[11px] leading-snug text-red-600 dark:text-red-400"
        >
          {{ groupVisibilityError }}
        </p>
      </div>
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-2 py-3">
      <p v-if="loading" class="px-2 text-sm text-ink-muted">{{ $t('common.loading') }}</p>
      <p v-else-if="loadError" class="px-2 text-sm text-red-600 dark:text-red-400">
        {{ loadError }}
      </p>
      <p v-else-if="!roots.length" class="px-2 text-sm leading-relaxed text-ink-muted">
        {{ emptyTreeMessage }}
      </p>
      <NoteGroupTree
        v-else
        :roots="roots"
        :selected-group-id="selectedGroupId"
        :expanded-ids="expandedIds"
        :can-edit="canEdit && !loading"
        @select="$emit('select-group', $event)"
        @toggle-expand="$emit('toggle-expand', $event)"
        @rename-group="$emit('rename-group', $event)"
        @delete-group="$emit('delete-group', $event)"
      />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useNotesDataAccess } from '@/composables/useNotesDataAccess'
import { useUserStore } from '@/stores/user'
import type { NoteGroupTreeNode, NoteVisibility } from '@/types/notes'
import NoteGroupTree from './NoteGroupTree.vue'
import NotesMsIcon from './NotesMsIcon.vue'

const props = defineProps<{
  roots: NoteGroupTreeNode[]
  selectedGroupId: string | null
  /** 目前選取之分類可見性；樹載入中可能短暫為 null */
  selectedGroupVisibility: NoteVisibility | null
  groupVisibilitySaving: boolean
  groupVisibilityError: string | null
  expandedIds: ReadonlySet<string>
  loading: boolean
  loadError: string | null
  canEdit: boolean
}>()

const { t } = useI18n()
const userStore = useUserStore()
const { canReadAllNotes } = useNotesDataAccess()

const emptyTreeMessage = computed(() => {
  if (!userStore.isAuthenticated) return t('notes.emptyTreeGuest')
  if (!canReadAllNotes.value) return t('notes.emptyTreePublicOnly')
  if (props.canEdit) return t('notes.emptyTreeWithEdit')
  return t('notes.emptyTreeViewEmpty')
})

const emit = defineEmits<{
  'select-group': [id: string]
  'toggle-expand': [id: string]
  'add-root-group': []
  'add-child-group': []
  'rename-group': [id: string]
  'delete-group': [id: string]
  'update-group-visibility': [v: NoteVisibility]
}>()

function onGroupVisibilitySelect(ev: Event) {
  const el = ev.target as HTMLSelectElement
  const v = el.value === 'public' ? 'public' : 'private'
  emit('update-group-visibility', v)
}
</script>
