<template>
  <div>
    <h1 class="mb-6 text-3xl font-bold text-ink-strong">{{ $t('manage.dashboard') }}</h1>
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="ui-card p-6 shadow">
        <h2 class="mb-2 text-lg font-semibold text-ink-main">{{ $t('manage.totalUsers') }}</h2>
        <p class="text-3xl font-bold text-primary">0</p>
      </div>
      <div class="ui-card p-6 shadow">
        <h2 class="mb-2 text-lg font-semibold text-ink-main">{{ $t('manage.todayVisits') }}</h2>
        <p class="text-3xl font-bold text-green-600">0</p>
      </div>
      <div class="ui-card p-6 shadow">
        <h2 class="mb-2 text-lg font-semibold text-ink-main">{{ $t('manage.systemStatus') }}</h2>
        <p class="text-3xl font-bold text-ink-muted">{{ $t('manage.normal') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 後台儀表板
</script>

