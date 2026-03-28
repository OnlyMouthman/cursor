# 架構設計決策說明

本文檔說明專案中每個重要技術選擇和設計決策的原因。

## 1. 前端技術棧選擇

### Vue 3 + Composition API
**原因**:
- **現代化**: Vue 3 提供更好的效能和開發體驗
- **邏輯復用**: Composition API 讓邏輯更容易復用和測試
- **型別支援**: 與 TypeScript 整合良好
- **生態系統**: 豐富的插件和工具支援

### Vite
**原因**:
- **極速開發**: 毫秒級 HMR，大幅提升開發效率
- **生產優化**: 使用 Rollup 進行生產構建，產出優化
- **原生 ESM**: 支援原生 ES 模組，無需打包即可開發
- **插件生態**: 豐富的插件生態系統

### TypeScript
**原因**:
- **型別安全**: 編譯時發現錯誤，減少運行時問題
- **開發體驗**: IDE 自動完成和重構支援
- **可維護性**: 大型專案中更容易維護
- **團隊協作**: 型別即文檔，降低溝通成本

### Tailwind CSS
**原因**:
- **快速開發**: 原子化 CSS，無需寫自訂樣式
- **一致性**: 統一的設計系統
- **體積小**: 生產環境只包含使用的樣式
- **易於維護**: 樣式與 HTML 在一起，易於理解

### UI 主題（CSS 變數 + Tailwind 語意色）
**決策**: 品牌色與介面層級以 `styles/theme.css` 的 `--color-*` 為單一來源；`tailwind.config.js` 以語意名稱（如 `bg-page`、`text-ink-strong`）對應 `var(--color-…)`；重複 UI 模式以 `main.css` 的 `@layer components`（如 `btn-primary`、`ui-card`）收斂。

**原因**:
- **可替換主視覺**: 換色時改少數變數即可，避免在大量 `.vue` 內搜尋 hex。
- **語意優先**: 元件表達「層級／用途」而非具體色碼，利於長期維護與未來多主題（例如 `[data-theme]` 覆寫變數）。
- **細節**見 [THEME_TOKENS.md](./THEME_TOKENS.md)。

## 2. 後端技術棧選擇

### Firebase
**原因**:
- **快速開發**: 無需設置伺服器，快速上線
- **即時同步**: Firestore 提供即時資料同步
- **完整解決方案**: Auth、Database、Storage 一體化
- **擴展性**: Google 基礎設施，自動擴展

**未來切換考量**:
- 設計了 API 抽象層，可無縫切換到 Django 或其他後端
- 所有業務邏輯不依賴 Firebase 具體實作

## 3. 核心架構設計

### API 抽象層（src/api/）

**設計理念**:
```
業務邏輯層
    ↓
API 抽象層 (統一介面)
    ↓
適配器層 (Firebase / Django / 其他)
    ↓
後端服務
```

**優勢**:
1. **解耦**: 業務邏輯與後端實作完全解耦
2. **可測試**: 可以輕鬆 mock API 客戶端
3. **可切換**: 切換後端只需修改適配器
4. **一致性**: 統一的 API 介面，降低學習成本

**實作方式**:
- `src/api/client.ts`: 定義統一介面（RESTful 風格）
- `src/api/firebase/`: Firebase 的具體實作
- `src/api/adapters/django.ts`: Django 適配器範例

**使用範例**:
```typescript
// 無論後端是什麼，使用方式都一樣
import { api } from '@/api/client'
const users = await api.get('/users')
```

### 環境變數管理

**設計決策**: 前端只使用 `VITE_*` 前綴

**原因**:
- Vite 要求環境變數必須以 `VITE_` 開頭才能在前端使用
- 明確區分前端和後端環境變數
- 安全性：避免意外暴露後端配置

**實作**:
- `.env.development`: 開發環境
- `.env.production`: 生產環境
- `.env.example`: 範例檔案（不含敏感資訊）

## 4. Docker 策略

### 開發環境 vs 生產環境

**開發環境** (`docker-compose.dev.yml`):
- 掛載本地程式碼（volume mount）
- 支援熱重載（HMR）
- 包含開發工具和調試功能

**生產環境** (`docker-compose.prod.yml`):
- 構建優化的靜態檔案
- 多階段構建（builder + nginx）
- 最小化映像大小
- 不包含開發依賴

### 為什麼使用 Docker？

**原因**:
1. **環境一致性**: 開發、測試、生產環境完全一致
2. **易於部署**: 一次構建，到處運行
3. **隔離性**: 不污染本地環境
4. **可擴展**: 易於擴展到多容器架構

## 5. Reverse Proxy 設計

### Nginx 配置

**設計決策**: 使用 Nginx 作為 reverse proxy

**原因**:
1. **統一路由**: 所有請求都通過同一個入口
2. **避免 CORS**: 前端和後端在同一域名下
3. **未來擴展**: 易於添加更多後端服務
4. **靜態檔案**: 生產環境直接提供靜態檔案

**路由設計**:
- `/api/*` → 後端 API
- `/socket.io/*` → WebSocket
- 其他 → 前端 SPA

**優勢**:
- 前端無需知道後端的實際位置
- 切換後端時只需修改 Nginx 配置
- 可以輕鬆添加負載均衡、快取等功能

## 6. 國際化（i18n）

### 選擇 vue-i18n

**原因**:
- Vue 官方推薦的 i18n 解決方案
- 與 Vue 3 Composition API 整合良好
- 支援動態語言切換
- 豐富的功能（複數、日期格式化等）

### 語言檔案結構

```
src/i18n/locales/
├── zh-TW.ts  # 繁體中文
└── en.ts     # 英文
```

**擴展性**: 新增語言只需：
1. 新增語言檔案
2. 在 `src/i18n/index.ts` 註冊

## 7. 測試策略

### 三層測試架構

**單元測試** (Vitest):
- **目標**: 測試工具函數、composables、API 客戶端
- **工具**: Vitest（Vite 原生支援，快速）
- **位置**: `tests/unit/`

**元件測試** (Vitest + Vue Test Utils):
- **目標**: 測試 Vue 元件的邏輯和渲染
- **工具**: Vitest + @vue/test-utils
- **位置**: `tests/component/`

**E2E 測試** (Playwright):
- **目標**: 測試完整使用者流程
- **工具**: Playwright（跨瀏覽器支援）
- **位置**: `tests/e2e/`

**為什麼選擇這些工具？**
- **Vitest**: Vite 原生支援，無需額外配置，速度快
- **Playwright**: 現代 E2E 測試工具，支援多瀏覽器，API 友好

## 8. 目錄結構設計

### 功能導向 vs 技術導向

**選擇**: 混合方式（功能導向為主）

**結構**:
```
src/
├── api/          # 技術層（API 抽象）
├── components/   # 功能層（元件）
├── views/        # 功能層（頁面）
├── stores/       # 技術層（狀態管理）
└── utils/        # 技術層（工具函數）
```

**原因**:
- 功能相關的程式碼放在一起（components, views）
- 技術相關的程式碼分層管理（api, stores, utils）
- 平衡可維護性和可擴展性

## 9. 狀態管理

### 選擇 Pinia

**原因**:
- Vue 官方推薦（Vuex 的後繼者）
- 更好的 TypeScript 支援
- 更簡潔的 API
- 支援 Composition API

### Store 結構

```
stores/
├── index.ts      # Pinia 實例
└── auth.ts       # 認證 store
```

**設計**: 每個功能模組一個 store，保持單一職責

## 10. 未來擴展性考量

### 切換後端

**設計**: API 抽象層已準備好

**步驟**:
1. 實作新的適配器（如 `src/api/adapters/django.ts`）
2. 修改 `src/api/client.ts`，替換實作
3. 所有業務邏輯無需修改

### 微服務化

**準備**:
- API 抽象層支援多個後端
- Nginx 可配置多個 upstream
- Docker Compose 易於擴展服務

### SSR（服務端渲染）

**未來選項**:
- 可考慮遷移到 Nuxt 3（基於 Vue 3）
- 現有元件和邏輯可重用
- API 抽象層不受影響

## 總結

所有設計決策都圍繞以下核心原則：

1. **可維護性**: 程式碼結構清晰，易於理解和修改
2. **可擴展性**: 易於添加新功能和切換技術
3. **可測試性**: 每個層級都可以獨立測試
4. **開發效率**: 使用現代工具，提升開發速度
5. **生產就緒**: 考慮部署、監控、擴展等生產環境需求


