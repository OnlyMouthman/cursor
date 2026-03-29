<template>
  <span
    class="notes-ms-icon inline-flex select-none items-center justify-center font-normal leading-none antialiased"
    :class="[sizeClass, colorClass]"
    aria-hidden="true"
  >{{ name }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Material Symbols Outlined ligature name */
    name: string
    size?: 'sm' | 'md' | 'lg'
    /** 'muted' | 'primary' | 'danger' | 'success' */
    tone?: 'muted' | 'primary' | 'danger' | 'success'
  }>(),
  { size: 'md', tone: 'muted' }
)

const sizeClass = computed(() => {
  if (props.size === 'lg') return 'text-[20px]'
  if (props.size === 'sm') return 'text-[15px]'
  return 'text-[18px]'
})

const colorClass = computed(() => {
  switch (props.tone) {
    case 'primary':
      return 'text-primary'
    case 'danger':
      return 'text-red-600 dark:text-red-400'
    case 'success':
      return 'text-emerald-700 dark:text-emerald-400'
    default:
      return 'text-ink-muted'
  }
})
</script>

<style scoped>
.notes-ms-icon {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
