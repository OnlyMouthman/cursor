/**
 * User Store
 * 管理使用者登入狀態
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User as FirebaseUser } from 'firebase/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<FirebaseUser | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const displayName = computed(() => user.value?.displayName || '')
  const email = computed(() => user.value?.email || '')
  const photoURL = computed(() => user.value?.photoURL || '')

  function setUser(firebaseUser: FirebaseUser | null) {
    user.value = firebaseUser
  }

  function clearUser() {
    user.value = null
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return {
    user,
    loading,
    isAuthenticated,
    displayName,
    email,
    photoURL,
    setUser,
    clearUser,
    setLoading
  }
})

