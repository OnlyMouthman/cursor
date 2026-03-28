# i18n 實作總結

## 已完成的功能

### 1. 語言選擇器組件 ✅
- 創建了 `LanguageSwitcher.vue` 組件
- 支援繁體中文和英文切換
- 顯示當前語言和國旗圖示
- 點擊外部自動關閉 dropdown
- 語言設定儲存到 localStorage

### 2. Header 整合 ✅
- 在 `AppHeader.vue` 中添加了語言選擇器
- 位置：UserMenu 左側
- 前台和後台共用

### 3. i18n 配置更新 ✅
- 支援從 localStorage 讀取語言設定
- 支援動態切換語言
- 預設語言：zh-TW

### 4. 完整的中英文翻譯 ✅

#### 已翻譯的內容：

**通用 (common)**
- welcome, hello, save, cancel, delete, edit, create, search
- loading, error, success, language, expand, collapse

**認證 (auth)**
- login, logout, register, email, password, confirmPassword
- loginWithGoogle, loggingIn, loginFailed, logoutFailed, user

**選單 (menu)**
- enterManage, backToFront, dashboard, userManagement, settings, manageTitle

**後台管理 (manage)**
- dashboard, totalUsers, todayVisits, systemStatus, normal

**頁面 (pages)**
- about, aboutDescription

### 5. 所有組件已更新 ✅

**已更新的組件：**
- ✅ `AppHeader.vue` - 添加語言選擇器
- ✅ `UserMenu.vue` - 所有文字使用 i18n
- ✅ `ManageSidebar.vue` - 選單項目使用 i18n
- ✅ `AuthView.vue` - 所有文字使用 i18n
- ✅ `DashboardView.vue` - 所有文字使用 i18n
- ✅ `HomeView.vue` - 已使用 i18n（檔案保留；目前未掛路由）
- ✅ `HubView.vue` - 系統入口文案（`hub.*`）
- ✅ `AboutView.vue` - 已使用 i18n

## 使用方式

### 語言切換
1. 點擊 Header 右側的語言選擇器
2. 選擇「繁體中文」或「English」
3. 語言設定會自動儲存到 localStorage
4. 重新載入頁面後會保持選擇的語言

### 添加新翻譯
1. 在 `frontend/src/i18n/locales/zh-TW.ts` 添加中文翻譯
2. 在 `frontend/src/i18n/locales/en.ts` 添加英文翻譯
3. 在組件中使用 `$t('key.path')` 或 `t('key.path')`

### 範例
```vue
<template>
  <div>
    <h1>{{ $t('common.welcome') }}</h1>
    <button>{{ $t('auth.login') }}</button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

// 在 script 中使用
const message = t('common.success')
</script>
```

## 語言檔案結構

```
i18n/
├── index.ts              # i18n 配置
└── locales/
    ├── zh-TW.ts          # 繁體中文
    └── en.ts             # 英文
```

## 語言選擇器功能

- **位置**：Header 右側，UserMenu 左側
- **顯示**：當前語言名稱 + 國旗圖示
- **功能**：
  - 點擊展開下拉選單
  - 選擇語言後自動切換
  - 設定儲存到 localStorage
  - 點擊外部自動關閉

## 注意事項

1. **語言持久化**：語言選擇會儲存到 localStorage，重新載入頁面後會保持
2. **預設語言**：如果 localStorage 沒有設定，會使用環境變數 `VITE_APP_LOCALE` 或預設 `zh-TW`
3. **動態更新**：切換語言後，所有使用 `$t()` 或 `t()` 的地方會自動更新

