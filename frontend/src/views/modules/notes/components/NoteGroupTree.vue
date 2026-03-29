<template>
  <ul class="m-0 list-none p-0">
    <NoteGroupTreeItem
      v-for="node in roots"
      :key="node.id"
      :node="node"
      :depth="0"
      :selected-group-id="selectedGroupId"
      :expanded-ids="expandedIds"
      :can-edit="canEdit"
      @select="$emit('select', $event)"
      @toggle-expand="$emit('toggle-expand', $event)"
      @rename-group="$emit('rename-group', $event)"
      @delete-group="$emit('delete-group', $event)"
    />
  </ul>
</template>

<script setup lang="ts">
import type { NoteGroupTreeNode } from '@/types/notes'
import NoteGroupTreeItem from './NoteGroupTreeItem.vue'

defineProps<{
  roots: NoteGroupTreeNode[]
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
</script>
