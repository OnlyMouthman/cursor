<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="header-icon-btn flex items-center gap-2 px-3 py-2"
      :title="$t('common.language')"
    >
      <svg
        class="h-5 w-5 text-header-fg-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      <span class="text-sm font-medium text-header-fg">{{ currentLanguageLabel }}</span>
      <svg
        class="h-4 w-4 text-header-fg-muted"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <!-- Dropdown 選單 -->
    <div
      v-if="showDropdown"
      class="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-line bg-surface py-1 shadow-lg"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-soft/20"
        :class="{
          'bg-primary-subtle text-primary': currentLocale === lang.code,
          'text-ink-main': currentLocale !== lang.code
        }"
      >
        <span>{{ lang.flag }}</span>
        <span>{{ lang.label }}</span>
        <svg
          v-if="currentLocale === lang.code"
          class="w-4 h-4 ml-auto"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const showDropdown = ref(false)

const languages = [
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼' },
  { code: 'en', label: 'English', flag: '🇺🇸' }
]

const currentLocale = computed(() => locale.value)

const currentLanguageLabel = computed(() => {
  const lang = languages.find(l => l.code === currentLocale.value)
  return lang ? lang.label : 'Language'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const changeLanguage = (langCode: string) => {
  locale.value = langCode
  // 儲存到 localStorage
  localStorage.setItem('locale', langCode)
  showDropdown.value = false
}

// 點擊外部關閉 dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')
  if (!dropdown && showDropdown.value) {
    showDropdown.value = false
  }
}

onMounted(() => {
  // 從 localStorage 讀取語言設定
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && languages.some(l => l.code === savedLocale)) {
    locale.value = savedLocale
  }
  
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

