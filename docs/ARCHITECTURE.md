# 專案架構規劃

## 架構總覽

### 技術棧選擇與原因

#### 前端技術棧
- **Vue 3**: 現代化、高效能、Composition API 提供更好的邏輯復用
- **Vite**: 極速開發體驗，HMR 快速，生產環境構建優化
- **TypeScript**: 型別安全，提升開發體驗與程式碼品質
- **Tailwind CSS**: 原子化 CSS，快速開發，易於維護

#### 後端技術棧
- **Firebase Auth**: 完整的身份驗證解決方案，支援多種登入方式
- **Firestore**: NoSQL 即時資料庫，適合快速開發與擴展
- **Firebase Storage**: 檔案儲存（視需求使用）
- **Firebase Functions**: Serverless 函數（視需求使用）

#### DevOps
- **Docker**: 容器化部署，環境一致性
- **Docker Compose**: 多容器編排，簡化開發與部署
- **Nginx**: Reverse proxy，統一 API 路由

## 目錄結構

```
project-root/
├── frontend/                    # 前端專案
│   ├── src/
│   │   ├── api/                # API 抽象層（核心設計）
│   │   │   ├── client.ts       # API 客戶端（統一介面）
│   │   │   ├── firebase/       # Firebase 實作
│   │   │   │   ├── auth.ts
│   │   │   │   ├── firestore.ts
│   │   │   │   └── storage.ts
│   │   │   ├── adapters/       # 未來可切換的適配器
│   │   │   │   └── django.ts   # Django 適配器範例
│   │   │   └── types.ts        # API 型別定義
│   │   ├── assets/             # 靜態資源
│   │   ├── components/         # Vue 元件
│   │   │   ├── common/         # 通用元件
│   │   │   └── features/       # 功能元件
│   │   ├── composables/        # Composition API 邏輯
│   │   ├── i18n/               # 國際化
│   │   │   ├── locales/
│   │   │   │   ├── zh-TW.ts
│   │   │   │   └── en.ts
│   │   │   └── index.ts
│   │   ├── router/             # Vue Router
│   │   ├── stores/             # Pinia 狀態管理
│   │   ├── styles/             # 全域樣式
│   │   ├── types/              # TypeScript 型別
│   │   ├── utils/              # 工具函數
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/                 # 公開靜態資源
│   ├── tests/                  # 測試檔案
│   │   ├── unit/               # 單元測試
│   │   ├── component/          # 元件測試
│   │   └── e2e/                # E2E 測試
│   ├── .env.development        # 開發環境變數
│   ├── .env.production         # 生產環境變數
│   ├── .env.example            # 環境變數範例
│   ├── docker-compose.dev.yml  # 開發環境 Docker Compose
│   ├── docker-compose.prod.yml # 生產環境 Docker Compose
│   ├── Dockerfile              # 前端 Dockerfile
│   ├── Dockerfile.dev          # 開發環境 Dockerfile
│   ├── nginx.conf              # Nginx 配置（開發）
│   ├── nginx.prod.conf         # Nginx 配置（生產）
│   ├── vite.config.ts          # Vite 配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── tailwind.config.js      # Tailwind 配置
│   ├── vitest.config.ts        # Vitest 配置
│   └── playwright.config.ts    # Playwright 配置
├── docs/                       # 專案說明與規格（架構、設定、實作紀錄）
├── docker-compose.dev.yml      # 根目錄開發環境編排
├── docker-compose.prod.yml     # 根目錄生產環境編排
├── .dockerignore
├── .gitignore
└── README.md
```

## 核心設計理念

### 1. API 抽象層設計（src/api/）

**設計目標**: 將 Firebase 的具體實作隱藏，提供統一的 RESTful 風格介面，未來可無縫切換到 Django 或其他後端。

**實作方式**:
- `src/api/client.ts`: 定義統一的 API 介面（如 `get()`, `post()`, `put()`, `delete()`）
- `src/api/firebase/`: Firebase 的具體實作
- `src/api/adapters/`: 其他後端的適配器（如 Django）

**範例**:
```typescript
// 使用方式（無論後端是什麼）
import { api } from '@/api/client'
const users = await api.get('/users')
const user = await api.post('/users', { name: 'John' })
```

**切換後端時**: 只需修改 `src/api/client.ts` 中的實作，所有業務邏輯無需變更。

### 2. 環境變數管理

**規則**:
- 前端只使用 `VITE_*` 前綴的環境變數（Vite 要求）
- 使用 `.env.development` 和 `.env.production` 分別管理不同環境
- `.env.example` 作為範本，不包含敏感資訊

**範例**:
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
```

### 3. Docker 策略

**開發環境**:
- 使用 `docker-compose.dev.yml`
- 掛載本地程式碼（volume mount），支援熱重載
- 包含前端開發伺服器、Nginx reverse proxy

**生產環境**:
- 使用 `docker-compose.prod.yml`
- 構建優化的靜態檔案
- Nginx 提供靜態檔案服務與 reverse proxy

### 4. Reverse Proxy 設計

**目的**: 統一 API 路由，避免 CORS 問題，未來切換後端時前端無需修改。

**配置**:
- `/api/*` → 後端 API（目前是 Firebase，未來可改為 Django）
- `/socket.io/*` → WebSocket 連接（如需要）
- 其他路徑 → 前端 SPA

### 5. 國際化（i18n）

**實作**: 使用 `vue-i18n`
- 支援 `zh-TW` 和 `en`
- 語言檔案放在 `src/i18n/locales/`
- 可擴展更多語言

### 6. 測試策略

**單元測試** (Vitest):
- 測試工具函數、composables、API 客戶端

**元件測試** (Vitest + Vue Test Utils):
- 測試 Vue 元件的邏輯與渲染

**E2E 測試** (Playwright):
- 測試完整使用者流程

## 部署流程

### 開發環境
```bash
docker-compose -f docker-compose.dev.yml up
```

### 生產環境
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 平台與模組路由（補充）

- 登入後預設進入 **`/hub`**（模組卡片入口）；**`/notes`、`/gis`、`/ar`** 等為模組殼層路由（`ModuleLayout` + 佔位頁），**`/manage/*`** 仍為後台與 RBAC 管理。
- 詳細路由與 Guard 行為見 [ROUTING_ARCHITECTURE.md](./ROUTING_ARCHITECTURE.md) 文末「補充」一節。
- **API 抽象層**（`src/api/`）未因模組掛載而改變；模組僅影響前端 Router／Layout／側欄資料來源切換。

## 未來擴展性

1. **切換後端**: 只需實作新的 adapter，修改 `src/api/client.ts`
2. **新增功能**: 遵循現有目錄結構，易於擴展
3. **微服務化**: API 抽象層已準備好支援多個後端服務
4. **SSR**: 可考慮加入 Nuxt 3（基於 Vue 3）

## 安全考量

1. 環境變數不提交到 Git
2. Firebase 配置使用環境變數
3. API 金鑰等敏感資訊僅在環境變數中
4. Docker 映像不包含敏感資訊


