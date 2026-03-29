<template>
  <li class="list-none">
    <div
      class="group/row flex items-center gap-0.5 rounded-md py-0.5"
      :style="{ paddingLeft: `${8 + depth * 12}px` }"
    >
      <button
        v-if="node.children.length"
        type="button"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-muted hover:bg-soft"
        :aria-expanded="expanded"
        :aria-label="expanded ? $t('notes.collapseBranch') : $t('notes.expandBranch')"
        @click.stop="$emit('toggle-expand', node.id)"
      >
        <span class="text-xs">{{ expanded ? '▼' : '▶' }}</span>
      </button>
      <span v-else class="inline-block w-7 shrink-0" aria-hidden="true" />

      <button
        type="button"
        class="min-w-0 flex-1 truncate rounded px-2 py-1.5 text-left text-sm text-ink-main transition"
        :class="
          isSelected
            ? 'bg-primary-subtle font-medium text-ink-strong'
            : 'hover:bg-soft'
        "
        @click="$emit('select', node.id)"
      >
        {{ node.name }}
      </button>

      <div
        v-if="canEdit"
        class="flex shrink-0 items-center gap-0.5 pr-1 opacity-70 group-hover/row:opacity-100"
      >
        <button
          type="button"
          class="rounded px-1.5 py-0.5 text-[10px] text-ink-muted hover:bg-soft hover:text-ink-main"
          :title="$t('notes.renameGroup')"
          @click.stop="$emit('rename-group', node.id)"
        >
          {{ $t('notes.renameShort') }}
        </button>
        <button
          type="button"
          class="rounded px-1.5 py-0.5 text-[10px] text-ink-muted hover:bg-soft hover:text-red-600"
          :title="$t('notes.deleteGroup')"
          @click.stop="$emit('delete-group', node.id)"
        >
          {{ $t('notes.deleteShort') }}
        </button>
      </div>
    </div>
    <ul v-show="expanded && node.children.length" class="m-0 p-0">
      <NoteGroupTreeItem
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
        :selected-group-id="selectedGroupId"
        :expanded-ids="expandedIds"
        :can-edit="canEdit"
        @select="$emit('select', $event)"
        @toggle-expand="$emit('toggle-expand', $event)"
        @rename-group="$emit('rename-group', $event)"
        @delete-group="$emit('delete-group', $event)"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NoteGroupTreeNode } from '@/types/notes'
import NoteGroupTreeItem from './NoteGroupTreeItem.vue'

const props = defineProps<{
  node: NoteGroupTreeNode
  depth: number
  selectedGroupId: string | null
  expandedIds: ReadonlySet<string>
  canEdit: boolean
}>()

defineEmits<{
  select: [id: string]
  'toggle-expand': [id: string]
  'rename-group': [id: string]
  'delete-group': [id: string]
}>()

const expanded = computed(() => props.expandedIds.has(props.node.id))

const isSelected = computed(() => props.selectedGroupId === props.node.id)
</script>
