<template>
  <li class="list-none">
    <div
      class="group/row flex items-center gap-0.5 rounded-lg py-0.5"
      :style="{ paddingLeft: `${8 + depth * 12}px` }"
    >
      <button
        v-if="node.children.length"
        type="button"
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition hover:bg-sidebar-row-hover hover:text-ink-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
        :aria-expanded="expanded"
        :aria-label="expanded ? $t('notes.collapseBranch') : $t('notes.expandBranch')"
        @click.stop="$emit('toggle-expand', node.id)"
      >
        <NotesMsIcon
          :name="expanded ? 'expand_more' : 'chevron_right'"
          size="md"
        />
      </button>
      <span v-else class="inline-block w-8 shrink-0" aria-hidden="true" />

      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-1.5 rounded-md py-2 pl-1 pr-2 text-left text-sm transition"
        :class="
          isSelected
            ? 'border-l-[3px] border-l-primary bg-primary-subtle font-semibold text-ink-strong shadow-sm'
            : 'border-l-[3px] border-l-transparent text-ink-main hover:bg-sidebar-row-hover'
        "
        @click="$emit('select', node.id)"
      >
        <span class="min-w-0 flex-1 truncate">{{ node.name }}</span>
        <span
          class="inline-flex shrink-0"
          :title="
            node.visibility === 'public'
              ? $t('notes.visIconPublicTitle')
              : $t('notes.visIconPrivateTitle')
          "
        >
          <NotesMsIcon
            :name="node.visibility === 'public' ? 'public' : 'lock'"
            size="sm"
            :tone="node.visibility === 'public' ? 'success' : 'muted'"
          />
        </span>
      </button>

      <div
        v-if="canEdit"
        class="flex shrink-0 items-center gap-0.5 pr-1 opacity-70 group-hover/row:opacity-100"
      >
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition hover:bg-page hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
          :aria-label="$t('notes.renameGroup')"
          :title="$t('notes.renameGroup')"
          @click.stop="$emit('rename-group', node.id)"
        >
          <NotesMsIcon name="edit" size="sm" />
        </button>
        <button
          type="button"
          class="flex h-8 w-8 items-center justify-center rounded-md text-ink-muted transition hover:bg-red-500/10 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-40"
          :aria-label="$t('notes.deleteGroup')"
          :title="$t('notes.deleteGroup')"
          @click.stop="$emit('delete-group', node.id)"
        >
          <NotesMsIcon name="delete_outline" size="sm" />
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
import NotesMsIcon from './NotesMsIcon.vue'

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
