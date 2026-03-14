<template>
  <aside
    :class="[
      'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
    style="height: 100%;"
  >
    <div class="h-14 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
      <span v-if="!isCollapsed" class="font-semibold text-gray-800">{{ $t('menu.manageTitle') }}</span>
      <button
        @click="toggleCollapse"
        class="p-2 rounded hover:bg-gray-100 transition"
        :title="isCollapsed ? $t('common.expand') : $t('common.collapse')"
      >
        <svg
          class="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            v-if="isCollapsed"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-4">
      <ul class="space-y-1 px-2">
        <template v-for="item in visibleMenuNodes" :key="item.id">
          <li>
            <router-link
              :to="item.route"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition group"
              :class="{
                'bg-blue-50 text-blue-600': route.path === item.route,
                'text-gray-700': route.path !== item.route
              }"
            >
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </svg>
              <span v-if="!isCollapsed" class="text-sm font-medium">{{ resolveLabel(item.name) }}</span>
            </router-link>
            <ul v-if="item.children?.length && !isCollapsed" class="ml-4 mt-1 space-y-1">
              <li v-for="child in item.children" :key="child.id">
                <router-link
                  :to="child.route"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm"
                  :class="{
                    'bg-blue-50 text-blue-600': route.path === child.route,
                    'text-gray-700': route.path !== child.route
                  }"
                >
                  <span class="font-medium">{{ resolveLabel(child.name) }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { usePermissionStore } from '@/stores/permission'
import { getMenusWithPermissionSlugs, buildMenuTree } from '@/api/menus'
import type { MenuTreeNode } from '@/types/rbac'

const route = useRoute()
const { t } = useI18n()
const permissionStore = usePermissionStore()
const isCollapsed = ref(false)

const menuTree = ref<MenuTreeNode[]>([])
const menuItemsWithSlug = ref<{ id: string; name: string; route: string; icon: string; order: number; parentId: string | null; permissionId: string; permissionSlug: string }[]>([])

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

function resolveLabel(name: string): string {
  if (name.startsWith('menu.')) return t(name)
  return name
}

/** 依權限過濾選單樹：無權限的節點不顯示；父節點不顯示則子節點也不顯示 */
function filterTreeByPermission(nodes: MenuTreeNode[]): MenuTreeNode[] {
  return nodes
    .filter(node => permissionStore.can(node.permissionSlug ?? ''))
    .map(node => ({
      ...node,
      children: filterTreeByPermission(node.children)
    }))
}

const visibleMenuNodes = computed(() => {
  const tree = menuTree.value
  if (!tree.length) return []
  return filterTreeByPermission(tree)
})

async function loadMenus() {
  const items = await getMenusWithPermissionSlugs()
  menuItemsWithSlug.value = items
  menuTree.value = buildMenuTree(items)
}

onMounted(loadMenus)
watch(() => permissionStore.permissionSlugs, loadMenus, { deep: true })
</script>
