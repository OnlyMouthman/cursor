import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import i18n from './i18n'
import './styles/main.css'

// 初始化 Firebase
import { initFirebase } from './api/firebase/config'
initFirebase()

// 初始化使用者狀態（監聽 Firebase Auth 狀態變化）
import { useUserStore } from './stores/user'
import { authAPI } from './api/auth'

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

// 監聽 Firebase Auth 狀態變化
authAPI.onAuthStateChange((user) => {
  const userStore = useUserStore()
  userStore.setUser(user)
})

app.mount('#app')


