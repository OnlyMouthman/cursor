# Project Context — Jerry 後台系統（Platform Only）

> 用途：  
> 提供 ChatGPT / Cursor / 開發者快速理解「平台層」架構。  
> 本文件只記錄全域共通規則，不記錄單一模組（notes / gis / ar）細節。

---

## 1. 專案定位

- 專案名稱：Jerry 後台系統
- 架構方向：平台核心 + 模組化 side project
- 模組範例：notes、gis、ar
- 原則：
  - 每個模組可獨立演進
  - 平台層只提供共用能力
  - 模組間避免直接耦合
  - AI 協作時，優先只讀平台 context + 當前模組 context

---

## 2. 技術棧

### Frontend
- Vue 3
- Vite
- TypeScript
- Tailwind CSS
- Vue Router
- Pinia
- vue-i18n

### Backend / BaaS
- Firebase Auth
- Firestore
- Storage

### Dev Environment
- Cursor
- Docker Compose
- Nginx

---

## 3. 平台層目錄職責

```txt
frontend/src/
  core/       # 平台核心：auth、router、rbac、layout shell、全域流程
  shared/     # 跨模組可共用：UI、utils、composables、types、theme
  modules/    # 各模組獨立空間
    notes/
    gis/
    ar/
```

### core
只放全域必備能力：
- auth
- router
- RBAC
- app shell
- layout
- 全域導航規則

### shared
只放跨模組共用內容：
- 共用 UI components
- 共用 composables
- utilities
- theme tokens
- 通用 types
- 可複用 API helper

### modules
每個模組獨立管理：
- views
- components
- api
- composables
- docs
- module_context.md

---

## 4. 模組開發規則

- 模組不可直接依賴其他模組內部檔案
- 模組若需要共用能力，應放入 `shared/` 或 `core/`
- 模組路由、畫面、資料流、狀態，優先在模組目錄內閉環
- 模組若需要平台級調整，先標記「影響平台層」，不要直接擴散修改

---

## 5. 路由規則

- 平台負責管理全域路由進入規則
- 模組只管理自己的子路由
- 權限採 router meta + RBAC 控制
- 模組父路由可設 `meta.viewPermission`（如 `notes.view`）：`router` guard 以 `hasPermission(currentUser, …)` 檢查，無權導向 `/`；Hub 模組卡片與模組內假側欄連結亦依對應 `*.view` 過濾
- `editablePermission` 作為模組內編輯能力判斷依據

---

## 6. RBAC 規則

- 平台統一管理角色、權限、選單
- 內建角色種子含 `guest`（文件 id `role_guest`，slug `guest`）。**未登入時**由 `permission` store 的 `loadForGuest()` 自 Firestore 載入該角色權限；`loadedForUid` 使用常數字串 `guest`（非 Firebase uid）。`hasPermission(null, …)` 在此狀態下改以 `permissionStore.can` 判定。不建立 guest 使用者文件
- `Role` 型別與 Firestore 可選 metadata：`isSystem`、`isDeletable`、`assignable`（舊文件無欄位時讀取端省略，刪除 API 仍保留 `super_admin` slug 之 fallback）
- 角色管理（`RolesView`）：刪除鈕以 `isDeletable` 為主、slug 為舊資料 fallback；系統／訪客提示以 metadata 為主（如 `assignable === false` + `isSystem` 顯示訪客說明）。使用者管理（`UsersView`）角色下拉僅列出 `assignable !== false`，若使用者目前角色不可指派則仍顯示該選項以便閱讀
- 模組只宣告自己需要的 permission slug
- 模組權限命名建議：
  - `notes.view`
  - `notes.edit`
  - `gis.view`
  - `gis.edit`
  - `ar.view`
  - `ar.edit`

---

## 7. API 規則

- 元件不得直接耦合資料來源實作
- 一律透過語意化 API 存取資料
- 資料來源目前可為 Firebase
- 未來若切換 Django / REST API，應盡量只影響 API 層
- **Notes 模組（MVP 已落地，Step 1～5）**：資料在 Firestore `notes_groups`、`notes_entries`；前端**僅**經 `frontend/src/api/firebase/notes.ts` 與 `frontend/src/types/notes.ts` 存取。UI：`/notes` → `ModuleLayout` → `views/modules/notes/`（`NotesHome.vue` + **`NotesPage.vue` 容器**，三欄子元件僅展示／emit）。Markdown 預覽：`utils/markdownPreview.ts`（`marked` + `DOMPurify`）。完整檔案對照、邊界、後續待辦與建議優先順序見 **`docs/notes_module.md`**（§七、§十一、**§十二**、§九）

---

## 8. UI / Theme 規則

- 全站主題色集中於 theme tokens
- 元件內避免散落硬編碼 hex
- 共用按鈕、卡片、排版樣式優先放 shared 樣式層

---

## 9. 文件規則

- `project_context.md`：只記平台共通規則
- `frontend/src/modules/<module>/module_context.md`：只記單一模組
- `docs/active-task/<task>.md`：只記當前任務
- 每次開發完成後，只更新有變動的部分，不重寫整份文件

---

## 10. AI 協作規則

### 平台模式
AI 只參考：
1. `project_context.md`
2. 本次明確提到的檔案
3. 必要的 docs 文件

### 模組模式
AI 只參考：
1. `project_context.md`
2. 對應模組的 `module_context.md`
3. 本次任務檔案
4. 本次明確提到的檔案

除非使用者明確要求，AI 不應主動引用其他模組內容。

---

## 11. 開發流程

### 開發環境
1. `wsl -d Ubuntu`
2. `docker compose -f docker-compose.dev.yml up`

### 開發完成後
請更新：
- `project_context.md` 中有變動的共通部分
- 對應模組的 `module_context.md`
- 必要的 `docs/`
- 如有需要，可新增新文件記錄

---

## 12. 當前平台注意事項

- 這份文件不負責記錄單一模組細節（**Notes MVP 細節以 `docs/notes_module.md` 為主**）
- 若模組資訊變多，請拆到各自 `module_context.md`
- 若任務只影響某一模組，請勿更新其他模組文件
