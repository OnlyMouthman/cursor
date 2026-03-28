# RBAC 權限系統設計規格書

**版本**：1.0  
**目標**：可複用於多專案的基底權限架構，適用於 Admin Dashboard 與 SaaS 後台。

---

## 1. 架構總覽

### 1.1 設計原則

| 原則 | 說明 |
|------|------|
| **簡單可擴展** | 核心模型精簡，透過擴充點支援新專案需求 |
| **基底可複用** | 同一套 RBAC 基底可套用於多個專案，僅需配置與擴充 |
| **向後相容** | 新增權限或模組時不破壞既有設計與資料 |
| **清晰可維護** | 命名一致、職責單一、文件完整 |

### 1.2 系統邊界

- **基底系統**：使用者、角色、權限、權限群組、選單、權限檢查與快取。
- **擴充點**：新模組註冊 → 自動產生權限；新選單項目綁定權限；新專案可擴充 `module.action` 而不改基底邏輯。

### 1.3 模組結構（建議）

```
rbac-base/
├── core/                    # 核心模型與常數
│   ├── user
│   ├── role
│   ├── permission
│   ├── permission-group
│   └── menu
├── services/                # 業務邏輯
│   ├── permission-service   # 權限查詢、快取、檢查
│   ├── role-service        # 角色與權限綁定
│   └── menu-service        # 動態選單組裝
├── auto-generation/        # 權限自動產生
│   └── permission-registry # 模組註冊 → 產生 permission 記錄
└── helpers/                # 後端 / 前端 helper
    └── can, canAny, canAll
```

---

## 2. RBAC 設計

### 2.1 模型關係

```
User (1) ──────────► (1) Role
                          │
                          │ (N)
                          ▼
                    Permission (N)
```

- **User → Role**：一對一，一個使用者僅能擁有一個角色。
- **Role → Permission**：一對多，一個角色擁有多個權限，透過中介表 `role_permissions` 連結。

### 2.2 約束

- 使用者必須指派一個角色；未指派角色者視為無任何權限（除 SuperAdmin 另行判定）。
- 角色至少可為「無權限」角色；權限的授予完全由 `role_permissions` 決定。
- 不支援「使用者直接綁定權限」；所有權限皆透過角色取得，以維持模型單一、易於審計。

---

## 3. 權限命名規則

### 3.1 格式

```
module.action
```

- **module**：模組識別碼，小寫、可含底線，例如 `user`、`role`、`system_settings`。
- **action**：基底系統僅定義兩種行為。

### 3.2 基底動作定義

| 動作 | 語意 | 涵蓋範圍 |
|------|------|----------|
| **view** | 檢視 | 讀取、列表、詳情、唯讀存取 |
| **edit** | 編輯 | 新增 (create)、更新 (update)、刪除 (delete) |

**規則**：`edit` 隱含對該模組的完整寫入能力，實作時 `edit` 通過即可允許 create/update/delete，無須再拆成 `create`、`update`、`delete`。

### 3.3 範例

| 權限 | 說明 |
|------|------|
| `user.view` | 檢視使用者列表與詳情 |
| `user.edit` | 使用者新增、修改、刪除 |
| `role.view` | 檢視角色與其權限 |
| `role.edit` | 角色新增、修改、刪除與權限綁定 |
| `settings.view` | 檢視系統設定 |
| `settings.edit` | 修改系統設定 |

### 3.4 擴充

- 未來若需更細粒度（如 `user.create`、`user.delete`），可在**同一命名規則**下擴充 action 類型，並在權限表新增記錄；基底 `view` / `edit` 仍可保留，以維持相容性。

---

## 4. 權限群組結構

### 4.1 用途

- 在後台將權限依「功能區塊」分組，便於角色編輯介面展示與勾選。
- 不影響權限檢查邏輯；檢查時仍以 `module.action` 為準。

### 4.2 結構

- **Permission Group**：群組名稱、排序、可選描述。
- 每個 **Permission** 隸屬於一個 **Permission Group**（多對一）。

### 4.3 範例

| 群組名稱 | 權限 |
|----------|------|
| User Management | `user.view`, `user.edit` |
| Role Management | `role.view`, `role.edit` |
| System | `settings.view`, `settings.edit` |
| Content | `content.view`, `content.edit` |

### 4.4 基底系統建議群組

- User Management  
- Role Management  
- Permission Management（若開放權限管理介面）  
- Menu Management  
- System（其餘系統級設定）

---

## 5. 選單系統設計

### 5.1 原則

- 選單**依權限動態產生**；未具備所需權限的項目不顯示。
- 選單項目與權限一對一綁定：一項選單對應一個「進入該功能所需」的權限（通常為 `view`）。

### 5.2 選單項目欄位

| 欄位 | 說明 |
|------|------|
| id | 主鍵 |
| name | 顯示名稱（可支援 i18n key） |
| route | 前端路由 path |
| icon | 圖示識別碼或組件名 |
| order | 同層級排序數字，小至大 |
| permission | 所需權限，例如 `user.view` |
| parent_id | 父選單 id，NULL 表示頂層 |

### 5.3 階層與排序

- **parent_id**：有值則為子選單，NULL 為頂層。
- **order**：同一 `parent_id` 下依 `order` 升序排列。
- 子選單僅在父選單可見時才考慮顯示；父選單可見性由父選單的 permission 決定。

### 5.4 可見性規則

- 若使用者擁有該選單項目的 **permission**，則顯示該項目。
- **SuperAdmin** 視為擁有所有權限，故所有選單項目皆顯示。
- 若父選單不顯示，其下子選單一律不顯示（即使子選單權限通過）。

### 5.5 範例結構

```
System (permission: system.view, order: 10)
├── Users (permission: user.view, order: 1)
├── Roles (permission: role.view, order: 2)
Content (permission: content.view, order: 20)
├── Articles (permission: content.edit 或 content.view, order: 1)
```

---

## 6. 資料庫 Schema

### 6.1 表單一覽

- `users`：使用者
- `roles`：角色
- `permissions`：權限
- `permission_groups`：權限群組
- `role_permissions`：角色–權限多對多
- `menus`：選單項目

### 6.2 users

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | PK | 主鍵 |
| role_id | FK → roles.id | 唯一，一個使用者一個角色 |
| email | string | 登入帳號 |
| ... | 其他業務欄位 | 如 name、avatar、status 等 |

**約束**：`role_id` 必填（或透過預設角色處理）；唯一性由應用層或唯一索引保證「一個使用者一個角色」的語意。

### 6.3 roles

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | PK | 主鍵 |
| name | string | 角色名稱，如 Admin、Editor |
| slug | string | 唯一識別碼，如 super_admin、admin、editor |
| description | string, optional | 說明 |

**約束**：`slug = 'super_admin'` 保留給 SuperAdmin，不可刪除且邏輯上 bypass 所有權限檢查。

### 6.4 permission_groups

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | PK | 主鍵 |
| name | string | 群組顯示名稱 |
| order | int | 群組排序 |

### 6.5 permissions

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | PK | 主鍵 |
| permission_group_id | FK → permission_groups.id | 所屬群組 |
| name | string | 顯示名稱，如「檢視使用者」 |
| slug | string, unique | 權限碼，即 `module.action`，如 user.view、user.edit |
| description | string, optional | 說明 |

**約束**：`slug` 唯一；新增模組時由「權限自動產生」寫入對應 `slug`。

### 6.6 role_permissions

| 欄位 | 型別 | 說明 |
|------|------|------|
| role_id | FK → roles.id | 角色 |
| permission_id | FK → permissions.id | 權限 |

**約束**：(role_id, permission_id) 唯一。  
**語意**：該角色擁有該權限。

### 6.7 menus

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | PK | 主鍵 |
| parent_id | FK → menus.id, nullable | 父選單，NULL 為頂層 |
| name | string | 顯示名稱或 i18n key |
| route | string | 前端路由 path |
| icon | string | 圖示 |
| order | int | 同層排序 |
| permission_id | FK → permissions.id | 進入此功能所需權限 |

**約束**：一個選單項目對應一個 permission；前端依使用者權限過濾後再組裝樹狀結構。

### 6.8 關聯摘要

- `users.role_id` → `roles.id`
- `permissions.permission_group_id` → `permission_groups.id`
- `role_permissions.(role_id, permission_id)` → `roles.id`, `permissions.id`
- `menus.parent_id` → `menus.id`
- `menus.permission_id` → `permissions.id`

---

## 7. 權限檢查邏輯

### 7.1 後端 Helper 語意

| Helper | 語意 | 回傳 |
|--------|------|------|
| **can(permission)** | 是否擁有單一權限（permission 為 slug，如 `user.edit`） | boolean |
| **canAny(permissions[])** | 是否擁有其中任一權限 | boolean |
| **canAll(permissions[])** | 是否擁有全部權限 | boolean |

### 7.2 SuperAdmin 行為

- 若當前使用者所屬角色的 `slug === 'super_admin'`（或專案約定之 SuperAdmin 識別方式），則：
  - `can(any)`、`canAny(any)`、`canAll(any)` 一律回傳 **true**。
- 此判斷應在權限檢查的最外層、優先於查表或快取。

### 7.3 一般流程（非 SuperAdmin）

1. 解析當前使用者與其 `role_id`。
2. 取得該角色權限集合（建議由快取 `permission:user_id` 取得，見第 10 節）。
3. **can(permission)**：檢查 `permission` 是否在集合中。
4. **canAny(permissions)**：集合與 `permissions` 交集非空即 true。
5. **canAll(permissions)**：`permissions` 每一項皆在集合中即 true。

### 7.4 使用情境

- **API / 路由守衛**：進入前呼叫 `can('user.edit')`，失敗則 403。
- **選單**：僅組出 permission 在「使用者權限集合」內的選單節點。
- **按鈕/功能**：前端可依 `can('user.edit')` 決定是否顯示「新增/編輯/刪除」等按鈕（後端仍須再次檢查）。

---

## 8. 權限自動產生機制

### 8.1 目標

- 避免手動重複建立 `user.view`、`user.edit` 等權限。
- 模組一經註冊，即確保對應權限存在且命名一致。

### 8.2 註冊內容（每模組）

- **module_slug**：如 `user`、`role`、`settings`。
- **permission_group**：所屬權限群組 id 或 slug。
- **optional**：顯示名稱、描述。

### 8.3 自動產生規則

- 對每個已註冊的 module_slug，系統自動確保存在兩筆 permission：
  - `{module_slug}.view`
  - `{module_slug}.edit`
- 若 DB 尚無該 slug，則新增；若已存在則跳過（或僅更新 name/description），不覆寫既有綁定。

### 8.4 執行時機

- **遷移/種子**：專案初始化或升級時，依「已註冊模組列表」執行一次同步。
- **動態註冊**：若架構支援「執行期註冊模組」，可在註冊時觸發同步；否則建議在部署/啟動時跑一次同步。

### 8.5 基底系統建議註冊模組

- user  
- role  
- permission（若開放權限管理 UI）  
- menu  
- settings / system（依專案命名）

---

## 9. SuperAdmin 行為

### 9.1 識別方式

- 角色 `slug = 'super_admin'`（或專案統一常數）視為 SuperAdmin。
- 該角色可仍綁定所有權限（方便 UI 顯示），但**邏輯上不依賴綁定**，一律視為擁有全部權限。

### 9.2 行為摘要

| 情境 | 行為 |
|------|------|
| can / canAny / canAll | 一律 true |
| 選單 | 所有項目可見 |
| API / 路由 | 不因權限拒絕 |
| 權限快取 | 可選擇不寫入快取，或寫入特殊標記「全開」以節省空間 |

### 9.3 防鎖死

- 至少保留一個 SuperAdmin 帳號；角色不可被刪除或改名導致無法辨識。
- 建議：刪除/停用角色前檢查是否為 SuperAdmin，並禁止刪除或至少需額外確認。

---

## 10. 權限快取策略

### 10.1 目的

- 減少「每次請求都查詢 role → role_permissions → permissions」的開銷。
- 權限變更頻率低，適合快取。

### 10.2 快取 Key

```
permission:{user_id}
```

例如：`permission:12345`。

### 10.3 快取內容

- **型別**：字串陣列（或 Set 序列化）。
- **內容**：該使用者透過角色取得的所有 permission **slug**。

範例：

```json
["user.view", "user.edit", "role.view", "role.edit", "settings.view"]
```

### 10.4 讀取流程

1. 若為 SuperAdmin，直接回傳「通過」或跳過快取。
2. 否則讀取 `permission:{user_id}`。
3. 若命中：用該陣列做 can/canAny/canAll 判斷。
4. 若未命中：從 DB 查出角色與權限，組出 slug 陣列，寫入快取，再回傳。

### 10.5 失效時機

- 使用者**角色變更**：刪除 `permission:{user_id}`。
- **角色權限變更**（role_permissions 異動）：刪除所有綁定該角色的使用者的 permission 快取（需查詢該 role_id 對應的 user_id 列表）。
- 可設定 **TTL**（如 1 小時）作為保險，避免長期未失效。

### 10.6 實作注意

- 快取層（Redis/Memcached 等）需在規格中預留；實作時由專案選擇技術。
- 若無快取，則每次依 DB 查詢，邏輯仍一致，僅效能差異。

---

## 11. 基底系統模組清單

| 模組 | 權限 | 說明 |
|------|------|------|
| User Management | user.view, user.edit | 使用者 CRUD、列表、狀態 |
| Role Management | role.view, role.edit | 角色 CRUD、權限勾選 |
| Permission Management | permission.view, permission.edit | 權限列表、群組、與自動產生同步（若開放） |
| Menu Management | menu.view, menu.edit | 選單項目 CRUD、排序、階層、綁定權限 |

以上四類為基底必備；其餘如 System、Content 等可由各專案在「同一套 RBAC 規格」下擴充模組與權限。

### 11.1 本倉庫（Jerry）擴充（實作對照）

| 項目 | 說明 |
|------|------|
| **模組** | 於 `frontend/src/types/rbac.ts` 的 `RBAC_MODULES` 追加 `notes`、`gis`、`ar`，種子自動產生 `notes.view`／`notes.edit` 等共六筆權限 |
| **權限群組** | Firestore `permission_groups` 新增 **`pg_modules`（App Modules）**，供上述權限歸類 |
| **角色綁定** | `rbacSeed.ts`：預設 **admin** 含模組 view+edit；**editor** 含三模組 `*.edit`；**viewer** 不含模組 edit（前台模組頁僅瀏覽） |
| **與路由** | 模組父路由 **`meta.editablePermission`** 對應 `*.edit`；前端以 `usePageAccess` + `hasPermission` 控制編輯 UI，**不**以此擋公開瀏覽 |

**既有資料庫**須再執行種子（或等價同步）後，Firestore 才會出現新權限與綁定；細節見 `frontend/src/RBAC_README.md`。

---

## 12. 規格使用方式（給未來專案）

1. **複用**：將本規格與對應的「核心模組結構」複製到新專案，作為權限與選單的基底。
2. **擴充**：新功能以 `module.action` 註冊模組，產生 `module.view` / `module.edit`，並在 permission_groups、menus 中配置。
3. **客製**：僅調整資料（roles、permissions、menus、permission_groups），不改變 can/canAny/canAll、快取 key、SuperAdmin 語意。
4. **進階**：若需更多 action（如 `approve`、`publish`），在相同命名規則下新增 permission 記錄並在 helper 中沿用「權限集合」檢查即可。

---

**文件結束**
