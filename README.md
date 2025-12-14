# Web 專案

基於 Vue 3 + Vite + TypeScript + Tailwind + Firebase 的全端 Web 應用。

## 技術棧

- **前端**: Vue 3, Vite, TypeScript, Tailwind CSS
- **後端**: Firebase (Auth, Firestore, Storage, Functions)
- **容器化**: Docker, Docker Compose
- **測試**: Vitest, Vue Test Utils, Playwright
- **國際化**: vue-i18n

## 快速開始

### 前置需求

- Docker & Docker Compose
- Node.js 18+ (本地開發可選)

### 開發環境

1. 複製環境變數檔案：
```bash
cp frontend/.env.example frontend/.env.development
```

2. 編輯 `frontend/.env.development`，填入 Firebase 配置

3. 啟動開發環境：
```bash
docker-compose -f docker-compose.dev.yml up
```

4. 訪問 http://localhost:8080（通過 Nginx）或 http://localhost:3000（直接訪問 Vite）

### 生產環境

1. 複製環境變數檔案：
```bash
cp frontend/.env.example frontend/.env.production
```

2. 編輯 `frontend/.env.production`，填入生產環境配置

3. 構建並啟動：
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 專案結構

詳見 [ARCHITECTURE.md](./ARCHITECTURE.md)

## 開發指南

### API 使用

所有 API 呼叫應透過 `src/api/client.ts`：

```typescript
import { api } from '@/api/client'

// GET 請求
const users = await api.get('/users')

// POST 請求
const newUser = await api.post('/users', { name: 'John' })
```

### 新增語言

1. 在 `src/i18n/locales/` 新增語言檔案
2. 在 `src/i18n/index.ts` 註冊新語言

### 測試

```bash
# 單元測試
npm run test:unit

# 元件測試
npm run test:component

# E2E 測試
npm run test:e2e
```

## 環境變數

所有環境變數必須以 `VITE_` 開頭（Vite 要求）。

詳見 `frontend/.env.example`


