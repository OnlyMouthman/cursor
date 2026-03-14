<template>
  <header class="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-50">
    <div class="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
      <!-- Logo / 標題 -->
      <div class="flex items-center">
        <router-link to="/" class="text-xl font-bold text-gray-800">
          {{ $t('common.welcome') }}
        </router-link>
      </div>

      <!-- 右側：語言選擇器和登入狀態或登入按鈕 -->
      <div class="flex items-center gap-3">
        <LanguageSwitcher />
        <UserMenu :context="context" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import UserMenu from './UserMenu.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

defineProps<{
  context: 'front' | 'manage'
}>()
</script>

