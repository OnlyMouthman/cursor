import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW'
import en from './locales/en'

// 從 localStorage 讀取語言設定，如果沒有則使用環境變數或預設值
const getInitialLocale = (): string => {
  const saved = localStorage.getItem('locale')
  if (saved && (saved === 'zh-TW' || saved === 'en')) {
    return saved
  }
  return import.meta.env.VITE_APP_LOCALE || 'zh-TW'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    en
  }
})

export default i18n


