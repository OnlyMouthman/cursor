/**
 * Firebase Auth 封裝
 * 提供統一的認證介面
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type UserCredential
} from 'firebase/auth'
import { getFirebaseAuth } from './config'

export type { FirebaseUser }

export interface AuthService {
  signIn(email: string, password: string): Promise<UserCredential>
  signUp(email: string, password: string): Promise<UserCredential>
  signOut(): Promise<void>
  getCurrentUser(): Promise<FirebaseUser | null>
  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void
}

class FirebaseAuthService implements AuthService {
  async signIn(email: string, password: string): Promise<UserCredential> {
    const auth = getFirebaseAuth()
    return await signInWithEmailAndPassword(auth, email, password)
  }

  async signUp(email: string, password: string): Promise<UserCredential> {
    const auth = getFirebaseAuth()
    return await createUserWithEmailAndPassword(auth, email, password)
  }

  async signOut(): Promise<void> {
    const auth = getFirebaseAuth()
    return await signOut(auth)
  }

  async getCurrentUser(): Promise<User | null> {
    const auth = getFirebaseAuth()
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe()
        resolve(user)
      })
    })
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    const auth = getFirebaseAuth()
    return onAuthStateChanged(auth, callback)
  }
}

export const authService = new FirebaseAuthService()

