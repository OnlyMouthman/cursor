/**
 * Firestore 封裝
 * 提供 RESTful 風格的資料存取介面
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  type QueryConstraint,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore'
import { getFirebaseFirestore } from './config'
import type { ApiResponse, RequestConfig } from '../types'

/**
 * 將 Firestore 文件轉換為普通物件
 */
function docToData<T>(docSnap: QueryDocumentSnapshot<DocumentData>): T {
  return { id: docSnap.id, ...docSnap.data() } as T
}

/**
 * Firestore 實作的 API 客戶端
 */
class FirestoreApiClient {
  private basePath = ''

  /**
   * 設定基礎路徑（collection 名稱）
   */
  setBasePath(path: string): void {
    this.basePath = path
  }

  /**
   * 構建完整路徑
   */
  private getPath(path: string): string {
    return this.basePath ? `${this.basePath}/${path}` : path
  }

  /**
   * GET - 取得單一文件
   */
  async get<T = any>(path: string, _config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const firestore = getFirebaseFirestore()
      const docRef = doc(firestore, this.getPath(path))
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Document not found')
      }

      // DocumentSnapshot 轉換為 QueryDocumentSnapshot 的兼容類型
      return {
        data: { id: docSnap.id, ...docSnap.data() } as T
      }
    } catch (error: any) {
      return {
        data: null as any,
        error: error.message
      }
    }
  }

  /**
   * GET - 取得多個文件（列表）
   */
  async list<T = any>(path: string, config?: RequestConfig): Promise<ApiResponse<T[]>> {
    try {
      const firestore = getFirebaseFirestore()
      const collectionRef = collection(firestore, this.getPath(path))
      
      // 構建查詢條件
      const constraints: QueryConstraint[] = []
      
      if (config?.params) {
        // 支援 where 條件（簡化版）
        if (config.params.where) {
          Object.entries(config.params.where).forEach(([field, value]) => {
            constraints.push(where(field, '==', value))
          })
        }
        
        // 支援排序
        if (config.params.orderBy) {
          const [field, direction] = config.params.orderBy.split(':')
          constraints.push(orderBy(field, direction as 'asc' | 'desc'))
        }
        
        // 支援限制數量
        if (config.params.limit) {
          constraints.push(limit(config.params.limit))
        }
      }
      
      const q = query(collectionRef, ...constraints)
      const querySnapshot = await getDocs(q)
      
      const data = querySnapshot.docs.map(doc => docToData<T>(doc))

      return {
        data
      }
    } catch (error: any) {
      return {
        data: [],
        error: error.message
      }
    }
  }

  /**
   * POST - 新增文件
   */
  async post<T = any>(path: string, data?: any, _config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const firestore = getFirebaseFirestore()
      const collectionRef = collection(firestore, this.getPath(path))
      const docRef = await addDoc(collectionRef, data)

      // 取得新增的文件
      const docSnap = await getDoc(docRef)
      const result = docToData<T>(docSnap)

      return {
        data: result
      }
    } catch (error: any) {
      return {
        data: null as any,
        error: error.message
      }
    }
  }

  /**
   * PUT - 更新文件（完整替換）
   */
  async put<T = any>(path: string, data?: any, _config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const firestore = getFirebaseFirestore()
      const docRef = doc(firestore, this.getPath(path))
      await updateDoc(docRef, data)

      // 取得更新後的文件
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) {
        throw new Error('Document not found after update')
      }
      const result = { id: docSnap.id, ...docSnap.data() } as T

      return {
        data: result
      }
    } catch (error: any) {
      return {
        data: null as any,
        error: error.message
      }
    }
  }

  /**
   * PATCH - 部分更新文件
   */
  async patch<T = any>(path: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    // Firestore 的 updateDoc 就是部分更新
    return this.put<T>(path, data, config)
  }

  /**
   * DELETE - 刪除文件
   */
  async delete<T = any>(path: string, _config?: RequestConfig): Promise<ApiResponse<T>> {
    try {
      const firestore = getFirebaseFirestore()
      const docRef = doc(firestore, this.getPath(path))
      await deleteDoc(docRef)

      return {
        data: { success: true } as T
      }
    } catch (error: any) {
      return {
        data: null as any,
        error: error.message
      }
    }
  }
}

export const firestoreClient = new FirestoreApiClient()


