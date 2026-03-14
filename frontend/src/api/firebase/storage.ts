/**
 * Firebase Storage 封裝
 * 提供檔案上傳/下載介面
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { getFirebaseStorage } from './config'

export interface StorageService {
  uploadFile(path: string, file: File): Promise<string>
  uploadFileResumable(
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string>
  getFileURL(path: string): Promise<string>
  deleteFile(path: string): Promise<void>
}

class FirebaseStorageService implements StorageService {
  async uploadFile(path: string, file: File): Promise<string> {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    const snapshot = await uploadBytes(storageRef, file)
    return await getDownloadURL(snapshot.ref)
  }

  async uploadFileResumable(
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          onProgress?.(progress)
        },
        (error) => {
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadURL)
        }
      )
    })
  }

  async getFileURL(path: string): Promise<string> {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    return await getDownloadURL(storageRef)
  }

  async deleteFile(path: string): Promise<void> {
    const storage = getFirebaseStorage()
    const storageRef = ref(storage, path)
    await deleteObject(storageRef)
  }
}

export const storageService = new FirebaseStorageService()


