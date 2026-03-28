# 路由架構設計

## Prompt A：路由規劃與架構

### 路由結構樹狀圖

```
/ (前台)
├── / (首頁)
│   └── FrontLayout
│       ├── AppHeader (context: 'front')
│       └── <router-view> (HomeView)
│
├── /about (關於頁)
│   └── FrontLayout
│       ├── AppHeader (context: 'front')
│       └── <router-view> (AboutView)
│
└── /auth (登入頁，未登入時導向)
    └── AuthView (無 Layout)

/manage (後台)
├── /manage (後台首頁)
│   └── ManageLayout
│       ├── AppHeader (context: 'manage')
│       ├── ManageSidebar
│       └── <router-view> (ManageDashboard)
│
└── /manage/* (其他後台頁面)
    └── ManageLayout
        ├── AppHeader (context: 'manage')
        ├── ManageSidebar
        └── <router-view> (其他後台頁面)
```

### 登入狀態流程

```
未登入狀態
├── 訪問前台 (/)
│   └── ✅ 允許，顯示「Google 登入」按鈕
│
├── 訪問後台 (/manage)
│   └── ❌ 攔截 → 導向 /auth 或 /
│
└── 點擊「Google 登入」
    └── 呼叫 Firebase Auth
        └── 成功 → 更新 user store → 導向原目標或首頁

已登入狀態
├── 訪問前台 (/)
│   └── ✅ 允許，Header 顯示頭像 + dropdown
│       └── dropdown: 「進入後台」、「登出」
│
├── 訪問後台 (/manage)
│   └── ✅ 允許，Header 顯示頭像 + dropdown
│       └── dropdown: 「回到前台」、「登出」
│
├── 點擊「進入後台」
│   └── router.push('/manage')
│
├── 點擊「回到前台」
│   └── router.push('/')
│
└── 點擊「登出」
    └── 呼叫登出 API
        └── 清除 user store
        └── 導向首頁 (/)
```

### Layout 元件拆分

```
FrontLayout (前台 Layout)
├── AppHeader (共用，context='front')
└── <main>
    └── <router-view>

ManageLayout (後台 Layout)
├── AppHeader (共用，context='manage')
├── <div class="flex">
│   ├── ManageSidebar (可縮合)
│   └── <main>
│       └── <router-view>
```

### Header 與 UserMenu 共用策略

**單一元件原則**：
- `AppHeader.vue`：前台和後台共用
- `UserMenu.vue`：前台和後台共用
- 透過 `context` prop 控制顯示內容：
  - `context='front'` → 顯示「進入後台」
  - `context='manage'` → 顯示「回到前台」

### 事件/狀態流

```
登入流程：
User 點擊「Google 登入」
  ↓
呼叫 authService.signInWithGoogle()
  ↓
Firebase Auth 處理
  ↓
成功 → 更新 userStore.setUser(user)
  ↓
router.push(原目標或 '/')

登出流程：
User 點擊「登出」
  ↓
呼叫 authService.signOut()
  ↓
清除 userStore.clearUser()
  ↓
router.push('/')

切換前後台：
前台 → 後台：router.push('/manage')
後台 → 前台：router.push('/')
```

### Auth Guard 設計

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    component: FrontLayout,
    children: [
      { path: '', component: HomeView },
      { path: 'about', component: AboutView }
    ]
  },
  {
    path: '/auth',
    component: AuthView
  },
  {
    path: '/manage',
    component: ManageLayout,
    meta: { requiresAuth: true }, // 需要登入
    children: [
      { path: '', component: ManageDashboard },
      // 其他後台路由
    ]
  }
]

// Guard 邏輯
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/auth') // 或 next('/')
  } else {
    next()
  }
})
```

---

## 補充：平台入口（Hub）與模組路由（2026-03）

以下為在「Prompt A」原始設計之上**新增**的行為，舊章節仍保留作歷史參考。

### 路由樹（摘要）

- **`/`** → 重新導向 **`/hub`**
- **`/hub`**：`FrontLayout` + `HubView`，**公開**（未登入可瀏覽）；`meta.module: 'platform'`
- **`/about`**：公開；`FrontLayout` + `AboutView`
- **`/notes/*`、`/gis/*`、`/ar/*`**：**公開**；`ModuleLayout`（`AppHeader` `context: 'module'` + `ManageSidebar` 依 `meta.module` 顯示假選單）+ 子路由佔位頁；父路由設 **`meta.editablePermission`**（`notes.edit`／`gis.edit`／`ar.edit`），供 `usePageAccess` 與 `hasPermission` 決定是否可編輯（子路徑繼承）
- **`/manage/*`**：維持 `ManageLayout` + Firestore 選單；`meta.module: 'manage'`；**需登入**與 `requiresPermission`
- **未知路徑** → **`/hub`**

### Auth Guard 調整

- 若 **`to.matched` 中任一筆** `meta.requiresAuth === true`，則整段視為需驗證（巢狀子路由一併受保護）。**`/hub` 與模組前綴不設 `requiresAuth`，未登入不會被導向 `/auth`。**
- 帳號 **`status === disabled`**：進入**需認證**路由時導向 **`/about`**（避免 `/` → `/hub` 與需登入衝突）。

### UserMenu 與預設導向

- 登入成功預設導向 **`/hub`**（含 `AuthView`、Header 內快速登入）。
- **`context: 'manage'`**：選單為「回到系統入口」→ `/hub`（取代舊文檔中的「回到前台」`router.push('/')` 描述）。

### 權限與編輯模式

- 路由可設 **`meta.module`**、**`meta.editablePermission`**（型別見 `frontend/src/router/meta.d.ts`）。模組前綴**不以** `requiresPermission` 擋瀏覽；**編輯型 UI** 由 **`usePageAccess()`**（`canEdit`／`mode`）依登入狀態與 **`hasPermission`** 判定。
- 後台 **`/manage/*`** 仍依 **`requiresPermission`** 與既有 Guard 行為。

