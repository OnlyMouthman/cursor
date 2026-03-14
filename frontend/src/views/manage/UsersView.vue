<template>
  <div class="users-management">
    <!-- 頁面標題 -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold mb-2">{{ $t('users.title') }}</h1>
      <p class="text-gray-600">{{ $t('users.description') }}</p>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- 搜尋 -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('users.search') }}
          </label>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('users.searchPlaceholder')"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <!-- 角色篩選 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('users.role') }}
          </label>
          <select
            v-model="filterRole"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{{ $t('users.allRoles') }}</option>
            <option value="admin">{{ $t('users.roles.admin') }}</option>
            <option value="editor">{{ $t('users.roles.editor') }}</option>
            <option value="viewer">{{ $t('users.roles.viewer') }}</option>
          </select>
        </div>

        <!-- 狀態篩選 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ $t('users.status') }}
          </label>
          <select
            v-model="filterStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{{ $t('users.allStatuses') }}</option>
            <option value="active">{{ $t('users.statuses.active') }}</option>
            <option value="disabled">{{ $t('users.statuses.disabled') }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 使用者列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded text-red-600">
        {{ error }}
      </div>

      <div v-else-if="filteredUsers.length === 0" class="p-8 text-center text-gray-500">
        {{ $t('users.noUsers') }}
      </div>

      <!-- 表格 -->
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.user') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.email') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.role') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.status') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.lastLogin') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.actions') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in filteredUsers" :key="user.uid" class="hover:bg-gray-50">
            <!-- 使用者資訊 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img
                  v-if="user.photoURL"
                  :src="user.photoURL"
                  :alt="user.displayName"
                  class="w-10 h-10 rounded-full mr-3"
                />
                <div
                  v-else
                  class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium mr-3"
                >
                  {{ user.displayName.charAt(0).toUpperCase() || 'U' }}
                </div>
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ user.displayName || '-' }}</div>
                  <div class="text-xs text-gray-500">
                    {{ $t('users.createdAt') }}: {{ formatDate(user.createdAt) }}
                  </div>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ user.email }}</div>
            </td>

            <!-- 角色 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                v-if="canEditUser(user)"
                v-model="user.role"
                @change="handleRoleChange(user)"
                :disabled="updatingUsers.has(user.uid)"
                class="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">{{ $t('users.roles.admin') }}</option>
                <option value="editor">{{ $t('users.roles.editor') }}</option>
                <option value="viewer">{{ $t('users.roles.viewer') }}</option>
              </select>
              <span v-else class="text-sm text-gray-900">
                {{ $t(`users.roles.${user.role}`) }}
              </span>
            </td>

            <!-- 狀態 -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  user.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ $t(`users.statuses.${user.status}`) }}
              </span>
            </td>

            <!-- 最後登入 -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : $t('users.never') }}
            </td>

            <!-- 操作 -->
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button
                v-if="canEditUser(user)"
                @click="handleToggleStatus(user)"
                :disabled="updatingUsers.has(user.uid)"
                :class="[
                  'px-3 py-1 rounded text-xs font-medium transition',
                  user.status === 'active'
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200',
                  updatingUsers.has(user.uid) && 'opacity-50 cursor-not-allowed'
                ]"
              >
                {{ updatingUsers.has(user.uid) 
                  ? $t('common.loading') 
                  : user.status === 'active' 
                    ? $t('users.disable') 
                    : $t('users.enable') 
                }}
              </button>
              <span v-else class="text-gray-400">{{ $t('users.noPermission') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { usersAPI } from '@/api/users'
import { hasPermission } from '@/utils/permissions'
import type { UserDocument, UserRole, UserStatus } from '@/types/user'
import { formatDate } from '@/utils/index'

const { t } = useI18n()
const userStore = useUserStore()

const users = ref<UserDocument[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const searchQuery = ref('')
const filterRole = ref<UserRole | ''>('')
const filterStatus = ref<UserStatus | ''>('')
const updatingUsers = ref<Set<string>>(new Set())

// 過濾後的使用者列表
const filteredUsers = computed(() => {
  let result = users.value

  // 搜尋
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      user =>
        user.displayName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }

  // 角色篩選
  if (filterRole.value) {
    result = result.filter(user => user.role === filterRole.value)
  }

  // 狀態篩選
  if (filterStatus.value) {
    result = result.filter(user => user.status === filterStatus.value)
  }

  return result
})

// 檢查是否可以編輯使用者（admin 且不是自己）
const canEditUser = (user: UserDocument): boolean => {
  if (!userStore.isAdmin) return false
  if (user.uid === userStore.user?.uid) return false // 不能編輯自己
  return true
}

// 載入使用者列表
const loadUsers = async () => {
  loading.value = true
  error.value = null

  try {
    users.value = await usersAPI.list({
      role: filterRole.value || undefined,
      status: filterStatus.value || undefined
    })
  } catch (err: any) {
    error.value = err.message || t('users.loadError')
    console.error('Failed to load users:', err)
  } finally {
    loading.value = false
  }
}

// 處理角色變更
const handleRoleChange = async (user: UserDocument) => {
  if (!canEditUser(user)) return

  updatingUsers.value.add(user.uid)

  try {
    await usersAPI.updateRole({
      uid: user.uid,
      role: user.role
    })
    // 重新載入列表以取得最新資料
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || t('users.updateError')
    // 恢復原值
    await loadUsers()
  } finally {
    updatingUsers.value.delete(user.uid)
  }
}

// 處理狀態切換
const handleToggleStatus = async (user: UserDocument) => {
  if (!canEditUser(user)) return

  // 防呆：不能把自己設為 disabled
  if (user.uid === userStore.user?.uid && user.status === 'active') {
    alert(t('users.cannotDisableSelf'))
    return
  }

  updatingUsers.value.add(user.uid)

  try {
    const newStatus: UserStatus = user.status === 'active' ? 'disabled' : 'active'
    await usersAPI.updateStatus({
      uid: user.uid,
      status: newStatus
    })
    // 重新載入列表
    await loadUsers()
  } catch (err: any) {
    error.value = err.message || t('users.updateError')
    // 恢復原值
    await loadUsers()
  } finally {
    updatingUsers.value.delete(user.uid)
  }
}

onMounted(() => {
  loadUsers()
})
</script>

