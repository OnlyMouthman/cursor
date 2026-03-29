<template>
  <aside
    :class="[
      'flex flex-col border-r border-line bg-sidebar transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    ]"
    style="height: 100%;"
  >
    <div class="flex h-14 flex-shrink-0 items-center justify-between border-b border-line px-4">
      <span v-if="!isCollapsed" class="font-semibold text-ink-strong">{{ $t(sidebarTitleKey) }}</span>
      <button
        @click="toggleCollapse"
        class="rounded p-2 transition hover:bg-sidebar-row-hover"
        :title="isCollapsed ? $t('common.expand') : $t('common.collapse')"
      >
        <svg
          class="h-5 w-5 text-ink-main"
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
        <!-- 模組假選單（notes / gis / ar） -->
        <template v-if="isModuleMode">
          <li v-for="item in stubMenuItems" :key="item.id">
            <router-link
              :to="item.route"
              class="group flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-sidebar-row-hover"
              :class="{
                'bg-sidebar-active text-sidebar-active-fg': isStubActive(item.route),
                'text-sidebar-fg': !isStubActive(item.route)
              }"
            >
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
              </svg>
              <span v-if="!isCollapsed" class="text-sm font-medium">{{ item.name }}</span>
            </router-link>
          </li>
        </template>

        <!-- 後台：Firestore 選單 -->
        <template v-else>
          <template v-for="item in visibleMenuNodes" :key="item.id">
            <li>
              <router-link
                :to="item.route"
                class="group flex items-center gap-3 rounded-lg px-3 py-2 transition hover:bg-sidebar-row-hover"
                :class="{
                  'bg-sidebar-active text-sidebar-active-fg': route.path === item.route,
                  'text-sidebar-fg': route.path !== item.route
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
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-sidebar-row-hover"
                    :class="{
                      'bg-sidebar-active text-sidebar-active-fg': route.path === child.route,
                      'text-sidebar-fg': route.path !== child.route
                    }"
                  >
                    <span class="font-medium">{{ resolveLabel(child.name) }}</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </template>
        </template>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { hasPermission } from '@/utils/permissions'
import type { PermissionSlug } from '@/types/rbac'
import { getMenusWithPermissionSlugs, buildMenuTree } from '@/api/menus'
import type { MenuTreeNode } from '@/types/rbac'
import {
  MODULE_STUB_MENUS,
  sidebarTitleKey as sidebarTitleKeyForModule,
  type PlatformModuleKey
} from '@/types/module'

const props = withDefaults(
  defineProps<{
    /** 後台為 Firestore 選單；其餘為假資料側欄 */
    module?: PlatformModuleKey
  }>(),
  { module: 'manage' }
)

const route = useRoute()
const { t } = useI18n()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const { loadedForUid, permissionSlugs } = storeToRefs(permissionStore)

function viewSlugForStubRoute(path: string): PermissionSlug | null {
  if (path.startsWith('/notes')) return 'notes.view'
  if (path.startsWith('/gis')) return 'gis.view'
  if (path.startsWith('/ar')) return 'ar.view'
  return null
}
const isCollapsed = ref(false)

const isModuleMode = computed(() => props.module !== 'manage')

const sidebarTitleKey = computed(() => sidebarTitleKeyForModule(props.module))

const stubMenuItems = computed(() => {
  loadedForUid.value
  permissionSlugs.value
  const items = MODULE_STUB_MENUS[props.module] ?? []
  return items.filter(item => {
    const slug = viewSlugForStubRoute(item.route)
    if (!slug) return true
    return hasPermission(userStore.currentUser, slug)
  })
})

function isStubActive(path: string): boolean {
  return route.path === path
}

const menuTree = ref<MenuTreeNode[]>([])

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

function resolveLabel(name: string): string {
  if (name.startsWith('menu.')) return t(name)
  return name
}

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
  if (props.module !== 'manage') return
  const items = await getMenusWithPermissionSlugs()
  menuTree.value = buildMenuTree(items)
}

onMounted(loadMenus)
watch(() => permissionStore.permissionSlugs, loadMenus, { deep: true })
watch(
  () => props.module,
  () => loadMenus()
)
</script>
