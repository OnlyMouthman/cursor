import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type FirebaseUser } from '@/api/firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<FirebaseUser | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  // 監聽認證狀態變化
  authService.onAuthStateChange((firebaseUser) => {
    user.value = firebaseUser
  })

  async function login(email: string, password: string) {
    loading.value = true
    try {
      await authService.signIn(email, password)
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, password: string) {
    loading.value = true
    try {
      await authService.signUp(email, password)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    try {
      await authService.signOut()
      user.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  }
})

