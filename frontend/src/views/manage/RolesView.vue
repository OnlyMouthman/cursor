<template>
  <div class="roles-management">
    <div class="mb-6 flex justify-between items-start">
      <div>
        <h1 class="text-3xl font-bold mb-2">{{ $t('menu.roleManagement') }}</h1>
        <p class="text-gray-600">{{ $t('roles.description') }}</p>
      </div>
      <button
        v-if="canEdit"
        @click="openAddModal()"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {{ $t('roles.addRole') }}
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2 text-gray-600">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded text-red-600 m-4">
        {{ error }}
      </div>

      <div v-else-if="roles.length === 0" class="p-8 text-center text-gray-500">
        {{ $t('roles.noRoles') }}
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('roles.name') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('roles.slug') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('roles.descriptionColumn') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('roles.permissionCount') }}</th>
            <th v-if="canEdit" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ $t('roles.actions') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ role.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-mono text-sm">{{ role.slug }}</td>
            <td class="px-6 py-4 text-gray-600 max-w-xs">{{ role.description || '—' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600">{{ rolePermissionCounts[role.id] ?? 0 }}</td>
            <td v-if="canEdit" class="px-6 py-4 whitespace-nowrap text-sm">
              <button
                @click="openEditModal(role)"
                class="text-blue-600 hover:underline mr-3"
              >
                {{ $t('roles.editRole') }}
              </button>
              <button
                v-if="role.slug !== superAdminSlug"
                @click="confirmDelete(role)"
                class="text-red-600 hover:underline"
              >
                {{ $t('roles.deleteRole') }}
              </button>
              <span v-else class="text-gray-400 text-xs">{{ $t('roles.cannotDeleteSuperAdmin') }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/編輯 Modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="modalOpen = false"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-4">{{ isEdit ? $t('roles.editRole') : $t('roles.addRole') }}</h2>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('roles.name') }}</label>
                <input
                  v-model="form.name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('roles.slug') }}</label>
                <input
                  v-model="form.slug"
                  :readonly="isEdit"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('roles.descriptionColumn') }}</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('roles.permissions') }}</label>
                <div class="space-y-3 border rounded-lg p-3 bg-gray-50 max-h-48 overflow-y-auto">
                  <div v-for="group in permissionGroups" :key="group.id" class="space-y-1">
                    <div class="font-medium text-gray-700 text-sm">{{ group.name }}</div>
                    <div class="flex flex-wrap gap-2 pl-2">
                      <label
                        v-for="perm in permissionsByGroup[group.id]"
                        :key="perm.id"
                        class="inline-flex items-center gap-1 text-sm"
                      >
                        <input
                          type="checkbox"
                          :value="perm.id"
                          v-model="form.permissionIds"
                          class="rounded border-gray-300"
                        />
                        {{ perm.name }}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 flex justify-end gap-2">
              <button
                @click="modalOpen = false"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {{ $t('common.cancel') }}
              </button>
              <button
                @click="saveRole"
                :disabled="saving"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ saving ? $t('common.loading') : $t('common.save') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePermissionStore } from '@/stores/permission'
import {
  listRoles,
  listPermissionGroups,
  listPermissionsByGroup,
  getPermissionIdsByRoleId,
  setRole,
  setRolePermissions,
  createRole,
  deleteRole
} from '@/api/firebase/rbac'
import { SUPER_ADMIN_SLUG } from '@/types/rbac'
import type { Role, PermissionGroup, Permission } from '@/types/rbac'

const { t } = useI18n()
const permissionStore = usePermissionStore()
const canEdit = computed(() => permissionStore.can('role.edit'))
const superAdminSlug = SUPER_ADMIN_SLUG

const loading = ref(true)
const error = ref('')
const roles = ref<Role[]>([])
const rolePermissionCounts = ref<Record<string, number>>({})
const permissionGroups = ref<PermissionGroup[]>([])
const permissionsByGroup = ref<Record<string, Permission[]>>({})

const modalOpen = ref(false)
const isEdit = ref(false)
const editingRoleId = ref<string | null>(null)
const saving = ref(false)
const form = ref({
  name: '',
  slug: '',
  description: '',
  permissionIds: [] as string[]
})

async function loadRoles() {
  loading.value = true
  error.value = ''
  try {
    const list = await listRoles()
    roles.value = list
    const counts: Record<string, number> = {}
    await Promise.all(
      list.map(async (r) => {
        const ids = await getPermissionIdsByRoleId(r.id)
        counts[r.id] = ids.length
      })
    )
    rolePermissionCounts.value = counts
  } catch (e: any) {
    error.value = e?.message || (e?.code || 'Failed to load roles')
  } finally {
    loading.value = false
  }
}

async function loadPermissionData() {
  const groups = await listPermissionGroups()
  permissionGroups.value = groups
  const byGroup: Record<string, Permission[]> = {}
  for (const g of groups) {
    byGroup[g.id] = await listPermissionsByGroup(g.id)
  }
  permissionsByGroup.value = byGroup
}

function openAddModal() {
  isEdit.value = false
  editingRoleId.value = null
  form.value = { name: '', slug: '', description: '', permissionIds: [] }
  modalOpen.value = true
}

async function openEditModal(role: Role) {
  isEdit.value = true
  editingRoleId.value = role.id
  form.value = {
    name: role.name,
    slug: role.slug,
    description: role.description ?? '',
    permissionIds: await getPermissionIdsByRoleId(role.id)
  }
  modalOpen.value = true
}

async function saveRole() {
  if (!form.value.name.trim() || !form.value.slug.trim()) return
  saving.value = true
  error.value = ''
  try {
    if (isEdit.value && editingRoleId.value) {
      await setRole(editingRoleId.value, {
        name: form.value.name.trim(),
        slug: form.value.slug.trim(),
        description: form.value.description.trim() || undefined
      })
      await setRolePermissions(editingRoleId.value, form.value.permissionIds)
    } else {
      const created = await createRole({
        name: form.value.name.trim(),
        slug: form.value.slug.trim(),
        description: form.value.description.trim() || undefined
      })
      await setRolePermissions(created.id, form.value.permissionIds)
    }
    modalOpen.value = false
    await loadRoles()
  } catch (e: any) {
    error.value = e?.message || (e?.code || 'Failed to save')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(role: Role) {
  if (!window.confirm(`${role.name}\n${t('roles.confirmDelete')}`)) return
  error.value = ''
  try {
    await deleteRole(role.id)
    await loadRoles()
  } catch (e: any) {
    error.value = e?.message || (e?.code || 'Failed to delete')
  }
}

onMounted(async () => {
  await loadPermissionData()
  loadRoles()
})
</script>
