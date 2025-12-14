<template>
  <div id="app">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex">
            <router-link to="/" class="flex items-center px-2 py-2 text-gray-700">
              {{ $t('common.welcome') }}
            </router-link>
            <router-link to="/about" class="flex items-center px-2 py-2 text-gray-700">
              About
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    <main class="container mx-auto px-4 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// App 根元件
</script>


