<template>
  <div>
    <NotesAccessBanner />
    <NotesPage />
  </div>
</template>

<script setup lang="ts">
/** `/notes` 路由視圖：平台瀏覽權限提示 + 三欄工作區（NotesPage）。 */
import NotesAccessBanner from './NotesAccessBanner.vue'
import NotesPage from './NotesPage.vue'
</script>
