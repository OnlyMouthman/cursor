<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="mb-1 text-2xl font-semibold text-ink-strong">{{ $t('hub.title') }}</h1>
    <p class="mb-8 text-sm text-ink-muted">{{ $t('hub.subtitle') }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="card in visibleCards"
        :key="card.key"
        :to="card.path"
        class="ui-card group block border p-5 hover:border-primary/25 hover:shadow-md"
      >
        <h2 class="text-lg font-medium text-ink-strong transition group-hover:text-primary">{{ card.name }}</h2>
        <p v-if="card.description" class="mt-2 text-sm text-ink-muted">{{ card.description }}</p>
        <p class="mt-4 font-mono text-xs text-ink-muted">{{ card.path }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { hasPermission } from '@/utils/permissions'
import { HUB_MODULE_CARDS } from '@/types/module'
import type { PermissionSlug } from '@/types/rbac'

const userStore = useUserStore()
const permissionStore = usePermissionStore()
const { loadedForUid, permissionSlugs } = storeToRefs(permissionStore)

const visibleCards = computed(() => {
  loadedForUid.value
  permissionSlugs.value
  return HUB_MODULE_CARDS.filter(c =>
    hasPermission(userStore.currentUser, `${c.key}.view` as PermissionSlug)
  )
})
</script>
