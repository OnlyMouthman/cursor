<template>
  <div
    v-if="!canEdit"
    class="mb-6 rounded-lg border border-line bg-soft/20 px-4 py-3 text-sm text-ink-main"
  >
    <template v-if="showGuestViewNotice">
      <p class="font-medium text-ink-strong">{{ $t('access.guestViewTitle') }}</p>
      <p class="mt-1 text-ink-muted">{{ $t('access.guestViewBody') }}</p>
    </template>
    <template v-else>
      <p class="font-medium text-ink-strong">{{ $t('access.viewOnlyTitle') }}</p>
      <p class="mt-1 text-ink-muted">{{ $t('access.viewOnlyBody') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePageAccess } from '@/composables/usePageAccess'

const { canEdit, showGuestViewNotice } = usePageAccess()
</script>
