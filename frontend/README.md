# 前端專案

## 技術棧

- Vue 3 + Composition API
- Vite
- TypeScript
- Tailwind CSS
- Vue Router
- Pinia
- Vue I18n
- Firebase

## 專案結構

```
src/
├── api/              # API 抽象層（核心設計）
│   ├── client.ts     # 統一 API 客戶端
│   ├── firebase/     # Firebase 實作
│   └── adapters/     # 其他後端適配器
├── components/       # Vue 元件
├── composables/      # Composition API 邏輯
├── i18n/             # 國際化
├── router/           # 路由配置
├── stores/           # Pinia 狀態管理
├── styles/           # 全域樣式
├── types/            # TypeScript 型別
├── utils/            # 工具函數
└── views/            # 頁面元件
```

## API 使用方式

### 基本使用

```typescript
import { api } from '@/api/client'

// 設定基礎路徑（collection 名稱）
api.setBasePath('users')

// 取得列表
const response = await api.get('', {
  params: {
    where: { status: 'active' },
    orderBy: 'createdAt:desc',
    limit: 10
  }
})

// 取得單一文件
const user = await api.get('user-id-123')

// 新增文件
const newUser = await api.post('', {
  name: 'John',
  email: 'john@example.com'
})

// 更新文件
await api.put('user-id-123', {
  name: 'Jane'
})

// 刪除文件
await api.delete('user-id-123')
```

### 認證使用

```typescript
import { authService } from '@/api/firebase/auth'

// 登入
await authService.signIn('user@example.com', 'password')

// 註冊
await authService.signUp('user@example.com', 'password')

// 登出
await authService.signOut()

// 取得當前使用者
const user = await authService.getCurrentUser()
```

## 環境變數

所有環境變數必須以 `VITE_` 開頭。

複製 `.env.example` 並填入實際值：

```bash
cp .env.example .env.development
```

## 開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 構建生產版本
npm run build

# 預覽生產構建
npm run preview
```

## 測試

```bash
# 單元測試
npm run test:unit

# 元件測試
npm run test:component

# E2E 測試
npm run test:e2e
```

## Docker

### 開發環境

```bash
docker-compose -f docker-compose.dev.yml up
```

### 生產環境

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```


