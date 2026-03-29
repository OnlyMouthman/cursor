# RBAC System Design — Jerry 後台系統

> 用途：
> 說明本系統的「角色權限設計（RBAC）」與實作方式。
> 此文件為平台層核心設計，所有模組（notes / gis / ar）需遵守。

---

## 1. 設計目標

本系統 RBAC（Role-Based Access Control）目標：

- 統一管理「登入 / 未登入」的權限行為
- 避免 hardcode（例如：未登入特判）
- 支援模組化（每個模組只定義自己的 permission）
- 支援未來擴展（API / Django / 多角色）

---

## 2. 核心設計概念

### 2.1 user ≠ permission

登入身份（user） ≠ 權限來源（permission）

- user：代表登入者
- permission：代表可做的事情

未登入時：

user = null  
permission = guest role

---

### 2.2 guest 是正式角色

系統定義：

guest = 未登入使用者的角色

特性：

- 存在於 Firestore（roles collection）
- 可在後台編輯權限
- 不建立 user document
- 不可刪除、不可指派

---

### 2.3 單一權限來源（Single Source of Truth）

所有權限判斷 → hasPermission()

不可：

- 在頁面寫 if (isGuest)
- 在 router 寫特判
- 在 component 判斷 role

---

## 3. 資料模型（Firestore）

### 3.1 roles

roles/{roleId}

欄位：

- id：文件 ID
- slug：唯一識別（如 guest / admin）
- name：顯示名稱
- description：描述
- isSystem：是否系統角色
- isDeletable：是否可刪
- assignable：是否可指派

---

### 3.2 permissions

permissions/{permissionId}

欄位：

- slug：如 notes.view
- name：顯示名稱

---

### 3.3 role_permissions

role_permissions/{docId}

欄位：

- roleId：對應 roles
- permissionId：對應 permissions

---

## 4. 權限命名規則

統一格式：

<module>.<action>

範例：

- notes.view
- notes.edit
- gis.view
- gis.edit
- ar.view
- ar.edit

---

## 5. 權限運作流程

### 5.1 登入使用者

Firebase Auth → user  
→ loadForUser(user.uid)  
→ permissionSlugs  
→ hasPermission()

---

### 5.2 未登入（guest）

user = null  
→ loadForGuest()  
→ permissionSlugs（來自 guest role）  
→ hasPermission(null, ...)

---

## 6. permission store 設計

核心狀態：

- permissionSlugs: string[]
- loadedForUid: string | null
- roleSlug: string

規則：

- 登入 → loadedForUid = user.uid
- 未登入 → loadedForUid = 'guest'

---

## 7. hasPermission 設計

hasPermission(user, permission)

邏輯：

### 登入

loadedForUid === user.uid → 檢查 permissionSlugs

### 未登入

loadedForUid === 'guest' → 檢查 permissionSlugs

---

## 8. 路由控制（Step 4）

使用 router meta：

meta:
- viewPermission: 'notes.view'
- editablePermission: 'notes.edit'

行為：

- 沒有 viewPermission → 可進
- 有 viewPermission 且沒有權限 → 導回首頁

---

## 9. UI 控制

### Hub / Sidebar

hasPermission('notes.view') → 顯示

---

### 編輯能力

hasPermission('notes.edit') → 可編輯

---

## 10. Notes 資料可見性

permission 控「可進模組」  
visibility 控「可看資料」

| 層級 | 控制 |
|------|------|
| module | notes.view |
| edit | notes.edit |
| data | public / private |

---

## 11. Firestore Rules（關鍵）

為支援 guest：

允許匿名讀取：

- guest role
- guest 的 role_permissions
- permissions（只讀）

禁止：

- 所有寫入（需 admin）
- 非 guest 的角色資料

---

## 12. 設計優勢

### 無特判

未登入 ≠ 特殊流程  
未登入 = guest role

---

### 模組解耦

每個模組只需：

宣告 permission slug

---

### 易於擴展

未來可支援：

- 多角色
- API backend（Django）
- permission caching

---

## 13. 已知限制 / 未來優化

### permissions 全量讀取

目前：

permissions → allow read: true

未來可改：

- 只讀必要 permissionId

---

### permission loading race

登出瞬間可能：

guest 尚未載入 → hasPermission false

未來可加：

permissionReady 狀態

---

### 即時權限變更

目前：

需重新導航才生效

未來可加：

watch permission → redirect

---

## 14. 開發規範

### 必須遵守

- 所有權限判斷 → hasPermission
- 不可直接讀 role 判斷
- 不可寫 guest 特判

---

### 禁止

- if (!user) { ... }
- if (role === 'guest')

---

## 結語

本 RBAC 系統的核心理念：

所有人都是角色（包含未登入）  
所有行為都由 permission 決定

這使系統具備：

- 一致性
- 可維護性
- 可擴展性