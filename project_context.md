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
│   │   ├── components/      # AppHeader、UserMenu、ManageSidebar、LanguageSwitcher
│   │   ├── layouts/         # FrontLayout、ManageLayout、ModuleLayout（模組殼層）
│   │   ├── views/           # HubView、modules/*（Notes/GIS/AR 骨架）、manage/*
│   │   ├── router/          # index.ts（路由 + Guard）、meta.d.ts（RouteMeta 擴充）
│   │   ├── stores/          # user、permission（RBAC）
│   │   ├── utils/permissions.ts
│   │   ├── types/           # user、rbac、module（Hub 卡片／模組假選單，非後端 API）
│   │   └── i18n/            # 多語系
│   └── tests/               # unit / component / e2e
├── scripts/                 # 例如 set-admin-claim.js（Admin Custom Claim）
├── firestore.rules          # Firestore 安全規則
└── project_context.md       # 本檔
```

## 3. 已完成功能

- **認證**：Google 登入／登出；Auth 狀態監聽；登入後同步／建立 Firestore `users` 文件、更新最後登入、同步 Auth 顯示名稱與頭像。
- **路由**：`/` 重新導向 **`/hub`**（登入後系統入口，卡片選模組）；`/about` 仍為公開頁；**`/notes/*`、`/gis/*`、`/ar/*`** 為模組骨架（`ModuleLayout` + 佔位頁）；`/manage/*` 為後台；`/auth` 獨立；未知路徑導向 **`/hub`**。
- **平台／模組架構（UI 骨架）**：`HubView` 模組卡片；`ModuleLayout` 與 **`ManageSidebar` 的 `module` prop**（`manage` → Firestore 選單；`notes`／`gis`／`ar` → 假選單）；路由 **`meta.module`** 預留未來 RBAC（`platform` | `manage` | `notes` | `gis` | `ar`）。
- **後台進入控制**：`matched` 鏈上任一 **`requiresAuth`** 即驗證（巢狀子路由一併保護）；未登入導向 `/auth?redirect=`；`waitForAuthReady()` 避免 production 直連時誤判權限。
- **帳號狀態**：`status === disabled` 時無法進入需認證區域（導向 **`/about`**，避免與 `/`→`/hub` 循環）。
- **RBAC（資料驅動）**：Firestore 集合 `permission_groups`、`permissions`、`roles`、`role_permissions`、`menus`；前端 `permission` store（含 localStorage 快取、SuperAdmin `*`）、`hasPermission` 等 helper。
- **路由級權限**：例如 `user.view`、`role.view`、`settings.view` 對應 `/manage/users`、`/manage/roles`、`/manage/settings`。
- **後台側欄**：自 Firestore `menus` 組樹，依權限 slug 過濾可見項目。
- **使用者管理頁**：列表、搜尋、依角色／狀態篩選；具權限者可變更角色（`roleId`／legacy `role`）、啟用／停用（實作細節見 `UsersView.vue` + `usersAPI`）。
- **角色管理頁**：角色 CRUD（受 `role.edit` 等權限控制）、關聯權限數量顯示；保護 `super_admin` 不可刪除。
- **國際化**：語言切換元件 + 文案檔（含 `hub.*`、`module.*`、`menu.appHub`／`backToHub`）。
- **Firestore 規則**：使用者文件讀寫、RBAC 集合讀寫、Admin 需符合規則與 Custom Claim（見 `firestore.rules` 與 `docs/`／`frontend/src/RBAC_README.md`）。

## 4. 未完成功能／明顯缺口

| 項目 | 說明 |
|------|------|
| **系統設定頁** | `SettingsView.vue` 僅佔位文案，註解「待實作」。 |
| **後台儀表板** | `DashboardView.vue` 統計為寫死 `0`，未接真實資料或分析。 |
| **首頁／關於** | `HomeView` 已不掛路由（保留檔案）；`AboutView` 仍為極簡示範；**`/hub`** 為登入後入口但僅模組卡片骨架。 |
| **檔案上傳** | `api/firebase/storage.ts` 已封裝，目前無業務頁面使用。 |
| **後端切換** | `adapters/django.ts` 為範例；`client.ts` 仍綁定 Firestore。 |
| **Firebase Cloud Functions** | 專案內無 `functions/` 目錄；需後端流程時須另建或外部服務。 |
| **測試與 CI** | 測試腳本存在與否請以 `frontend/package.json` 為準；本脈絡未盤點通過率。 |

## 5. API 層說明

設計原則：**元件與 store 優先呼叫語意化 API**（`authAPI`、`usersAPI`），**通用 CRUD** 可走 `api`（`client.ts`）對應 Firestore 路徑。

**本次架構升級**：Firebase／`authAPI`／`usersAPI`／`menus.ts`／`rbac` 等**後端存取行為未改**；僅前端路由與側欄依 **`module` 上下文**切換資料來源（Firestore 選單 vs. `types/module.ts` 假選單）。

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

### 5.5 其他

- **`storageService`**：上傳／URL／刪除，**目前無呼叫端**。
- **`rbacSeed`**：種子資料相關（部署與權限見 `docs` 與 RBAC README）。

## 6. 頁面與路由

| 路徑 | 名稱（約） | 說明 |
|------|------------|------|
| `/` | — | 重新導向 **`/hub`** |
| `/hub` | Hub | 系統入口卡片（Notes／GIS／AR）；**需登入**；`meta.module: platform` |
| `/about` | About | 關於頁，示範文案（公開） |
| `/auth` | Auth | Google 登入；可帶 `redirect`；預設登入成功導向 **`/hub`** |
| `/notes`、`/notes/explore` | Notes* | 模組骨架；`ModuleLayout`；`meta.module: notes` |
| `/gis`、`/gis/explore` | GIS* | 同上；`meta.module: gis` |
| `/ar`、`/ar/explore` | AR* | 同上；`meta.module: ar` |
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
| **hasPermission** 等 | `utils/permissions.ts` | 與 router meta `requiresPermission` 搭配 |

## 8. Firestore 資料模型（與權限相關）

- **`users/{uid}`**：使用者設定檔；與 Firebase Auth UID 對齊。
- **`roles`、`permissions`、`permission_groups`、`role_permissions`、`menus`**：RBAC 與後台選單來源。

安全規則摘要：一般使用者可讀寫自身 `users` 文件但不可改 `role`／`status`／`roleId`（建立時限制為 viewer/active）；讀取其他使用者文件依 **Custom Claim `role`**（`admin`／`super_admin`）；RBAC 集合寫入多為 admin／super_admin。細節以 `firestore.rules` 為準。

## 9. 維運腳本

- **`scripts/set-admin-claim.js`**：為帳號設定 Firebase Custom Claim（配合規則與「讀取其他使用者」場景）；執行方式與前置條件見腳本內註解與 `frontend/src/RBAC_README.md`。

## 10. 延伸閱讀（repo 內）

- `README.md`：啟動與環境變數
- `docs/README.md`：文件索引
- `docs/RBAC_SYSTEM_SPECIFICATION.md`、`docs/ARCHITECTURE.md`、`docs/ROUTING_ARCHITECTURE.md`

---

*本檔依目前程式庫狀態整理；若實作變更，請同步更新此脈絡檔。*
