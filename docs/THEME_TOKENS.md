# 全站主題 Token（UI）

## 目的

- 主視覺色與語意（背景層級、文字、邊框、主色、頂欄、側欄、卡片）集中在 **CSS 變數**，避免在 Vue 元件內硬寫 hex。
- 換品牌色或整組主題時，優先只改 `frontend/src/styles/theme.css`（或日後以 `[data-theme="…"]` 覆寫同一批變數）。

## 檔案位置

| 檔案 | 用途 |
|------|------|
| `frontend/src/styles/theme.css` | `:root` 定義 `--color-*` 語意變數 |
| `frontend/src/styles/main.css` | `@import './theme.css'`、`@tailwind`、全域 `body`、`@layer components`（`btn-primary`、`ui-card`、`header-icon-btn`） |
| `frontend/tailwind.config.js` | `theme.extend.colors` 將語意名稱對應到 `var(--color-…)`；`ringColor.focus` 對應焦點環 |

## CSS 變數一覽（概念）

與實作保持同步時請以 `theme.css` 為準；常見 token 包括：

- 背景：`--color-bg-page`、`--color-bg-surface`、`--color-bg-soft`
- 文字：`--color-text-main`、`--color-text-strong`、`--color-text-muted`
- 邊框／分隔：`--color-border`、`--color-divider`
- 主色與狀態：`--color-primary`、`--color-primary-hover`、`--color-primary-active`、`--color-on-primary`、`--color-primary-muted`
- 頂欄：`--color-header-bg`、`--color-header-text`、`--color-header-control-hover` 等
- 側欄：`--color-sidebar-bg`、`--color-sidebar-text`、`--color-sidebar-active-bg`、`--color-sidebar-active-fg`、`--color-sidebar-row-hover`
- 卡片：`--color-card-bg`、`--color-card-border`
- 焦點：`--color-focus-ring`

## Tailwind 語意色（範例）

元件中常見 class 與設定對應關係（完整對照見 `tailwind.config.js`）：

- `bg-page`、`bg-surface`、`bg-soft`
- `text-ink-main`、`text-ink-strong`、`text-ink-muted`
- `border-line`、`border-divider`、`divide-line`
- `bg-primary`、`text-primary`、`bg-primary-subtle`
- `bg-header`、`text-header-fg`
- `bg-sidebar`、`text-sidebar-fg`、`bg-sidebar-active`、`text-sidebar-active-fg`
- `bg-card`、`border-card-border`
- 焦點：`focus:ring-2 focus:ring-focus`、`focus:border-primary`

## 共用元件類別

定義於 `main.css` 的 `@layer components`：

- **`btn-primary`**：主要行為按鈕（登入、儲存等）
- **`ui-card`**：卡片容器（底＋邊框＋圓角）
- **`header-icon-btn`**：深底頂欄上的圖示／觸控區 hover

## 未來多主題（預留）

目前預設僅一組 `:root`。若要第二套主題，可：

1. 在 `html` 或 `body` 加上 `data-theme="dark"`（名稱自訂）。
2. 在 `theme.css` 內撰寫 `[data-theme="dark"] { --color-bg-page: …; … }` 覆寫變數。
3. 不必改動 Tailwind 設定（仍讀取同一變數名稱）。

未實作主題切換 UI 時，僅需維護 CSS 即可。

## 與 API／路由的關係

主題調整**不涉及** `api/`、Firestore 規則或路由定義；純前端呈現層。
