# 專案設置指南

## 快速開始

### 1. 環境準備

確保已安裝：
- Docker & Docker Compose
- Node.js 18+ (可選，用於本地開發)

### 2. 設置環境變數

**步驟 1**: 進入前端目錄
```bash
cd frontend
```

**步驟 2**: 創建環境變數檔案

如果專案中有 `.env.example` 檔案，可以複製它：

**Windows (PowerShell)**:
```powershell
Copy-Item .env.example .env.development
Copy-Item .env.example .env.production
```

**Windows (CMD)**:
```cmd
copy .env.example .env.development
copy .env.example .env.production
```

**Linux/Mac**:
```bash
cp .env.example .env.development
cp .env.example .env.production
```

**如果沒有 `.env.example` 檔案**，請手動創建 `.env.development` 和 `.env.production` 檔案，內容如下：

**`.env.development`** (開發環境):
```env
# Firebase 配置（開發環境）
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API 配置
VITE_API_BASE_URL=http://localhost:3000/api

# 應用配置
VITE_APP_TITLE=Web Application (Dev)
VITE_APP_LOCALE=zh-TW
```

**`.env.production`** (生產環境):
```env
# Firebase 配置（生產環境）
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API 配置
VITE_API_BASE_URL=https://your-domain.com/api

# 應用配置
VITE_APP_TITLE=Web Application
VITE_APP_LOCALE=zh-TW
```

**步驟 3**: 編輯這些檔案，填入實際的 Firebase 配置值

> **取得 Firebase 配置**:
> 1. 前往 [Firebase Console](https://console.firebase.google.com/)
> 2. 選擇或創建專案
> 3. 進入「專案設定」>「您的應用程式」
> 4. 複製配置值並填入環境變數檔案

### 3. 啟動開發環境

```bash
# 在專案根目錄
docker-compose -f docker-compose.dev.yml up
```

**訪問方式**：
- **通過 Nginx（推薦）**: http://localhost:8080
  - 可以測試 reverse proxy 功能
  - API 路由會正確代理
- **直接訪問 Vite 開發伺服器**: http://localhost:3000
  - 更快的 HMR（熱重載）
  - 適合純前端開發

> **注意**: 如果端口 8080 也被佔用，可以修改 `docker-compose.dev.yml` 中的端口映射，例如改為 `"8081:80"`

### 4. 構建生產環境

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 架構說明

### API 抽象層設計

**核心概念**: 所有資料存取都透過 `src/api/client.ts`，無論後端是 Firebase 還是 Django。

**使用範例**:

```typescript
import { api } from '@/api/client'

// 設定基礎路徑
api.setBasePath('users')

// 取得列表
const users = await api.get('', {
  params: {
    where: { status: 'active' },
    orderBy: 'createdAt:desc'
  }
})

// 取得單一文件
const user = await api.get('user-id-123')

// 新增
const newUser = await api.post('', { name: 'John' })

// 更新
await api.put('user-id-123', { name: 'Jane' })

// 刪除
await api.delete('user-id-123')
```

**切換後端**: 只需修改 `src/api/client.ts`，將 `firestoreClient` 替換為其他適配器（如 `djangoClient`）。

### Reverse Proxy 配置

Nginx 配置了以下路由：
- `/api/*` → 後端 API（目前是 Firebase，未來可改為 Django）
- `/socket.io/*` → WebSocket 連接
- 其他路徑 → 前端 SPA

### 國際化

使用 `vue-i18n`，支援：
- `zh-TW` (繁體中文)
- `en` (英文)

新增語言：
1. 在 `src/i18n/locales/` 新增語言檔案
2. 在 `src/i18n/index.ts` 註冊

### 測試策略

- **單元測試** (Vitest): 測試工具函數、composables
- **元件測試** (Vitest + Vue Test Utils): 測試 Vue 元件
- **E2E 測試** (Playwright): 測試完整使用者流程

## 目錄結構說明

```
project-root/
├── frontend/              # 前端專案
│   ├── src/
│   │   ├── api/          # ⭐ API 抽象層（核心）
│   │   │   ├── client.ts # 統一 API 介面
│   │   │   ├── firebase/ # Firebase 實作
│   │   │   └── adapters/ # 其他後端適配器
│   │   ├── components/   # Vue 元件
│   │   ├── composables/  # Composition API
│   │   ├── i18n/         # 國際化
│   │   ├── router/       # 路由
│   │   ├── stores/       # Pinia 狀態管理
│   │   └── views/        # 頁面
│   ├── tests/            # 測試檔案
│   └── Dockerfile        # Docker 配置
├── docker-compose.dev.yml # 開發環境
└── docker-compose.prod.yml # 生產環境
```

## 開發工作流程

1. **新增功能**:
   - 在 `src/views/` 新增頁面
   - 在 `src/components/` 新增元件
   - 在 `src/stores/` 新增狀態管理

2. **API 呼叫**:
   - 使用 `api` 客戶端（`src/api/client.ts`）
   - 不要直接使用 Firebase SDK

3. **樣式**:
   - 使用 Tailwind CSS 類別
   - 自訂樣式放在 `src/styles/`

4. **測試**:
   - 單元測試放在 `tests/unit/`
   - 元件測試放在 `tests/component/`
   - E2E 測試放在 `tests/e2e/`

## 常見問題

### Q: 如何切換到 Django 後端？

A: 修改 `src/api/client.ts`，將 `firestoreClient` 替換為 `djangoClient`（參考 `src/api/adapters/django.ts`）。

### Q: 環境變數不生效？

A: 確保：
1. 變數名稱以 `VITE_` 開頭
2. 重新啟動開發伺服器
3. 在 `vite.config.ts` 中正確配置

### Q: Docker 構建失敗？

A: 檢查：
1. Dockerfile 路徑是否正確
2. `.dockerignore` 是否正確配置
3. 環境變數是否正確設置

### Q: 端口 80 被佔用或權限不足？

A: 這是 Windows 上的常見問題。解決方案：
1. **開發環境**：已改為使用端口 8080，無需管理員權限
2. **如果 8080 也被佔用**：修改 `docker-compose.dev.yml`，將 `"8080:80"` 改為其他端口，如 `"8081:80"`
3. **釋放端口 80**（如果需要）：
   - 檢查是否有 IIS 運行：`Get-Service W3SVC`
   - 停止 IIS：`net stop w3svc`
   - 或檢查其他佔用端口的程序：`netstat -ano | findstr :80`

## 下一步

1. 設置 Firebase 專案並填入配置
2. 根據需求新增功能模組
3. 編寫測試
4. 部署到生產環境


