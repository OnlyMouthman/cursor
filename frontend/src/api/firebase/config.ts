/**
 * Firebase 配置
 * 從環境變數讀取配置
 */

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

let app: FirebaseApp | null = null
let auth: Auth | null = null
let firestore: Firestore | null = null
let storage: FirebaseStorage | null = null

export function initFirebase(): {
  app: FirebaseApp
  auth: Auth
  firestore: Firestore
  storage: FirebaseStorage
} {
  if (app) {
    return { app, auth: auth!, firestore: firestore!, storage: storage! }
  }

  // 從環境變數讀取配置
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID
  const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
  const appId = import.meta.env.VITE_FIREBASE_APP_ID

  // 驗證配置是否完整
  if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
    const missing = []
    if (!apiKey) missing.push('VITE_FIREBASE_API_KEY')
    if (!authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN')
    if (!projectId) missing.push('VITE_FIREBASE_PROJECT_ID')
    if (!storageBucket) missing.push('VITE_FIREBASE_STORAGE_BUCKET')
    if (!messagingSenderId) missing.push('VITE_FIREBASE_MESSAGING_SENDER_ID')
    if (!appId) missing.push('VITE_FIREBASE_APP_ID')
    
    console.error('Firebase 配置不完整，缺少以下環境變數：', missing)
    throw new Error(`Firebase 配置錯誤：缺少環境變數 ${missing.join(', ')}。請檢查 .env.development 或 .env.production 檔案。`)
  }

  const config = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  }

  console.log('初始化 Firebase，專案 ID:', projectId)

  app = initializeApp(config)
  auth = getAuth(app)
  firestore = getFirestore(app)
  storage = getStorage(app)

  return { app, auth, firestore, storage }
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebase()
  }
  return auth!
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    initFirebase()
  }
  return firestore!
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    initFirebase()
  }
  return storage!
}


