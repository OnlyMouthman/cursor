/**
 * User Store
 * 管理使用者登入狀態與使用者資料
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User as FirebaseUser } from 'firebase/auth'
import type { UserDocument } from '@/types/user'
import { usersAPI } from '@/api/users'
import { authAPI } from '@/api/auth'
import { usePermissionStore } from '@/stores/permission'

export const useUserStore = defineStore('user', () => {
  // Firebase Auth 使用者
  const user = ref<FirebaseUser | null>(null)
  // Firestore 使用者文件（含 role/status）
  const currentUser = ref<UserDocument | null>(null)
  const loading = ref(false)

  /** 首次 auth 狀態處理完成後 resolve（用於 router guard 等待 profile 載入） */
  let authReadyResolve: (() => void) | null = null
  const authReadyPromise = new Promise<void>(resolve => {
    authReadyResolve = resolve
  })

  const isAuthenticated = computed(() => user.value !== null)
  const displayName = computed(() => currentUser.value?.displayName || user.value?.displayName || '')
  const email = computed(() => currentUser.value?.email || user.value?.email || '')
  const photoURL = computed(() => currentUser.value?.photoURL || user.value?.photoURL || '')
  const role = computed(() => currentUser.value?.role || 'viewer')
  const status = computed(() => currentUser.value?.status || 'active')
  const isAdmin = computed(() => role.value === 'admin')
  const isActive = computed(() => status.value === 'active')

  /**
   * 設定 Firebase Auth 使用者
   */
  function setUser(firebaseUser: FirebaseUser | null) {
    user.value = firebaseUser
    if (!firebaseUser) {
      currentUser.value = null
    }
  }

  /**
   * 設定使用者文件（從 Firestore）
   */
  function setCurrentUser(userDoc: UserDocument | null) {
    currentUser.value = userDoc
  }

  /**
   * 清除使用者資料；未登入時改載入 guest 角色權限（不呼叫 permission clear，以免清空訪客上下文）
   */
  async function clearUser() {
    user.value = null
    currentUser.value = null
    try {
      await usePermissionStore().loadForGuest()
    } catch (e) {
      console.error('loadForGuest failed:', e)
    }
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  /**
   * 初始化使用者狀態
   * 監聽 Firebase Auth 狀態變化，並同步 Firestore 使用者資料
   */
  async function init() {
    // 監聽認證狀態變化
    authAPI.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        
        try {
          // 取得或建立使用者文件
          let userDoc = await usersAPI.get(firebaseUser.uid)
          
          if (!userDoc) {
            // 如果不存在，建立新使用者文件
            userDoc = await usersAPI.createOrUpdate(
              {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                role: 'viewer',
                status: 'active'
              },
              true // 新使用者
            )
          } else {
            // 更新最後登入時間
            await usersAPI.updateLastLogin(firebaseUser.uid)
            
            // 同步基本資料（如果 Firebase Auth 有變更）
            await usersAPI.syncProfile(firebaseUser.uid, {
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              email: firebaseUser.email
            })
            
            // 重新取得最新資料
            userDoc = await usersAPI.get(firebaseUser.uid)
          }
          
          if (userDoc) {
            setCurrentUser(userDoc)
            await usePermissionStore().loadForUser(
              firebaseUser.uid,
              userDoc.roleId,
              userDoc.role
            )
          }
        } catch (error) {
          console.error('Failed to sync user data:', error)
        }
        authReadyResolve?.()
        authReadyResolve = null
      } else {
        await clearUser()
        authReadyResolve?.()
        authReadyResolve = null
      }
    })
  }

  /**
   * 等待 auth 狀態與 Firestore profile 首次載入完成
   * 用於 router guard：避免在 profile 尚未載入時就因 currentUser 為 null 而誤判為無權限
   */
  function waitForAuthReady(timeoutMs = 5000): Promise<void> {
    return Promise.race([
      authReadyPromise,
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Auth ready timeout')), timeoutMs)
      )
    ])
  }

  return {
    user,
    currentUser,
    loading,
    isAuthenticated,
    displayName,
    email,
    photoURL,
    role,
    status,
    isAdmin,
    isActive,
    setUser,
    setCurrentUser,
    clearUser,
    setLoading,
    init,
    waitForAuthReady
  }
})

