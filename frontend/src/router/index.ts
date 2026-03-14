import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/utils/permissions'

// Layouts
import FrontLayout from '@/layouts/FrontLayout.vue'
import ManageLayout from '@/layouts/ManageLayout.vue'

// Views
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import AuthView from '@/views/AuthView.vue'
import ManageDashboard from '@/views/manage/DashboardView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: FrontLayout,
    children: [
      {
        path: '',
        name: 'Home',
        component: HomeView
      },
      {
        path: 'about',
        name: 'About',
        component: AboutView
      }
    ]
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView
  },
  {
    path: '/manage',
    component: ManageLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'ManageDashboard',
        component: ManageDashboard
      },
      {
        path: 'users',
        name: 'ManageUsers',
        component: () => import('@/views/manage/UsersView.vue'),
        meta: { requiresAuth: true, requiresPermission: 'canManageUsers' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Auth Guard（async：需等待 Firebase Auth + Firestore profile 就緒後再檢查權限）
router.beforeEach(async (to: any, _from: any, next: any) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth) {
    // 先等待 auth 與 Firestore profile 載入完成，避免 production 直連 /manage/users 時
    // currentUser 尚未載入而被誤判為無權限並靜默導向 /manage
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
      next('/')
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
