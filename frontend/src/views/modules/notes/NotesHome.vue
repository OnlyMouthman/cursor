<template>
  <div>
    <ModuleAccessBanner />
    <NotesPage />
  </div>
</template>

<script setup lang="ts">
/** `/notes` 路由視圖：平台瀏覽權限提示 + 三欄工作區（NotesPage）。 */
import ModuleAccessBanner from '@/components/ModuleAccessBanner.vue'
import NotesPage from './NotesPage.vue'
</script>
