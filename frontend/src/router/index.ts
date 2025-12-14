import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

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
      // 其他後台路由可以在這裡添加
      // {
      //   path: 'users',
      //   name: 'ManageUsers',
      //   component: () => import('@/views/manage/UsersView.vue')
      // }
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

// Auth Guard
router.beforeEach((to: any, _from: any, next: any) => {
  const userStore = useUserStore()

  // 檢查是否需要登入
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    // 儲存原本要前往的路徑，登入後可以導向
    next({
      path: '/auth',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
})

export default router
