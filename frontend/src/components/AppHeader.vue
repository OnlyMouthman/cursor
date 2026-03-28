<template>
  <header class="fixed top-0 left-0 right-0 z-50 h-14 border-b border-white/10 bg-header shadow-sm">
    <div class="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
      <!-- Logo / 標題 -->
      <div class="flex items-center">
        <router-link to="/" class="text-xl font-bold text-header-fg">
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
  context: 'front' | 'manage' | 'module'
}>()
</script>

