<template>
  <div
    v-if="!canEdit"
    class="mb-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
  >
    <template v-if="showGuestViewNotice">
      <p class="font-medium text-slate-800">{{ $t('access.guestViewTitle') }}</p>
      <p class="mt-1 text-slate-600">{{ $t('access.guestViewBody') }}</p>
    </template>
    <template v-else>
      <p class="font-medium text-slate-800">{{ $t('access.viewOnlyTitle') }}</p>
      <p class="mt-1 text-slate-600">{{ $t('access.viewOnlyBody') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { usePageAccess } from '@/composables/usePageAccess'

const { canEdit, showGuestViewNotice } = usePageAccess()
</script>
