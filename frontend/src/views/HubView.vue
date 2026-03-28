<template>
  <div class="max-w-5xl mx-auto px-4 py-10">
    <h1 class="text-2xl font-semibold text-gray-900 mb-1">{{ $t('hub.title') }}</h1>
    <p class="text-gray-500 text-sm mb-8">{{ $t('hub.subtitle') }}</p>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="card in cards"
        :key="card.key"
        :to="card.path"
        class="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
      >
        <h2 class="text-lg font-medium text-gray-900 group-hover:text-blue-600">{{ card.name }}</h2>
        <p v-if="card.description" class="mt-2 text-sm text-gray-500">{{ card.description }}</p>
        <p class="mt-4 text-xs font-mono text-gray-400">{{ card.path }}</p>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HUB_MODULE_CARDS } from '@/types/module'

const cards = HUB_MODULE_CARDS
</script>
