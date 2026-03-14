/**
 * 使用者 API
 * 提供 RESTful 風格的統一介面
 * 
 * 設計理念：
 * 1. 隱藏 Firebase 的具體實作
 * 2. 提供 RESTful 風格的 API
 * 3. 未來可切換到其他後端
 */

import {
  createOrUpdateUser,
  getUser,
  getUsers,
  updateUserRole,
  updateUserRoleId,
  updateUserStatus,
  updateLastLogin,
  syncUserProfile
} from './firebase/users'
import type {
  UserDocument,
  UserListParams,
  UpdateUserRoleParams,
  UpdateUserRoleIdParams,
  UpdateUserStatusParams
} from '@/types/user'

/**
 * 使用者 API 介面
 */
export interface UsersAPI {
  /**
   * 取得使用者列表
   * @param params - 查詢參數（搜尋、篩選）
   * @returns 使用者列表
   */
  list(params?: UserListParams): Promise<UserDocument[]>

  /**
   * 取得單一使用者
   * @param uid - 使用者 ID
   * @returns 使用者文件或 null
   */
  get(uid: string): Promise<UserDocument | null>

  /**
   * 建立或更新使用者（用於首次登入或同步資料）
   * @param userData - 使用者資料
   * @param isNewUser - 是否為新使用者
   * @returns 使用者文件
   */
  createOrUpdate(
    userData: Partial<UserDocument> & { uid: string },
    isNewUser?: boolean
  ): Promise<UserDocument>

  /**
   * 更新使用者角色（以 slug 指定，相容舊版）
   */
  updateRole(params: UpdateUserRoleParams): Promise<void>

  /**
   * 更新使用者角色（RBAC：以 roleId 指定）
   */
  updateRoleId(params: UpdateUserRoleIdParams): Promise<void>

  /**
   * 更新使用者狀態（啟用/停用）
   * @param params - 更新參數
   */
  updateStatus(params: UpdateUserStatusParams): Promise<void>

  /**
   * 更新最後登入時間
   * @param uid - 使用者 ID
   */
  updateLastLogin(uid: string): Promise<void>

  /**
   * 同步使用者基本資料（從 Firebase Auth）
   * @param uid - 使用者 ID
   * @param profile - 基本資料
   */
  syncProfile(
    uid: string,
    profile: {
      displayName?: string | null
      photoURL?: string | null
      email?: string | null
    }
  ): Promise<void>
}

class UsersAPIImpl implements UsersAPI {
  async list(params?: UserListParams): Promise<UserDocument[]> {
    return await getUsers(params)
  }

  async get(uid: string): Promise<UserDocument | null> {
    return await getUser(uid)
  }

  async createOrUpdate(
    userData: Partial<UserDocument> & { uid: string },
    isNewUser = false
  ): Promise<UserDocument> {
    return await createOrUpdateUser(userData, isNewUser)
  }

  async updateRole(params: UpdateUserRoleParams): Promise<void> {
    return await updateUserRole(params)
  }

  async updateRoleId(params: UpdateUserRoleIdParams): Promise<void> {
    return await updateUserRoleId(params)
  }

  async updateStatus(params: UpdateUserStatusParams): Promise<void> {
    return await updateUserStatus(params)
  }

  async updateLastLogin(uid: string): Promise<void> {
    return await updateLastLogin(uid)
  }

  async syncProfile(
    uid: string,
    profile: {
      displayName?: string | null
      photoURL?: string | null
      email?: string | null
    }
  ): Promise<void> {
    return await syncUserProfile(uid, profile)
  }
}

export const usersAPI = new UsersAPIImpl()


