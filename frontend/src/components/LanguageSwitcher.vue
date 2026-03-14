<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
      :title="$t('common.language')"
    >
      <svg
        class="w-5 h-5 text-gray-600"
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
      <span class="text-sm font-medium text-gray-700">{{ currentLanguageLabel }}</span>
      <svg
        class="w-4 h-4 text-gray-500"
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
      class="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
    >
      <button
        v-for="lang in languages"
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition flex items-center gap-2"
        :class="{
          'bg-blue-50 text-blue-600': currentLocale === lang.code,
          'text-gray-700': currentLocale !== lang.code
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

