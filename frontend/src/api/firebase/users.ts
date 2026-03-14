/**
 * Firebase Users API 實作
 * 處理使用者資料的 CRUD 操作
 */

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  type DocumentData,
  type QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { getFirebaseFirestore } from './config'
import type {
  UserDocument,
  UserListParams,
  UpdateUserRoleParams,
  UpdateUserStatusParams
} from '@/types/user'

/**
 * 將 Firestore 文件轉換為 UserDocument
 */
function docToUser(docSnap: QueryDocumentSnapshot<DocumentData>): UserDocument {
  const data = docSnap.data()
  return {
    uid: docSnap.id,
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || '',
    role: data.role || 'viewer',
    status: data.status || 'active',
    createdAt: data.createdAt?.toDate() || new Date(),
    lastLoginAt: data.lastLoginAt?.toDate() || null,
    permissions: data.permissions || []
  } as UserDocument
}

/**
 * 建立或更新使用者文件
 * 
 * @param userData - 使用者資料
 * @param isNewUser - 是否為新使用者（決定是否設定 createdAt）
 */
export async function createOrUpdateUser(
  userData: Partial<UserDocument> & { uid: string },
  isNewUser = false
): Promise<UserDocument> {
  const firestore = getFirebaseFirestore()
  const userRef = doc(firestore, 'users', userData.uid)

  const data: any = {
    uid: userData.uid,
    email: userData.email || '',
    displayName: userData.displayName || '',
    photoURL: userData.photoURL || '',
    role: userData.role || 'viewer',
    status: userData.status || 'active',
    lastLoginAt: serverTimestamp()
  }

  if (isNewUser) {
    data.createdAt = serverTimestamp()
  }

  await setDoc(userRef, data, { merge: true })

  // 取得更新後的文件
  const docSnap = await getDoc(userRef)
  if (!docSnap.exists()) {
    throw new Error('Failed to create user document')
  }

  return docToUser(docSnap as QueryDocumentSnapshot<DocumentData>)
}

/**
 * 取得使用者文件
 */
export async function getUser(uid: string): Promise<UserDocument | null> {
  const firestore = getFirebaseFirestore()
  const userRef = doc(firestore, 'users', uid)
  const docSnap = await getDoc(userRef)

  if (!docSnap.exists()) {
    return null
  }

  return docToUser(docSnap as QueryDocumentSnapshot<DocumentData>)
}

/**
 * 取得使用者列表
 */
export async function getUsers(params?: UserListParams): Promise<UserDocument[]> {
  const firestore = getFirebaseFirestore()
  const usersRef = collection(firestore, 'users')

  // 構建查詢
  const constraints: any[] = []

  // 角色篩選
  if (params?.role) {
    constraints.push(where('role', '==', params.role))
  }

  // 狀態篩選
  if (params?.status) {
    constraints.push(where('status', '==', params.status))
  }

  // 排序
  constraints.push(orderBy('createdAt', 'desc'))

  const q = query(usersRef, ...constraints)
  const querySnapshot = await getDocs(q)

  let users = querySnapshot.docs.map(doc => docToUser(doc))

  // 前端搜尋（displayName 或 email）
  if (params?.search) {
    const searchLower = params.search.toLowerCase()
    users = users.filter(user =>
      user.displayName.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    )
  }

  return users
}

/**
 * 更新使用者角色
 * 注意：Firestore Security Rules 會檢查權限
 */
export async function updateUserRole(params: UpdateUserRoleParams): Promise<void> {
  const firestore = getFirebaseFirestore()
  const userRef = doc(firestore, 'users', params.uid)

  // Firestore Security Rules 會檢查：
  // 1. 只有 admin 可以更新 role
  // 2. 不能更新自己的 role
  await updateDoc(userRef, {
    role: params.role
  })
}

/**
 * 更新使用者狀態
 * 注意：Firestore Security Rules 會檢查權限
 */
export async function updateUserStatus(params: UpdateUserStatusParams): Promise<void> {
  const firestore = getFirebaseFirestore()
  const userRef = doc(firestore, 'users', params.uid)

  // Firestore Security Rules 會檢查：
  // 1. 只有 admin 可以更新 status
  // 2. 不能更新自己的 status（不能把自己設為 disabled）
  await updateDoc(userRef, {
    status: params.status
  })
}

/**
 * 更新使用者最後登入時間
 */
export async function updateLastLogin(uid: string): Promise<void> {
  const firestore = getFirebaseFirestore()
  const userRef = doc(firestore, 'users', uid)

  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp()
  })
}

/**
 * 同步使用者基本資料（從 Firebase Auth）
 */
export async function syncUserProfile(
  uid: string,
  profile: {
    displayName?: string | null
    photoURL?: string | null
    email?: string | null
  }
): Promise<void> {
  const firestore = getFirebaseFirestore()
  const userRef = doc(firestore, 'users', uid)

  const updates: any = {}
  if (profile.displayName !== undefined) {
    updates.displayName = profile.displayName || ''
  }
  if (profile.photoURL !== undefined) {
    updates.photoURL = profile.photoURL || ''
  }
  if (profile.email !== undefined) {
    updates.email = profile.email || ''
  }

  if (Object.keys(updates).length > 0) {
    await updateDoc(userRef, updates)
  }
}

