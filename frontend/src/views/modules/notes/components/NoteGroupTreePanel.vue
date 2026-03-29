<template>
  <aside
    class="flex w-56 shrink-0 flex-col border-r border-line bg-surface md:w-64"
    :aria-label="$t('notes.treeSection')"
  >
    <header
      class="flex shrink-0 flex-col gap-2 border-b border-line px-3 py-2"
    >
      <h2 class="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {{ $t('notes.groupTree') }}
      </h2>
      <div class="flex flex-wrap gap-1">
        <button
          type="button"
          class="rounded border border-line bg-card px-2 py-1 text-xs text-ink-main hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
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
          class="rounded border border-line bg-card px-2 py-1 text-xs text-ink-main hover:bg-soft disabled:cursor-not-allowed disabled:opacity-50"
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
    </header>

    <div class="min-h-0 flex-1 overflow-y-auto px-2 py-2">
      <p v-if="loading" class="px-2 text-sm text-ink-muted">{{ $t('common.loading') }}</p>
      <p v-else-if="loadError" class="px-2 text-sm text-red-600 dark:text-red-400">
        {{ loadError }}
      </p>
      <p v-else-if="!roots.length" class="px-2 text-sm text-ink-muted">
        {{ $t('notes.emptyTree') }}
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
import type { NoteGroupTreeNode } from '@/types/notes'
import NoteGroupTree from './NoteGroupTree.vue'

defineProps<{
  roots: NoteGroupTreeNode[]
  selectedGroupId: string | null
  expandedIds: ReadonlySet<string>
  loading: boolean
  loadError: string | null
  canEdit: boolean
}>()

defineEmits<{
  'select-group': [id: string]
  'toggle-expand': [id: string]
  'add-root-group': []
  'add-child-group': []
  'rename-group': [id: string]
  'delete-group': [id: string]
}>()
</script>
