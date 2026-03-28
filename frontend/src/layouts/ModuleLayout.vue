<template>
  <div class="h-screen bg-gray-50 flex flex-col overflow-hidden">
    <AppHeader context="module" />
    <div class="flex overflow-hidden" style="height: calc(100vh - 56px); margin-top: 56px;">
      <ManageSidebar :module="moduleKey" />
      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ManageSidebar from '@/components/ManageSidebar.vue'
import type { PlatformModuleKey } from '@/types/module'

const route = useRoute()

/** 父層 ModuleLayout 路由（matched[0]）上的 meta.module */
const moduleKey = computed((): PlatformModuleKey => {
  const m = route.matched[0]?.meta?.module
  if (m === 'notes' || m === 'gis' || m === 'ar') return m
  return 'notes'
})
</script>
