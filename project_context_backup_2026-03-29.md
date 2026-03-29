# 專案脈絡（Project Context）

> 供架構師／另一 AI 快速掌握現況。技術細節與歷史決策見 `docs/` 內文件。

## 1. 技術棧摘要

| 層級 | 技術 |
|------|------|
| 前端 | Vue 3、Vite、TypeScript、Tailwind CSS、Vue Router、Pinia、vue-i18n |
| 後端／BaaS | Firebase Auth（Google）、Firestore、Storage（SDK 已封裝，UI 未使用） |
| 容器 | Docker Compose（根目錄 `docker-compose.dev.yml` / `docker-compose.prod.yml`）、Nginx |
| 測試 | Vitest、Vue Test Utils、Playwright（依 `README.md` 指令；本檔不展開覆蓋率） |

## 2. 專案結構（精簡）

```
專案根目錄/
├── docs/                    # 架構、設定、RBAC 規格等說明
├── frontend/                # 主要應用（Vue SPA）
│   ├── src/
│   │   ├── api/             # 統一 API 抽象 + Firebase 實作
│   │   │   ├── client.ts    # REST 風格 Facade → Firestore
│   │   │   ├── auth.ts      # authAPI
│   │   │   ├── users.ts     # usersAPI
│   │   │   ├── menus.ts     # 選單樹 + 權限 slug 解析
│   │   │   ├── firebase/    # config、auth、firestore、users、rbac、rbacSeed、storage
│   │   │   └── adapters/django.ts  # HTTP 客戶端範例，未接線
│   │   ├── components/      # AppHeader、UserMenu、ManageSidebar、LanguageSwitcher、ModuleAccessBanner
│   │   ├── composables/   # usePageAccess（瀏覽／編輯模式）、useApi 等
│   │   ├── layouts/         # FrontLayout、ManageLayout、ModuleLayout（模組殼層）
│   │   ├── views/           # HubView、modules/*（Notes/GIS/AR 骨架）、manage/*
│   │   ├── router/          # index.ts（路由 + Guard）、meta.d.ts（module、editablePermission 等）
│   │   ├── stores/          # user、permission（RBAC）
│   │   ├── utils/permissions.ts、utils/access.ts（路由 meta 讀取）
│   │   ├── types/           # user、rbac、module（Hub 卡片／模組假選單，非後端 API）
│   │   ├── styles/          # theme.css（CSS 變數 token）、main.css（Tailwind + 共用元件類別）
│   │   └── i18n/            # 多語系
│   └── tests/               # unit / component / e2e
├── scripts/                 # 例如 set-admin-claim.js（Admin Custom Claim）
├── firestore.rules          # Firestore 安全規則
└── project_context.md       # 本檔
```

**架構調整（前端樣式）**：視覺色碼改為**單一來源**（`styles/theme.css` 的 CSS 變數）＋ **Tailwind `theme.extend.colors`** 語意對應；重複的按鈕／卡片樣式收斂至 `main.css` 的 `@layer components`。未新增套件；**未改路由、Pinia、API 層目錄職責**。

## 3. 已完成功能

- **認證**：Google 登入／登出；Auth 狀態監聽；登入後同步／建立 Firestore `users` 文件、更新最後登入、同步 Auth 顯示名稱與頭像。
- **路由**：`/` 重新導向 **`/hub`**；**`/hub`、`/notes/*`、`/gis/*`、`/ar/*` 不需登入即可進入**（公開瀏覽）；`/about`、`/auth` 維持公開或獨立頁；**`/manage/*` 仍須登入**並沿用 `requiresPermission`；未知路徑導向 **`/hub`**。
- **平台／模組架構（UI 骨架）**：`HubView` 模組卡片；`ModuleLayout` 與 **`ManageSidebar` 的 `module` prop**（`manage` → Firestore 選單；`notes`／`gis`／`ar` → 假選單）；路由 **`meta.module`**；**`meta.editablePermission`**（如 `notes.edit`）搭配 `usePageAccess`／`hasPermission` 決定模組內是否可編輯（子路由繼承父層 meta）。
- **頁面存取模式**：`usePageAccess()` 提供 `isLoggedIn`、`canEdit`、`mode`（`view` | `edit`）；`ModuleAccessBanner` 於不可編輯時顯示簡短提示；模組首頁含示意按鈕（disabled／`console.log` 骨架，無實際業務）。
- **後台進入控制**：`matched` 鏈上任一 **`requiresAuth`** 即驗證（巢狀子路由一併保護）；未登入導向 `/auth?redirect=`；`waitForAuthReady()` 避免 production 直連時誤判權限。
- **帳號狀態**：`status === disabled` 時無法進入需認證區域（導向 **`/about`**，避免與 `/`→`/hub` 循環）。
- **RBAC（資料驅動）**：Firestore 集合 `permission_groups`、`permissions`、`roles`、`role_permissions`、`menus`；前端 `permission` store（含 localStorage 快取、SuperAdmin `*`）、`hasPermission` 等 helper。**種子**另含 **`pg_modules`（App Modules）** 與 **`notes`／`gis`／`ar`** 的 `*.view`／`*.edit`；預設 **admin** 擁有上述模組權限、**editor** 擁有三個 `*.edit`、**viewer** 無模組 edit（僅能瀏覽模組公開頁）。**既有環境須重新執行 `seedRbac()`（或至少權限＋角色綁定步驟）** 才會寫入新權限。
- **路由級權限**：例如 `user.view`、`role.view`、`settings.view` 對應 `/manage/users`、`/manage/roles`、`/manage/settings`。
- **後台側欄**：自 Firestore `menus` 組樹，依權限 slug 過濾可見項目。
- **使用者管理頁**：列表、搜尋、依角色／狀態篩選；具權限者可變更角色（`roleId`／legacy `role`）、啟用／停用（實作細節見 `UsersView.vue` + `usersAPI`）。
- **角色管理頁**：角色 CRUD（受 `role.edit` 等權限控制）、關聯權限數量顯示；保護 `super_admin` 不可刪除。
- **國際化**：語言切換元件 + 文案檔（含 `hub.*`、`module.*`、`menu.appHub`／`backToHub`）。
- **UI 主題（可替換視覺）**：全站配色集中於 `frontend/src/styles/theme.css` 的 CSS 變數（語意 token，如 `--color-bg-page`、`--color-primary` 等）；`tailwind.config.js` 以語意色名對應同一組變數；共用類別 `btn-primary`、`ui-card`、`header-icon-btn` 定義於 `styles/main.css`。換主視覺時優先改 token，避免在元件內散落 hex。細節見 **`docs/THEME_TOKENS.md`**。
- **Firestore 規則**：使用者文件讀寫、RBAC 集合讀寫、Admin 需符合規則與 Custom Claim（見 `firestore.rules` 與 `docs/`／`frontend/src/RBAC_README.md`）。

## 4. 未完成功能／明顯缺口

| 項目 | 說明 |
|------|------|
| **系統設定頁** | `SettingsView.vue` 僅佔位文案，註解「待實作」。 |
| **後台儀表板** | `DashboardView.vue` 統計為寫死 `0`，未接真實資料或分析。 |
| **首頁／關於** | `HomeView` 已不掛路由（保留檔案）；`AboutView` 仍為極簡示範；**`/hub`** 為系統入口（**可未登入瀏覽**）但僅模組卡片骨架。 |
| **檔案上傳** | `api/firebase/storage.ts` 已封裝，目前無業務頁面使用。 |
| **後端切換** | `adapters/django.ts` 為範例；`client.ts` 仍綁定 Firestore。 |
| **Firebase Cloud Functions** | 專案內無 `functions/` 目錄；需後端流程時須另建或外部服務。 |
| **測試與 CI** | 測試腳本存在與否請以 `frontend/package.json` 為準；本脈絡未盤點通過率。 |

## 5. API 層說明

設計原則：**元件與 store 優先呼叫語意化 API**（`authAPI`、`usersAPI`），**通用 CRUD** 可走 `api`（`client.ts`）對應 Firestore 路徑。

**API 變更狀態（對照上一版脈絡）**：導入 UI 主題 token 後，**`api/`、`authAPI`、`usersAPI`、RBAC／menus 相關模組之公開介面與行為均未變**；僅前端樣式與 Tailwind 語意色對應調整。

**近期調整摘要**：`authAPI`／`usersAPI`／`menus.ts`／`rbac.ts` **CRUD 行為未改**；**`rbacSeed.ts`** 擴充模組權限與角色綁定（見 §3）。前端新增 **`usePageAccess`、`utils/access`、`ModuleAccessBanner`**；路由 **`meta.editablePermission`**；`/hub` 與模組前綴改為**公開進入**，側欄仍依 **`module`** 切換 Firestore 選單 vs. 假選單。

### 5.1 `authAPI`（`src/api/auth.ts`）

- `signInWithGoogle()`、`signOut()`、`getCurrentUser()`、`onAuthStateChange(callback)`

### 5.2 `usersAPI`（`src/api/users.ts` → `firebase/users.ts`）

- `list(params?)`、`get(uid)`、`createOrUpdate(...)`、`updateRole`（slug）、`updateRoleId`、`updateStatus`、`updateLastLogin`、`syncProfile`
- 資料模型：`UserDocument`（含 `roleId`、`role`、`status`、`permissions` 等，見 `src/types/user.ts`）

### 5.3 統一 `api`（`src/api/client.ts`）

- `get` / `post` / `put` / `patch` / `delete`、`setBasePath`
- 實作：`firebase/firestore.ts` 的集合／文件語意

### 5.4 RBAC 與選單（`src/api/firebase/rbac.ts`、`src/api/menus.ts`）

- 讀寫／列表：permission groups、permissions、roles、role_permissions、menus（寫入多為管理介面與 seed）
- `getMenusWithPermissionSlugs()`、`buildMenuTree()` 供 **`ManageSidebar` 在 `module === 'manage'`** 時使用（模組模式不呼叫）
- **`rbacSeed.ts`**：`RBAC_MODULES` 含 `notes`、`gis`、`ar`；`seedPermissionGroupsAndPermissions()` 建立 **`pg_modules`** 與六筆模組權限；`seedRolePermissions()` 為 admin／editor 綁定對應 slug（見 §3）

### 5.5 其他

- **`storageService`**：上傳／URL／刪除，**目前無呼叫端**。
- **`rbacSeed`**：種子資料相關（部署與權限見 `docs` 與 `frontend/src/RBAC_README.md`）；**擴充模組權限後若資料庫已存在舊種子，須再執行同步**。

### 5.6 頁面存取 helper（非 HTTP API）

- **`utils/access.ts`**：`getDeepestRouteMetaValue(matched, key)`，供 `usePageAccess` 解析 **`editablePermission`**
- **`composables/usePageAccess.ts`**：組合 `user` store、`hasPermission`、路由 meta，產出 `canEdit`／`mode` 等（與 `utils/permissions.ts` 搭配，非新增遠端端點）

## 6. 頁面與路由

**新增路由／頁面**：無（與先前一致）。各既有頁面之 **Layout、Header、Sidebar、卡片與主按鈕** 已改採主題 token／語意 class，路由表與功能流程不變。

| 路徑 | 名稱（約） | 說明 |
|------|------------|------|
| `/` | — | 重新導向 **`/hub`** |
| `/hub` | Hub | 系統入口卡片（Notes／GIS／AR）；**公開**；`meta.module: platform` |
| `/about` | About | 關於頁，示範文案（公開） |
| `/auth` | Auth | Google 登入；可帶 `redirect`；預設登入成功導向 **`/hub`** |
| `/notes`、`/notes/explore` | Notes* | **公開**；`ModuleLayout`；`meta.module: notes`；父路由 **`editablePermission: notes.edit`**（子路徑繼承） |
| `/gis`、`/gis/explore` | GIS* | **公開**；`meta.module: gis`；**`editablePermission: gis.edit`** |
| `/ar`、`/ar/explore` | AR* | **公開**；`meta.module: ar`；**`editablePermission: ar.edit`** |
| `/manage` | ManageDashboard | 後台儀表板（佔位數據）；`meta.module: manage` |
| `/manage/users` | ManageUsers | 使用者管理；需 `user.view` |
| `/manage/roles` | ManageRoles | 角色與權限關聯管理；需 `role.view` |
| `/manage/settings` | ManageSettings | 設定頁路由已掛；需 `settings.view`；**UI 未實作** |
| `/*` | — | 導向 **`/hub`** |

版面：`/hub` 與 `/about` 使用 `FrontLayout`；`/notes|gis|ar/*` 使用 **`ModuleLayout`**（`AppHeader` `context: module` + `ManageSidebar`）；`/manage/*` 使用 `ManageLayout`。

## 7. 關鍵元件與狀態

| 名稱 | 路徑 | 職責 |
|------|------|------|
| **FrontLayout** | `layouts/FrontLayout.vue` | 前台頂欄 + `router-view`（Hub、About） |
| **ManageLayout** | `layouts/ManageLayout.vue` | 後台頂欄 + `ManageSidebar module="manage"` + 主內容區 |
| **ModuleLayout** | `layouts/ModuleLayout.vue` | 模組殼層：頂欄 + `ManageSidebar`（依路由 `meta.module`）+ 主內容 |
| **AppHeader** | `components/AppHeader.vue` | 固定頂欄；`context`: `front` \| `manage` \| **`module`** |
| **UserMenu** | `components/UserMenu.vue` | 登入／頭像選單；**後台「回到系統入口」→ `/hub`**；模組內可進 Hub／後台 |
| **ManageSidebar** | `components/ManageSidebar.vue` | **`module` prop**：`manage` → Firestore 選單 + 權限過濾；`notes`／`gis`／`ar` → 假選單；可收合 |
| **LanguageSwitcher** | `components/LanguageSwitcher.vue` | i18n 切換 |
| **useUserStore** | `stores/user.ts` | Auth 使用者、Firestore profile、`init`、`waitForAuthReady` |
| **usePermissionStore** | `stores/permission.ts` | 權限 slug 載入／快取、`can` / `canAny` / `canAll` |
| **hasPermission** 等 | `utils/permissions.ts` | 與 router **`requiresPermission`**（後台）及 **`usePageAccess` + `editablePermission`**（模組編輯）搭配 |
| **usePageAccess** | `composables/usePageAccess.ts` | `isLoggedIn`、`canEdit`、`mode`；讀取路由 **`editablePermission`** |
| **ModuleAccessBanner** | `components/ModuleAccessBanner.vue` | 不可編輯時顯示瀏覽模式提示（訪客／無權） |
| **getDeepestRouteMetaValue** | `utils/access.ts` | 由 `matched` 最深層向上解析 meta 欄位 |

## 8. Firestore 資料模型（與權限相關）

- **`users/{uid}`**：使用者設定檔；與 Firebase Auth UID 對齊。
- **`roles`、`permissions`、`permission_groups`、`role_permissions`、`menus`**：RBAC 與後台選單來源。

安全規則摘要：一般使用者可讀寫自身 `users` 文件但不可改 `role`／`status`／`roleId`（建立時限制為 viewer/active）；讀取其他使用者文件依 **Custom Claim `role`**（`admin`／`super_admin`）；RBAC 集合寫入多為 admin／super_admin。細節以 `firestore.rules` 為準。

## 9. 維運腳本

- **`scripts/set-admin-claim.js`**：為帳號設定 Firebase Custom Claim（配合規則與「讀取其他使用者」場景）；執行方式與前置條件見腳本內註解與 `frontend/src/RBAC_README.md`。

## 10. 延伸閱讀（repo 內）

- `README.md`：啟動與環境變數
- `docs/README.md`：文件索引
- `docs/THEME_TOKENS.md`：全站 CSS 變數與 Tailwind 語意色對照、擴充多主題方式
- `docs/RBAC_SYSTEM_SPECIFICATION.md`、`docs/ARCHITECTURE.md`、`docs/ROUTING_ARCHITECTURE.md`

---

*本檔依目前程式庫狀態整理；若實作變更，請同步更新此脈絡檔。*
