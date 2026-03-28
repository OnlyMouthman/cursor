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
│   └── ManageSidebar.vue   # 後台專用 Sidebar
│
├── layouts/                 # Layout 元件
│   ├── FrontLayout.vue     # 前台 Layout（含 Header）
│   └── ManageLayout.vue    # 後台 Layout（含 Header + Sidebar）
│
├── router/                  # 路由配置
│   └── index.ts            # 路由定義 + Auth Guard
│
├── stores/                  # Pinia 狀態管理
│   ├── index.ts            # Pinia 實例
│   └── user.ts             # 使用者狀態（登入狀態）
│
├── views/                   # 頁面元件
│   ├── HomeView.vue        # 前台首頁
│   ├── AboutView.vue       # 前台關於頁
│   ├── AuthView.vue        # 登入頁
│   └── manage/             # 後台頁面
│       └── DashboardView.vue  # 後台儀表板
│
├── i18n/                    # 國際化
├── styles/                  # 全域樣式
├── types/                   # TypeScript 型別
├── utils/                   # 工具函數
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
- 包含 `ManageSidebar`（可縮合）
- 使用 flex 佈局：左側 Sidebar + 右側主內容

#### Components

**AppHeader.vue**
- 前台和後台共用的 Header
- 固定高度（56px / h-14）
- 透過 `context` prop 控制顯示內容
- 包含 Logo 和 `UserMenu`

**UserMenu.vue**
- 前台和後台共用的使用者選單
- 未登入：顯示「Google 登入」按鈕
- 已登入：顯示頭像 + dropdown
- 透過 `context` prop 控制 dropdown 內容：
  - `context='front'` → 「進入後台」、「登出」
  - `context='manage'` → 「回到前台」、「登出」
- 點擊外部自動關閉 dropdown

**ManageSidebar.vue**
- 後台專用的側邊欄
- 可縮合（collapse/expand）
- 縮合時只顯示 icon，展開顯示 icon + 文字
- 高度滿版（扣掉 Header）
- 使用 local state 管理縮合狀態

#### Router

**router/index.ts**
- 定義所有路由
- 實作 Auth Guard：
  - 檢查 `meta.requiresAuth`
  - 未登入訪問後台 → 導向 `/auth`
  - 儲存 `redirect` query 參數

#### Stores

**stores/user.ts**
- 管理使用者登入狀態
- 使用 Pinia Composition API
- 提供 `isAuthenticated`、`displayName`、`email`、`photoURL` 等 computed
- 提供 `setUser`、`clearUser` 方法

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

