# RBAC 實作說明

本專案已依 `RBAC_SYSTEM_SPECIFICATION.md` 實作基底 RBAC，並與現有 Firebase/Firestore、Vue 3、Pinia 整合。

## Firebase 必須完成的設定（避免 Missing or insufficient permissions）

以下**全部**都要做，規則才會生效、同步使用者與種子才不會報錯：

1. **部署 Firestore 規則（最重要）**  
   本機規則檔 `firestore.rules` 不會自動上傳，必須手動部署到 Firebase：
   ```bash
   cd /mnt/c/Users/User/Job/Web/cursor
   firebase login
   firebase use jerry-c-4243c
   firebase deploy --only firestore:rules
   ```
   成功後在 [Firebase Console](https://console.firebase.google.com/) → 專案 **jerry-c-4243c** → **Firestore Database** → **規則** 分頁，應看到與本機 `firestore.rules` 相同的內容。

2. **確認專案與應用程式一致**  
   - 應用程式初始化時會印出「專案 ID: jerry-c-4243c」，請確認與 Firebase Console 的專案一致。  
   - 若有多個專案，請用 `firebase use <project-id>` 切換後再執行上面的 `deploy --only firestore:rules`。

3. **確認使用者文件存在且為 admin**  
   - **Firestore Database** → **users** 集合 → 你的文件（文件 ID = 登入使用者的 UID）。  
   - 若沒有該文件，先登入一次應用程式讓系統建立；再編輯該文件，新增欄位 **role**（string）值 **admin**，儲存。

4. **設定 Custom Claim（才能正常顯示「管理使用者」列表）**  
   「讀取其他使用者的文件」時，規則改用 **Custom Claim** `role` 判斷是否為 admin，避免超過 Firestore 每請求 `get()` 次數限制。請為你的 admin 帳號設定 claim：
   - **方式 A**：使用專案內腳本（需先下載服務帳戶金鑰）  
     ```bash
     cd C:\Users\User\Job\Web\cursor
     # 從 Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰，下載後存成 scripts/serviceAccountKey.json
     cd scripts && npm install && node set-admin-claim.js <你的Firebase_Auth_UID>
     ```
   - **方式 B**：用 Cloud Functions 或其它後端在「將使用者設為 admin」時呼叫 `auth().setCustomUserClaims(uid, { role: 'admin' })`。
   - 設定完成後，請**重新登入**（token 會帶上新的 claim），再進入 **Manage → Users**。

5. **重新整理／重新登入**  
   部署規則並改好 `users`、設定好 Custom Claim 後，請重新登入再執行種子或進入 `/manage`。

## 已實作項目

- **型別**：`types/rbac.ts`（Role, Permission, PermissionGroup, Menu, PermissionSlug）
- **Firestore 集合**：`permission_groups`, `permissions`, `roles`, `role_permissions`, `menus`
- **API**：`api/firebase/rbac.ts`（CRUD 與查詢）、`api/firebase/rbacSeed.ts`（種子）、`api/menus.ts`（選單＋權限 slug）
- **權限 Store**：`stores/permission.ts`（`can` / `canAny` / `canAll`、SuperAdmin、快取 `permission:{uid}`）
- **User Store**：登入後自動呼叫 `permissionStore.loadForUser(uid, roleId, role)`
- **選單**：`ManageSidebar.vue` 從 Firestore 載入選單，依權限過濾
- **路由**：`meta.requiresPermission` 使用 `module.action`（如 `user.view`）
- **Firestore 規則**：依 `roleId` / `role` 解析角色 slug，`admin` 與 `super_admin` 可管理 RBAC 集合

## 首次部署：執行 RBAC 種子

種子會建立：權限群組、權限（user/role/permission/menu/settings 的 view+edit）、角色（super_admin, admin, editor, viewer）、角色權限綁定、後台選單。

### 若出現「Missing or insufficient permissions」

Firestore 規則只允許 **admin** 或 **super_admin** 寫入 `roles`、`permissions` 等集合，而新註冊／登入的使用者預設為 **viewer**，因此執行種子會被拒絕。請先將「自己」設為 admin，再執行種子：

1. 開啟 [Firebase Console](https://console.firebase.google.com/) → 選擇專案 → **Firestore Database**。
2. 左側點 **users** 集合，找到「你的使用者文件」（文件 ID = 你的 Firebase Auth UID；可從應用程式登入後在主控台執行 `(await import('@/api/auth')).authAPI.getCurrentUser()?.uid` 查詢，或從 Authentication 頁面點該使用者查看 UID）。
3. 點進該文件，點「編輯」。
4. 新增或修改欄位 **`role`**，型別選 **string**，值設為 **`admin`**，儲存。
5. 回到你的應用程式：**重新整理頁面**或**重新登入**（讓前端重新載入使用者資料）。
6. 再於主控台執行種子：

```js
const { seedRbac } = await import('/src/api/firebase/rbacSeed.ts')
await seedRbac()
```

### 執行種子的方式

**方式一（主控台）**  
在已登入且該使用者在 Firestore `users` 中為 `role: 'admin'` 的環境下，於瀏覽器主控台執行：

```js
const { seedRbac } = await import('/src/api/firebase/rbacSeed.ts')
await seedRbac()
```

**方式二（開發用按鈕）**  
在後台某頁（如儀表板）暫時加入按鈕，點擊時呼叫 `seedRbac()`；完成後移除。

## 權限命名

- 格式：`module.action`，基底僅 `view`、`edit`。
- 範例：`user.view`、`user.edit`、`role.view`、`settings.edit`。
- SuperAdmin（角色 slug `super_admin`）不檢查權限，一律視為通過。

## 選單與路由

- 選單來自 Firestore `menus`，每筆綁定一筆 `permission_id`；前端依 `can(permissionSlug)` 過濾。
- 路由 `meta.requiresPermission` 使用同上 slug，未通過時導向 `/manage`。

## 快取與失效

- 權限快取 key：`permission:{uid}`，TTL 1 小時。
- 登出時會呼叫 `permissionStore.clear()` 清除快取。
- 若在後台變更使用者角色或角色權限，需重新登入或清除該使用者的快取後才會反映。
