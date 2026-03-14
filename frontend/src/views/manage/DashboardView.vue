<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">{{ $t('manage.dashboard') }}</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('manage.totalUsers') }}</h2>
        <p class="text-3xl font-bold text-blue-600">0</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('manage.todayVisits') }}</h2>
        <p class="text-3xl font-bold text-green-600">0</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-700 mb-2">{{ $t('manage.systemStatus') }}</h2>
        <p class="text-3xl font-bold text-gray-600">{{ $t('manage.normal') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 後台儀表板
</script>

