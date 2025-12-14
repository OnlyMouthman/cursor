<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader context="front" />
    <main class="pt-14">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
</script>

