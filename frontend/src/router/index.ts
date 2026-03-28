/**
 * 公開瀏覽：/hub、/notes、/gis、/ar 不設 requiresAuth。
 * 子路由可選 meta.editablePermission（如 'notes.edit'）配合 usePageAccess 決定 canEdit。
 */
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permissions'

// Layouts
import FrontLayout from '@/layouts/FrontLayout.vue'
import ManageLayout from '@/layouts/ManageLayout.vue'
import ModuleLayout from '@/layouts/ModuleLayout.vue'

// Views
import AboutView from '@/views/AboutView.vue'
import AuthView from '@/views/AuthView.vue'
import HubView from '@/views/HubView.vue'
import ManageDashboard from '@/views/manage/DashboardView.vue'
import NotesHome from '@/views/modules/notes/NotesHome.vue'
import GISHome from '@/views/modules/gis/GISHome.vue'
import ARHome from '@/views/modules/ar/ARHome.vue'
import ModuleStubPage from '@/views/modules/ModuleStubPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/hub'
  },
  {
    path: '/hub',
    component: FrontLayout,
    meta: { module: 'platform' },
    children: [
      {
        path: '',
        name: 'Hub',
        component: HubView,
        meta: { module: 'platform' }
      }
    ]
  },
  {
    path: '/about',
    component: FrontLayout,
    meta: { module: 'platform' },
    children: [
      {
        path: '',
        name: 'About',
        component: AboutView,
        meta: { module: 'platform' }
      }
    ]
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { module: 'platform' }
  },
  {
    path: '/notes',
    component: ModuleLayout,
    meta: { module: 'notes', editablePermission: 'notes.edit' },
    children: [
      {
        path: '',
        name: 'NotesHome',
        component: NotesHome,
        meta: { module: 'notes' }
      },
      {
        path: 'explore',
        name: 'NotesExplore',
        component: ModuleStubPage,
        props: { title: 'Notes — explore (stub)' },
        meta: { module: 'notes' }
      }
    ]
  },
  {
    path: '/gis',
    component: ModuleLayout,
    meta: { module: 'gis', editablePermission: 'gis.edit' },
    children: [
      {
        path: '',
        name: 'GISHome',
        component: GISHome,
        meta: { module: 'gis' }
      },
      {
        path: 'explore',
        name: 'GISExplore',
        component: ModuleStubPage,
        props: { title: 'GIS — explore (stub)' },
        meta: { module: 'gis' }
      }
    ]
  },
  {
    path: '/ar',
    component: ModuleLayout,
    meta: { module: 'ar', editablePermission: 'ar.edit' },
    children: [
      {
        path: '',
        name: 'ARHome',
        component: ARHome,
        meta: { module: 'ar' }
      },
      {
        path: 'explore',
        name: 'ARExplore',
        component: ModuleStubPage,
        props: { title: 'AR — explore (stub)' },
        meta: { module: 'ar' }
      }
    ]
  },
  {
    path: '/manage',
    component: ManageLayout,
    meta: { requiresAuth: true, module: 'manage' },
    children: [
      {
        path: '',
        name: 'ManageDashboard',
        component: ManageDashboard,
        meta: { requiresAuth: true, module: 'manage' }
      },
      {
        path: 'users',
        name: 'ManageUsers',
        component: () => import('@/views/manage/UsersView.vue'),
        meta: { requiresAuth: true, module: 'manage', requiresPermission: 'user.view' }
      },
      {
        path: 'roles',
        name: 'ManageRoles',
        component: () => import('@/views/manage/RolesView.vue'),
        meta: { requiresAuth: true, module: 'manage', requiresPermission: 'role.view' }
      },
      {
        path: 'settings',
        name: 'ManageSettings',
        component: () => import('@/views/manage/SettingsView.vue'),
        meta: { requiresAuth: true, module: 'manage', requiresPermission: 'settings.view' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/hub'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 若目標（含祖先）任一需要登入，則整段視為需驗證
function routeRequiresAuth(to: { matched: { meta: Record<string, unknown> }[] }): boolean {
  return to.matched.some(record => record.meta.requiresAuth === true)
}

router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  if (routeRequiresAuth(to)) {
    try {
      await userStore.waitForAuthReady()
    } catch {
      // 逾時仍放行，由下方 isAuthenticated / 權限檢查決定
    }

    if (!userStore.isAuthenticated) {
      next({
        path: '/auth',
        query: { redirect: to.fullPath }
      })
      return
    }

    if (!userStore.isActive) {
      next('/about')
      return
    }

    if (to.meta.requiresPermission) {
      const hasAccess = hasPermission(
        userStore.currentUser,
        to.meta.requiresPermission as any
      )
      if (!hasAccess) {
        next('/manage')
        return
      }
    }
  }

  next()
})

export default router
