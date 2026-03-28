# 專案目錄結構說明

## Prompt B：元件與目錄結構

### 推薦的專案目錄樹（src 內）

```
src/
├── api/                    # API 抽象層
│   ├── auth.ts             # 認證 API（不直接使用 Firebase）
│   ├── client.ts           # 統一 API 客戶端
│   └── firebase/           # Firebase 實作
│       ├── auth.ts         # Firebase Auth 封裝
│       └── config.ts       # Firebase 配置
│
├── components/              # 共用元件
│   ├── AppHeader.vue       # 共用 Header（前台/後台）
│   ├── UserMenu.vue        # 共用使用者選單（前台/後台）
│   ├── ManageSidebar.vue   # 後台／模組 Sidebar
│   └── ModuleAccessBanner.vue  # 模組頁瀏覽模式提示（搭配 usePageAccess）
│
├── layouts/                 # Layout 元件
│   ├── FrontLayout.vue     # 前台 Layout（含 Header；Hub、About）
│   ├── ManageLayout.vue    # 後台 Layout（含 Header + Sidebar）
│   └── ModuleLayout.vue    # 模組殼層（Notes/GIS/AR；Header + Sidebar + 內容）
│
├── router/                  # 路由配置
│   ├── index.ts            # 路由定義 + Auth Guard
│   └── meta.d.ts           # 擴充 vue-router RouteMeta（module、editablePermission 等）
│
├── stores/                  # Pinia 狀態管理
│   ├── index.ts            # Pinia 實例
│   └── user.ts             # 使用者狀態（登入狀態）
│
├── composables/             # usePageAccess（瀏覽／編輯模式）等
├── views/                   # 頁面元件
│   ├── HubView.vue         # 系統入口（模組卡片；公開可瀏覽）
│   ├── HomeView.vue        # 保留檔案（目前未掛路由）
│   ├── AboutView.vue       # 關於頁
│   ├── AuthView.vue        # 登入頁
│   ├── modules/            # 模組骨架（Notes / GIS / AR）
│   │   ├── ModuleStubPage.vue
│   │   ├── notes/NotesHome.vue
│   │   ├── gis/GISHome.vue
│   │   └── ar/ARHome.vue
│   └── manage/             # 後台頁面
│       └── DashboardView.vue  # 後台儀表板
│
├── i18n/                    # 國際化
├── styles/                  # 全域樣式：`theme.css`（`:root` 語意 token）、`main.css`（Tailwind + `btn-primary`／`ui-card` 等）
├── types/                   # TypeScript 型別（含 module.ts：Hub 卡片／模組假選單）
├── utils/                   # 工具函數（含 permissions.ts、access.ts）
├── App.vue                  # 根元件
└── main.ts                  # 應用入口
```

### 檔案責任說明

#### Layouts

**FrontLayout.vue**
- 前台頁面的統一 Layout
- 包含 `AppHeader`（context='front'）
- 主內容區域使用 `<router-view>`

**ManageLayout.vue**
- 後台頁面的統一 Layout
- 包含 `AppHeader`（context='manage'）
- 包含 `ManageSidebar`（**`module="manage"`**，Firestore 選單 + 權限過濾；可縮合）
- 使用 flex 佈局：左側 Sidebar + 右側主內容

**ModuleLayout.vue**
- 模組頁（Notes / GIS / AR）共用殼層
- 包含 `AppHeader`（context='module'）
- 包含 `ManageSidebar`（依路由 `meta.module` 顯示**假選單**，不呼叫 Firestore menus）

#### Components

**AppHeader.vue**
- 前台、後台、模組共用的 Header
- 固定高度（56px / h-14）
- 透過 `context` prop 控制顯示內容：`front` | `manage` | `module`
- 包含 Logo 和 `UserMenu`

**UserMenu.vue**
- 前台、後台、模組共用的使用者選單
- 未登入：顯示「Google 登入」按鈕
- 已登入：顯示頭像 + dropdown
- 透過 `context` prop 控制 dropdown 內容：
  - `context='front'` → 「進入後台」、「登出」
  - `context='manage'` → 「回到系統入口」（`/hub`）、「登出」
  - `context='module'` → 「系統入口」、「進入後台」、「登出」
- 點擊外部自動關閉 dropdown

**ManageSidebar.vue**
- 側邊欄；**`module` prop**：`manage` | `notes` | `gis` | `ar`（預設 `manage`）
- `manage`：Firestore `menus` 組樹 + 權限過濾（與舊行為相同）
- `notes` / `gis` / `ar`：顯示假選單（`types/module.ts`），供模組 UI 擴展
- 可縮合（collapse/expand）；高度滿版（扣掉 Header）

#### Router

**router/index.ts**
- 定義所有路由（含 `/hub`、模組前綴、`/` 與萬用路徑導向 hub）
- 實作 Auth Guard：
  - **`matched` 鏈上任一** `requiresAuth` 即驗證（**`/hub`、模組前綴不設 requiresAuth**）
  - 未登入 → 導向 `/auth` 並帶 `redirect`（僅需認證路由）
  - 停用帳號 → 導向 `/about`
- 模組父路由可設 **`meta.editablePermission`**，與 `usePageAccess` 搭配控制編輯 UI

#### Stores

**stores/user.ts**
- 管理使用者登入狀態
- 使用 Pinia Composition API
- 提供 `isAuthenticated`、`displayName`、`email`、`photoURL` 等 computed
- 提供 `setUser`、`clearUser` 方法

#### Styles（主題與全域樣式）

- **`styles/theme.css`**：全站視覺的單一來源，以 `--color-*` CSS 變數定義背景、文字、邊框、主色、Header、Sidebar、卡片等；日後多主題可另以 `[data-theme]` 覆寫。
- **`styles/main.css`**：匯入 theme、Tailwind 三層、`body` 預設底色與字色；`@layer components` 提供 `btn-primary`、`ui-card`、`header-icon-btn`。
- **`tailwind.config.js`**：`theme.extend.colors` 將語意 class（如 `bg-page`、`text-ink-strong`）對應到 `var(--color-…)`。詳見 **`docs/THEME_TOKENS.md`**。

#### API

**api/auth.ts**
- 認證相關的 API 封裝
- 不直接使用 Firebase SDK
- 透過 `authService` 呼叫 Firebase
- 提供 `signInWithGoogle`、`signOut` 等方法

**api/firebase/auth.ts**
- Firebase Auth 的具體實作
- 封裝 Firebase SDK
- 提供 `signInWithGoogle`、`signOut` 等方法

### 共用策略

1. **Header 共用**：
   - `AppHeader` 元件在前台和後台都使用
   - 透過 `context` prop 區分顯示內容

2. **UserMenu 共用**：
   - `UserMenu` 元件在前台和後台都使用
   - 透過 `context` prop 控制 dropdown 選項

3. **狀態管理**：
   - 使用 Pinia `user` store 管理登入狀態
   - 元件不直接呼叫 Firebase，透過 `authAPI`

4. **路由保護**：
   - 使用 `router.beforeEach` guard
   - 檢查 `meta.requiresAuth` 和 `userStore.isAuthenticated`

