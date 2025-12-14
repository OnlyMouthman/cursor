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

  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  }

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


