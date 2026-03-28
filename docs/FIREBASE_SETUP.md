# Firebase 設置指南

## 已完成的配置

✅ 已將您的 Firebase 配置填入 `.env.development` 和 `.env.production`

## 重要：啟用 Google 登入提供者

"CONFIGURATION_NOT_FOUND" 錯誤通常是因為 **Google 登入提供者沒有在 Firebase Console 中啟用**。

### 步驟 1：在 Firebase Console 啟用 Google 登入

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 選擇您的專案：`jerry-c-4243c`
3. 進入 **Authentication** > **Sign-in method**
4. 找到 **Google** 提供者
5. 點擊 **啟用** (Enable)
6. 設定 **專案支援電子郵件**（Project support email）
7. 點擊 **儲存** (Save)

### 步驟 2：設定授權網域

1. 在 **Authentication** > **Settings** > **Authorized domains**
2. 確認以下網域已加入：
   - `localhost`（開發環境）
   - 您的生產網域（如果有的話）

### 步驟 3：重新啟動開發伺服器

```bash
# 停止目前的伺服器（Ctrl+C）
# 然後重新啟動
npm run dev
# 或
docker-compose -f docker-compose.dev.yml up
```

## 驗證配置

### 檢查環境變數是否正確載入

在瀏覽器控制台（開發者工具）中，您應該會看到：
```
初始化 Firebase，專案 ID: jerry-c-4243c
```

如果看到錯誤訊息，請檢查：
1. `.env.development` 檔案是否存在於 `frontend/` 目錄
2. 檔案內容是否正確（沒有多餘的空格或引號）
3. 開發伺服器是否已重新啟動

## 常見問題

### Q: 仍然出現 "CONFIGURATION_NOT_FOUND" 錯誤

**A:** 請確認：
1. ✅ Google 登入提供者已在 Firebase Console 啟用
2. ✅ 環境變數檔案（`.env.development`）存在且格式正確
3. ✅ 開發伺服器已重新啟動（Vite 需要重啟才能載入新的環境變數）
4. ✅ 檢查瀏覽器控制台是否有配置錯誤訊息

### Q: 環境變數沒有載入

**A:** 
- Vite 只在啟動時載入環境變數
- 修改 `.env` 檔案後必須**重新啟動開發伺服器**
- 確認檔案名稱正確：`.env.development`（不是 `.env.development.local`）

### Q: 如何確認 Firebase 配置是否正確？

**A:** 在瀏覽器控制台執行：
```javascript
console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)
```
應該會顯示：`jerry-c-4243c`

## 測試登入

完成上述步驟後：
1. 重新啟動開發伺服器
2. 訪問應用程式
3. 點擊「Google 登入」按鈕
4. 應該會彈出 Google 登入視窗

## 下一步

登入功能正常後，您可以：
- 測試登入/登出流程
- 測試前後台切換
- 確認使用者資訊正確顯示

