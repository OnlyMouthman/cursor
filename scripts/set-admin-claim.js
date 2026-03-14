/**
 * 為指定 UID 設定 Firebase Custom Claim role: 'admin'
 * 用於 Firestore 規則「讀取其他使用者」時不超過 get() 次數限制。
 *
 * 使用方式：
 * 1. Firebase Console → 專案設定 → 服務帳戶 → 產生新的私密金鑰，下載 JSON，存成 scripts/serviceAccountKey.json（勿提交到 Git）
 * 2. 在專案根目錄執行：
 *    node scripts/set-admin-claim.js <使用者UID>
 * 或設定環境變數 GOOGLE_APPLICATION_CREDENTIALS 指向金鑰 JSON 路徑後執行。
 */

import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const uid = process.argv[2]
if (!uid) {
  console.error('用法: node scripts/set-admin-claim.js <使用者UID>')
  process.exit(1)
}

if (!admin.apps.length) {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || join(__dirname, 'serviceAccountKey.json')
  if (!existsSync(keyPath)) {
    console.error('請設定 GOOGLE_APPLICATION_CREDENTIALS 或將服務帳戶金鑰存為 scripts/serviceAccountKey.json')
    process.exit(1)
  }
  const key = JSON.parse(readFileSync(keyPath, 'utf8'))
  admin.initializeApp({ credential: admin.credential.cert(key) })
}

const auth = admin.auth()
auth
  .setCustomUserClaims(uid, { role: 'admin' })
  .then(() => {
    console.log('已設定 Custom Claim: role = admin，UID =', uid)
    console.log('請讓該使用者重新登入後，「管理使用者」列表才會正常顯示。')
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
