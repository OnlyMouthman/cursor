<template>
  <div class="roles-management">
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="mb-2 text-3xl font-bold text-ink-strong">{{ $t('menu.roleManagement') }}</h1>
        <p class="text-ink-main">{{ $t('roles.description') }}</p>
      </div>
      <button v-if="canEdit" @click="openAddModal()" class="btn-primary">
        {{ $t('roles.addRole') }}
      </button>
    </div>

    <div class="ui-card overflow-hidden shadow">
      <div v-if="loading" class="p-8 text-center">
        <div class="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        <p class="mt-2 text-ink-main">{{ $t('common.loading') }}</p>
      </div>

      <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded text-red-600 m-4">
        {{ error }}
      </div>

      <div v-else-if="roles.length === 0" class="p-8 text-center text-ink-muted">
        {{ $t('roles.noRoles') }}
      </div>

      <table v-else class="min-w-full divide-y divide-line">
        <thead class="bg-soft/15">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted">{{ $t('roles.name') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted">{{ $t('roles.slug') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted">{{ $t('roles.descriptionColumn') }}</th>
            <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted">{{ $t('roles.permissionCount') }}</th>
            <th v-if="canEdit" class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-ink-muted">{{ $t('roles.actions') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line bg-surface">
          <tr v-for="role in roles" :key="role.id" class="hover:bg-soft/15">
            <td class="whitespace-nowrap px-6 py-4 font-medium text-ink-strong">{{ role.name }}</td>
            <td class="whitespace-nowrap px-6 py-4 font-mono text-sm text-ink-main">{{ role.slug }}</td>
            <td class="max-w-xs px-6 py-4 text-ink-main">{{ role.description || '—' }}</td>
            <td class="whitespace-nowrap px-6 py-4 text-ink-main">{{ rolePermissionCounts[role.id] ?? 0 }}</td>
            <td v-if="canEdit" class="whitespace-nowrap px-6 py-4 text-sm">
              <button
                @click="openEditModal(role)"
                class="mr-3 text-primary hover:underline"
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
              <span v-else class="text-xs text-ink-muted">{{ $t('roles.cannotDeleteSuperAdmin') }}</span>
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
        <div class="mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border border-line bg-surface shadow-xl">
          <div class="p-6">
            <h2 class="mb-4 text-xl font-semibold text-ink-strong">{{ isEdit ? $t('roles.editRole') : $t('roles.addRole') }}</h2>
            <div class="space-y-4">
              <div>
                <label class="mb-1 block text-sm font-medium text-ink-main">{{ $t('roles.name') }}</label>
                <input
                  v-model="form.name"
                  class="w-full rounded-lg border border-line px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink-main">{{ $t('roles.slug') }}</label>
                <input
                  v-model="form.slug"
                  :readonly="isEdit"
                  class="w-full rounded-lg border border-line px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus disabled:bg-soft/20"
                />
              </div>
              <div>
                <label class="mb-1 block text-sm font-medium text-ink-main">{{ $t('roles.descriptionColumn') }}</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  class="w-full rounded-lg border border-line px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-focus"
                />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-ink-main">{{ $t('roles.permissions') }}</label>
                <div class="max-h-48 space-y-3 overflow-y-auto rounded-lg border border-line bg-page p-3">
                  <div v-for="group in permissionGroups" :key="group.id" class="space-y-1">
                    <div class="text-sm font-medium text-ink-main">{{ group.name }}</div>
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
                          class="rounded border-line"
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
                class="rounded-lg border border-line px-4 py-2 transition hover:bg-soft/20"
              >
                {{ $t('common.cancel') }}
              </button>
              <button @click="saveRole" :disabled="saving" class="btn-primary disabled:opacity-50">
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
