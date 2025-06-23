const STORAGE_KEY_PREFIX = 'pocket-calcsheet'

export interface StorageQuotaInfo {
  usage: number
  quota: number
  percentage: number
}

export class StorageManager {
  static getKey(schemaVersion: number): string {
    return `${STORAGE_KEY_PREFIX}/${schemaVersion}`
  }

  static save(key: string, data: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      throw error
    }
  }

  static load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  static remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from localStorage:', error)
      throw error
    }
  }

  static async checkStorageQuota(): Promise<StorageQuotaInfo> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const percentage = quota > 0 ? (usage / quota) * 100 : 0

        return {
          usage,
          quota,
          percentage,
        }
      }
    } catch (error) {
      console.error('Failed to check storage quota:', error)
    }

    return {
      usage: 0,
      quota: 0,
      percentage: 0,
    }
  }
}
