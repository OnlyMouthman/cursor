<template>
  <div>
    <h1 class="text-2xl font-semibold text-ink-strong">{{ title }}</h1>
    <p class="mt-2 text-sm text-ink-muted">{{ $t('module.stubHint') }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
