# 後台使用者管理功能實作總結

## 已完成的檔案

### 新增檔案

1. **`frontend/src/types/user.ts`**
   - 定義 `UserRole`、`UserStatus`、`Permission` 型別
   - 定義 `UserDocument`、`UserListParams` 等介面

2. **`frontend/src/utils/permissions.ts`**
   - `hasPermission()` - 檢查使用者權限
   - `hasAnyPermission()` - 檢查是否有任一權限
   - `hasAllPermissions()` - 檢查是否有所有權限
   - `getUserPermissions()` - 取得所有權限
   - Role 到 Permissions 的映射

3. **`frontend/src/api/users.ts`**
   - RESTful 風格的 API 介面
   - `list()` - 取得使用者列表
   - `get()` - 取得單一使用者
   - `createOrUpdate()` - 建立或更新使用者
   - `updateRole()` - 更新角色
   - `updateStatus()` - 更新狀態
   - `updateLastLogin()` - 更新最後登入時間
   - `syncProfile()` - 同步基本資料

4. **`frontend/src/api/firebase/users.ts`**
   - Firebase 實作
   - 所有 CRUD 操作
   - 自動建立使用者文件邏輯

5. **`frontend/src/views/manage/UsersView.vue`**
   - 使用者管理頁面
   - 搜尋和篩選功能
   - 角色和狀態管理
   - 表格顯示

6. **`firestore.rules`**
   - Firestore Security Rules
   - 權限檢查邏輯

### 修改檔案

1. **`frontend/src/stores/user.ts`**
   - 新增 `currentUser`（含 role/status）
   - 新增 `role`、`status`、`isAdmin`、`isActive` computed
   - 新增 `init()` 方法（自動同步使用者資料）
   - 自動建立使用者文件邏輯

2. **`frontend/src/router/index.ts`**
   - 新增 `/manage/users` 路由（需要 `canManageUsers` 權限）
   - 更新 router guard：
     - 檢查登入狀態
     - 檢查使用者狀態（disabled 不能進後台）
     - 檢查權限（只有 admin 可進使用者管理）

3. **`frontend/src/components/UserMenu.vue`**
   - 顯示使用者 role 和 status
   - 使用 i18n

4. **`frontend/src/components/ManageSidebar.vue`**
   - 新增「使用者管理」選單項目
   - 根據權限顯示/隱藏選單項目

5. **`frontend/src/main.ts`**
   - 使用 `userStore.init()` 初始化

6. **`frontend/src/utils/index.ts`**
   - 更新 `formatDate()` 支援時間顯示

7. **`frontend/src/i18n/locales/zh-TW.ts`** 和 **`en.ts`**
   - 新增使用者管理相關翻譯

## 功能實作

### 1. 使用者列表 ✅
- 頁面：`/manage/users`
- 顯示欄位：avatar、displayName、email、role、status、createdAt、lastLoginAt
- 搜尋：支援 displayName 和 email
- 篩選：支援 role 和 status 篩選

### 2. 使用者角色 ✅
- 支援：admin、editor、viewer
- 可擴充：型別定義支援未來擴充 permissions
- 後台可修改：admin 可以修改其他使用者的 role
- 防呆：不能修改自己的 role

### 3. 啟用/停用使用者 ✅
- status 欄位：active、disabled
- 後台可切換：admin 可以切換狀態
- Router guard：disabled 使用者不能進後台
- API 保護：Firestore Rules 也會檢查
- 防呆：admin 不能把自己設為 disabled（UI 和 API 兩邊都擋）

### 4. Current User 顯示 ✅
- Header dropdown 顯示：avatar、name、email、role、status
- 使用 i18n 顯示角色和狀態標籤

### 5. 權限擴充架構 ✅
- `UserRole` 和 `Permission` 型別定義
- `hasPermission()` helper 函數
- 現在使用 role mapping，未來可擴充為細粒度 permissions
- 不綁死在 UI，可切換實作方式

### 6. 自動建立使用者資料 ✅
- 首次 Google 登入時自動建立 users/{uid} doc
- 預設 role: viewer、status: active
- 每次登入更新 lastLoginAt
- 同步 displayName/photoURL（如果 Firebase Auth 有變更）

## Firestore Security Rules

已提供完整的 Security Rules（`firestore.rules`）：

- **讀取**：可以讀取自己的文件，admin 可以讀取所有文件
- **建立**：只能建立自己的文件，預設 role=viewer、status=active
- **更新**：
  - 可以更新自己的基本資料（但不能改 role/status）
  - admin 可以更新所有欄位（但不能改自己的 role/status）
- **刪除**：不允許刪除

## 使用方式

### 部署 Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 測試流程

1. 首次登入 → 自動建立使用者文件（role: viewer）
2. Admin 登入 → 可以進入 `/manage/users`
3. 修改其他使用者 role → 只有 admin 可以
4. 停用使用者 → disabled 使用者不能進後台
5. 嘗試停用自己 → UI 和 API 都會阻擋

## 檔案清單

### 新增檔案
- `frontend/src/types/user.ts`
- `frontend/src/utils/permissions.ts`
- `frontend/src/api/users.ts`
- `frontend/src/api/firebase/users.ts`
- `frontend/src/views/manage/UsersView.vue`
- `firestore.rules`

### 修改檔案
- `frontend/src/stores/user.ts`
- `frontend/src/router/index.ts`
- `frontend/src/components/UserMenu.vue`
- `frontend/src/components/ManageSidebar.vue`
- `frontend/src/main.ts`
- `frontend/src/utils/index.ts`
- `frontend/src/i18n/locales/zh-TW.ts`
- `frontend/src/i18n/locales/en.ts`

## 注意事項

1. **Firestore Rules 部署**：必須部署 `firestore.rules` 才能生效
2. **首次登入**：會自動建立使用者文件，預設 role 為 viewer
3. **權限檢查**：Router guard 和 Firestore Rules 雙層保護
4. **防呆機制**：不能修改自己的 role/status（UI 和 API 都檢查）


