<template>
  <div class="flex h-screen flex-col overflow-hidden bg-page">
    <AppHeader context="manage" />
    <!-- 內容區域：從 Header 下方開始，填滿剩餘空間 -->
    <div class="flex overflow-hidden" style="height: calc(100vh - 56px); margin-top: 56px;">
      <ManageSidebar module="manage" />
      <main class="flex-1 overflow-auto">
        <div class="p-6">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import ManageSidebar from '@/components/ManageSidebar.vue'
</script>

