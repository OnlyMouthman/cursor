import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW'
import en from './locales/en'

const i18n = createI18n({
  legacy: false,
  locale: import.meta.env.VITE_APP_LOCALE || 'zh-TW',
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    en
  }
})

export default i18n


