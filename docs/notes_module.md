# Notes Module — MVP 規格與實作對照（v1.0 文件）

> 本文同時描述**產品範圍**與**本 repo 已落地實作**；Step 1～5 已完成，細部落點見 §七、§十一、**§十二**。

---

## 一、模組定位（Module Definition）

### 模組名稱
notes

### 模組目的
提供一個可分組的筆記系統，讓使用者可以：

- 建立分類（group）
- 在分類底下建立筆記（note）
- 使用 Markdown 記錄內容
- 快速瀏覽與查找筆記

---

## 二、功能範圍（MVP Scope）

### 本階段要完成

#### Group（分類）
- 建立分類
- 建立子分類
- 顯示樹狀結構
- 重新命名
- 刪除（有條件）

#### Note（筆記）
- 建立 note
- 編輯 note（title + content）
- 刪除 note
- 顯示 note 列表
- 顯示 note 詳細內容
- Markdown 預覽

#### UI 結構
- 左：Group Tree
- 中：Note List
- 右：Note Editor / Preview

**實作狀態**：上述 Group／Note／三欄 UI 已於 **Step 1～5** 落地（Firestore API、三欄骨架、樹／列表互動、編輯儲存、Markdown 預覽）。對照表見 **§十二**。

---

### 本階段不做（規格內刻意不實作）

以下項目**本 repo MVP 未做**，避免範圍發散：

- tag 系統
- 全域搜尋
- block editor／rich text 編輯器
- 拖拉排序
- 多人協作、版本歷史
- 附件／圖片上傳
- `format`（text／markdown）**切換 UI**（資料欄位已預留，預設一律 markdown）
- 自動儲存、快捷鍵儲存、切換筆記前**未儲存提醒**
- Notes 專屬 **Firestore Security Rules** 範本（需上線前於 Console 補齊）
- 與 RBAC 細粒度整合（目前僅沿用平台 `usePageAccess`／`notes.edit` 等）

---

## 三、頁面與 UI 結構

### 路由
/notes

### Layout 結構

- 左側：Group Tree
- 中間：Note List
- 右側：Note Editor / Preview

---

## 四、資料模型（Data Model）

### Group

- id
- name
- parent_id（可為 null）
- sort_order
- created_at
- updated_at

---

### Note

- id
- group_id
- title
- content
- format（'markdown' | 'text'）
- created_at
- updated_at

---

## 五、資料關係

- 一個 group 可有多個子 group
- 一個 group 可有多篇 note
- 一篇 note 只屬於一個 group

---

## 六、API 設計（RESTful）

### Group API

#### 取得 group tree
getGroupTree()

#### 建立 group
createGroup(payload)

#### 更新 group
updateGroup(id, payload)

#### 刪除 group
deleteGroup(id)

##### 刪除規則
- 有子 group → 不可刪
- 有 notes → 不可刪

---

### Note API

#### 取得 note list
getNotesByGroup(groupId)

#### 建立 note
createNote(payload)

#### 取得 note detail
getNoteDetail(id)

#### 更新 note
updateNote(id, payload)

#### 刪除 note
deleteNote(id)

---

## 七、前端結構（簡化）

> **Step 1**（資料／API）見 **§十一**；本節為 **Step 2～5** 前端落點。

### Step 2 頁面與元件（三欄骨架）

- 路由：`/notes` → `ModuleLayout` → `NotesHome.vue`（含 `ModuleAccessBanner`）→ **`NotesPage.vue`** 三欄主體。
- 目錄：`frontend/src/views/modules/notes/`
  - `NotesPage.vue`：`selectedGroupId` / `selectedNoteId` / `editMode`（edit | preview）與資料載入編排；僅呼叫 `api/firebase/notes.ts`，不直接操作 Firestore。
  - `components/NoteGroupTreePanel.vue`、`NoteGroupTree.vue`、`NoteGroupTreeItem.vue`：左欄分類樹、展開／收合、新增根／子分類、列上改名／刪除。
  - `components/NoteListPanel.vue`：中欄列表（title、updatedAt）、選取筆記、新增／刪除筆記。
  - `components/NoteEditorPanel.vue`：右欄標題／內容、編輯與預覽切換（預覽為 Markdown 渲染，見 Step 5）。
  - `components/NotesTextModal.vue`：建立／改名分類用之輕量對話框（標題輸入 + 確定／取消）。

### Step 3 左欄／中欄互動（已完成）

- **分類樹**：`getGroupTree` 載入；`createGroup`（根或子）、`updateGroup`（改名）、`deleteGroup`（確認後刪除；API 拒絕時錯誤顯示於左欄）；重建樹時可保留展開狀態，新建子分類時強制展開父節點。
- **筆記列表**：`getNotesByGroup` 隨 `selectedGroupId` 更新；`createNote`、`deleteNote`（確認）；刪除或切換分類時安全處理 `selectedNoteId`。
- **狀態**：`treeLoading` / `notesLoading`、`treeError` / `notesError`；Firestore 僅經 `api/firebase/notes.ts`。

### Step 4 右欄 Note Editor（基本編輯／儲存）

- **容器 `NotesPage.vue`**：`draftTitle` / `draftContent` 為右欄草稿；`getNoteDetail` 於 `selectedNoteId` 變更時載入（序號防競態）；`editorDetailLoading`、`editorLoadError`、`editorSaveError`、`saving`、`saveSuccessVisible`（約 2.2s）由容器管理；`updateNote` 成功後 `loadNotesForGroup` 以更新列表 `updatedAt`。
- **`NoteEditorPanel.vue`**：僅呈現與雙向綁定，不呼叫 Firebase；無選取筆記／載入中／載入失敗／可編輯等狀態分流；儲存錯誤顯示於右欄標題列旁，**不清空草稿**；切換筆記時**不提示未儲存**，直接載入新筆記（未儲存內容丟棄）。
- **未做（Step 4 範圍外）**：format 切換 UI、自動儲存、快捷鍵儲存。

### Step 5 Markdown 預覽（右欄）

- **套件**：`marked`（GFM、換行）產生 HTML；`DOMPurify.sanitize`（`USE_PROFILES: html`）後再 `v-html`，降低 XSS／惡意 HTML 風險。
- **工具**：`frontend/src/utils/markdownPreview.ts` 的 `markdownToSafeHtml`；供 `NoteEditorPanel` 以 **`props.content`（草稿）** 即時計算預覽，無需額外讀取 Firestore。
- **樣式**：`NoteEditorPanel` 內 scoped `:deep(...)`，標題／段落／清單／粗斜體／連結／引用／行內與區塊 code 基本可讀；內容全空白時顯示空狀態文案。
- **未做**：format 切換、自動儲存、圖片上傳與自訂語法外掛等。

### Group State
- groupTree
- selectedGroupId

### Note List State
- notes
- selectedNoteId

### Note Detail State
- 伺服器資料經 `getNoteDetail` 填入 `draftTitle` / `draftContent`（右欄草稿）
- editMode（edit / preview）

---

## 八、使用流程（User Flow）

### 建立分類
新增 group → 選 parent → 顯示在 tree

### 建立筆記
選 group → 新增 note → 編輯 → 儲存

### 閱讀筆記
點 note → 顯示內容 → 切 preview

### 修改筆記
編輯 → 儲存 → 更新時間

### 刪除
刪除 note → 從列表移除

---

## 九、後續可擴充方向（僅列方向，未實作）

以下供產品／工程後續迭代參考，**不屬目前 MVP 範圍**。

| 方向 | 說明 |
|------|------|
| **format 切換** | 使用既有 `format` 欄位，在編輯器加 UI；純文字時預覽策略需另定。 |
| **搜尋** | 單一群組內標題搜尋 → 全域搜尋；Firestore 需設計索引或另建索引集合。 |
| **tag** | 標籤模型（陣列欄位或子集合）、篩選 UI。 |
| **自動儲存** | 節流 `updateNote`、衝突與離線策略。 |
| **未儲存提醒** | 切換筆記／路由離開前確認；需追蹤草稿 dirty 狀態。 |
| **附件／圖片** | Firebase Storage + 筆記內引用欄位或 Markdown 圖片語法。 |
| **Block editor／Rich text** | 若需 WYSIWYG，宜評估與現有 Markdown 管線並存或取代策略。 |
| **RBAC／Rules** | `notes.view`／`notes.edit` 與 Firestore Rules、列表可見範圍一致化。 |
| **效能** | `groupId + updatedAt` 複合索引、大量筆記分頁。 |
| **Markdown 進階** | 語法高亮、Mermaid、表格樣式強化。 |
| **其他** | Note 關聯、Timeline、協作、版本歷史、拖拉排序等。 |

---

## 十、MVP 原則

- 優先完成可用版本
- 不追求複雜 editor
- 保持資料結構簡單
- 確保未來可擴充

---

## 十一、Firebase 資料層（Step 1 實作）

### Collections（頂層）

| Collection | 說明 |
|------------|------|
| `notes_groups` | 分類；一筆文件代表一個 Group |
| `notes_entries` | 筆記；一筆文件代表一篇 Note（命名避免與模組路徑 `/notes` 混淆） |

`notes_` 前綴作為模組命名空間，與既有 `users`、`menus` 等集合並存；日後若改 REST 後端，可保留相同語意欄位，由 `api` 層替換實作。

### 文件欄位（與型別 `NoteGroup` / `NoteEntry` 對應）

**notes_groups**

- `name`（string）
- `parentId`（string | null；null 為根節點）
- `sortOrder`（number）
- `createdAt`、`updatedAt`（Firestore `Timestamp`；前端讀取為 `Date`）

**notes_entries**

- `groupId`（string，對應某 `notes_groups` 文件 id）
- `title`（string）
- `content`（string）
- `format`（`'text'` | `'markdown'`，預設 markdown）
- `createdAt`、`updatedAt`（Timestamp）

### 樹狀結構

- 以 **平面文件 + `parentId`** 表達父子關係；前端於 `getGroupTree()` 內組樹並排序（`sortOrder` 升序，同序則依 `id`）。
- 若 `parentId` 指向不存在文件，該節點視為根層顯示，避免孤兒資料整棵消失。

### 查詢與索引

- 列表 `getNotesByGroup` 使用 `where('groupId', '==', id)` 後於記憶體依 `updatedAt` 排序，**不需**複合索引即可運作（資料量大時可改為建立 `groupId + updatedAt` 複合索引並改由後端 query 排序）。

### 前端 API 實作位置

- `frontend/src/api/firebase/notes.ts`：`getGroupTree`、`createGroup`、`updateGroup`、`deleteGroup`、`getNotesByGroup`、`createNote`、`getNoteDetail`、`updateNote`、`deleteNote`
- `frontend/src/types/notes.ts`：上述模型與 payload 型別

### Security Rules

- 尚未內建於本 repo；上線前請在 Firebase Console 為 `notes_groups`、`notes_entries` 設定規則（例如僅登入使用者可讀寫，或依自訂 claim），與既有 `users` / RBAC 策略對齊。

---

## 十二、MVP 收尾：邊界、檔案結構與 Step 落點

### 前後端邊界

- **無傳統後端**：資料存於 **Firestore**；前端透過 **`frontend/src/api/firebase/notes.ts`** 存取，**不**在元件內直接 `collection/doc` notes 模組集合。
- **型別**：**`frontend/src/types/notes.ts`** 與 Firestore 欄位（camelCase）對齊，利於日後若改 REST 僅替換 `api` 實作。
- **Markdown 預覽**：**`frontend/src/utils/markdownPreview.ts`**（`marked` + `DOMPurify`），僅供右欄預覽，與資料層無耦合。

### 檔案一覽（命名與職責）

| 路徑 | 職責 |
|------|------|
| `views/modules/notes/NotesHome.vue` | 路由入口：橫幅 + 掛載三欄容器 |
| `views/modules/notes/NotesPage.vue` | **容器**：狀態、watch、呼叫 `api/firebase/notes` |
| `views/modules/notes/components/NoteGroupTreePanel.vue` | 左欄殼 + 工具列 |
| `views/modules/notes/components/NoteGroupTree.vue` | 樹根列表 |
| `views/modules/notes/components/NoteGroupTreeItem.vue` | 樹節點（遞迴） |
| `views/modules/notes/components/NoteListPanel.vue` | 中欄列表 |
| `views/modules/notes/components/NoteEditorPanel.vue` | **展示**：右欄表單／預覽，無 Firebase |
| `views/modules/notes/components/NotesTextModal.vue` | 分類建立／改名對話框 |
| `api/firebase/notes.ts` | Firestore CRUD + 樹組裝 |
| `types/notes.ts` | 模型與 payload 型別 |
| `utils/markdownPreview.ts` | 安全 Markdown HTML |

### 容器／展示分層

- **容器**：僅 `NotesPage.vue`（與路由層 `NotesHome.vue`）編排資料流；所有 `get*` / `create*` / `update*` / `delete*` 經 `notes.ts`。
- **展示**：`*Panel.vue`、`*Tree*.vue`、`NoteEditorPanel`、`NotesTextModal` 僅 props／emit／UI；**不重複**呼叫 Firestore。

### 重複邏輯與 TODO

- **日期格式化**：列表 `updatedAt` 在 `NoteListPanel` 內本地化顯示，與他處無衝突；若多處需要再抽 `shared` 工具即可。
- **確認對話框**：刪除分類／筆記使用 `window.confirm`，MVP 可接受；若要統一 UX 可日後換共用 Modal（非本階段）。
- **bundle**：Markdown 若需優化，可於預覽模式再 `dynamic import('marked')`（見 `markdownPreview.ts` 註解）。

### Step 1～5 落點（濃縮）

| Step | 內容 |
|------|------|
| 1 | `api/firebase/notes.ts` + `types/notes.ts` + Firestore 集合設計（§十一） |
| 2 | 三欄骨架、`NotesPage`／`NotesHome`、子元件拆分 |
| 3 | 左／中欄 CRUD 與錯誤／選取回退 |
| 4 | 右欄草稿、`getNoteDetail`／`updateNote`、載入／儲存狀態 |
| 5 | `markdownPreview.ts` + `NoteEditorPanel` 預覽 |

### MVP 仍缺（工程／產品）

- Firestore **Security Rules** 範本與部署說明（營運必備）。
- **format** 切換與純文字預覽策略（資料已支援，UI 未做）。
- 其餘見 **§九**。

### 建議下一步（優先順序參考）

1. **上線安全**：補 `notes_groups`／`notes_entries` Rules，與登入／claim 對齊。  
2. **體驗**：未儲存提醒或自動儲存（擇一先做小而可測）。  
3. **能力**：format 切換或群組內搜尋（依產品優先）。  
4. **效能**：大量資料時複合索引與分頁。