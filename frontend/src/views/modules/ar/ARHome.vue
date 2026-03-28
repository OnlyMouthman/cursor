<template>
  <div>
    <ModuleAccessBanner />

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-ink-strong">AR Module</h1>
        <p class="mt-2 text-sm text-ink-muted">{{ $t('module.stubHint') }}</p>
      </div>
      <button
        type="button"
        class="btn-primary disabled:cursor-not-allowed"
        :disabled="!canEdit"
        :title="!canEdit ? $t('access.signInToEditHint') : undefined"
        @click="onStubAction('manage-scene')"
      >
        {{ $t('module.manageScene') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import ModuleAccessBanner from '@/components/ModuleAccessBanner.vue'
import { usePageAccess } from '@/composables/usePageAccess'

const { canEdit } = usePageAccess()

function onStubAction(action: string) {
  if (!canEdit.value) return
  console.log('[AR stub]', action)
}
</script>
