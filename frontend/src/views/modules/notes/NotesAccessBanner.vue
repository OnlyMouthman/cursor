<template>
  <div
    v-if="showBanner"
    class="mb-6 rounded-xl border border-card-border bg-white px-4 py-3.5 text-sm text-ink-main shadow-sm ring-1 ring-black/[0.03]"
  >
    <template v-if="tier === 'guest'">
      <p class="text-[13px] font-semibold text-ink-strong">{{ $t('access.guestViewTitle') }}</p>
      <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">{{ $t('access.guestViewBody') }}</p>
    </template>
    <template v-else-if="tier === 'public_only'">
      <p class="text-[13px] font-semibold text-ink-strong">{{ $t('access.notesPublicOnlyTitle') }}</p>
      <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">{{ $t('access.notesPublicOnlyBody') }}</p>
    </template>
    <template v-else>
      <p class="text-[13px] font-semibold text-ink-strong">{{ $t('access.notesViewPrivateTitle') }}</p>
      <p class="mt-1.5 text-xs leading-relaxed text-ink-muted">{{ $t('access.notesViewPrivateBody') }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useNotesDataAccess } from '@/composables/useNotesDataAccess'
import { usePageAccess } from '@/composables/usePageAccess'

const userStore = useUserStore()
const { canEdit } = usePageAccess()
const { canReadAllNotes } = useNotesDataAccess()

/** 具 notes.edit 時不顯示（與 Step 2 一致，可逕行編輯） */
const showBanner = computed(() => !canEdit.value)

const tier = computed((): 'guest' | 'public_only' | 'view_private' => {
  if (!userStore.isAuthenticated) return 'guest'
  if (canReadAllNotes.value) return 'view_private'
  return 'public_only'
})
</script>
