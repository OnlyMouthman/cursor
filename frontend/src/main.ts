import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { pinia } from './stores'
import i18n from './i18n'
import './styles/main.css'

// 初始化 Firebase
import { initFirebase } from './api/firebase/config'
initFirebase()

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')


