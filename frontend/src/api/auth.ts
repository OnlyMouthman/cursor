/**
 * Auth API
 * 封裝認證相關的 API 呼叫
 * 不直接使用 Firebase SDK，透過 authService
 */

import { authService } from './firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'

export interface AuthAPI {
  signInWithGoogle(): Promise<FirebaseUser>
  signOut(): Promise<void>
  getCurrentUser(): Promise<FirebaseUser | null>
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void
}

class AuthAPIImpl implements AuthAPI {
  /**
   * Google 登入
   */
  async signInWithGoogle(): Promise<FirebaseUser> {
    const result = await authService.signInWithGoogle()
    return result.user
  }

  async signOut(): Promise<void> {
    return await authService.signOut()
  }

  async getCurrentUser(): Promise<FirebaseUser | null> {
    return await authService.getCurrentUser()
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    return authService.onAuthStateChange(callback)
  }
}

export const authAPI = new AuthAPIImpl()

