<template>
  <div class="relative">
    <!-- 未登入：顯示登入按鈕 -->
    <button
      v-if="!userStore.isAuthenticated"
      @click="handleLogin"
      :disabled="userStore.loading"
      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
    >
      <svg
        v-if="userStore.loading"
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <svg
        v-else
        class="w-5 h-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>
      <span>Google 登入</span>
    </button>

    <!-- 已登入：顯示頭像和下拉選單 -->
    <div v-else class="relative">
      <button
        @click="toggleDropdown"
        class="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition"
      >
        <img
          v-if="userStore.photoURL"
          :src="userStore.photoURL"
          :alt="userStore.displayName"
          class="w-8 h-8 rounded-full"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium"
        >
          {{ userStore.displayName.charAt(0).toUpperCase() || 'U' }}
        </div>
      </button>

      <!-- Dropdown 選單 -->
      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      >
        <div class="px-4 py-2 border-b border-gray-100">
          <p class="text-sm font-medium text-gray-900">{{ userStore.displayName || '使用者' }}</p>
          <p class="text-xs text-gray-500 truncate">{{ userStore.email }}</p>
        </div>

        <!-- 根據 context 顯示不同選項 -->
        <button
          v-if="context === 'front'"
          @click="goToManage"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          進入後台
        </button>

        <button
          v-if="context === 'manage'"
          @click="goToFront"
          class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          回到前台
        </button>

        <div class="border-t border-gray-100 my-1"></div>

        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          登出
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { authAPI } from '@/api/auth'

const props = defineProps<{
  context: 'front' | 'manage'
}>()

const router = useRouter()
const userStore = useUserStore()

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

// 點擊外部關閉 dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const dropdown = target.closest('.relative')
  if (!dropdown && showDropdown.value) {
    closeDropdown()
  }
}

onMounted(() => {
  // 使用 setTimeout 確保事件監聽器在 DOM 更新後添加
  setTimeout(() => {
    document.addEventListener('click', handleClickOutside)
  }, 0)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogin = async () => {
  try {
    userStore.setLoading(true)
    const user = await authAPI.signInWithGoogle()
    userStore.setUser(user)
    // 登入成功後導向原目標或首頁
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    console.error('Login failed:', error)
    alert('登入失敗：' + (error.message || '未知錯誤'))
  } finally {
    userStore.setLoading(false)
  }
}

const handleLogout = async () => {
  try {
    await authAPI.signOut()
    userStore.clearUser()
    closeDropdown()
    router.push('/')
  } catch (error: any) {
    console.error('Logout failed:', error)
    alert('登出失敗：' + (error.message || '未知錯誤'))
  }
}

const goToManage = () => {
  closeDropdown()
  router.push('/manage')
}

const goToFront = () => {
  closeDropdown()
  router.push('/')
}
</script>

