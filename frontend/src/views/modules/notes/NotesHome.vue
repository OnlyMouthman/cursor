<template>
  <div>
    <ModuleAccessBanner />

    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Notes Module</h1>
        <p class="mt-2 text-sm text-gray-500">{{ $t('module.stubHint') }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="!canEdit"
        :title="!canEdit ? $t('access.signInToEditHint') : undefined"
        @click="onStubAction('new-note')"
      >
        {{ $t('module.newNote') }}
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
  console.log('[Notes stub]', action)
}
</script>
