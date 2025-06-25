const STORAGE_KEY_PREFIX = 'pocket-calcsheet'

export class StorageManager {
  // localStorage容量制限（5MB - 保守的な値）
  private static readonly STORAGE_QUOTA = 5 * 1024 * 1024

  // 安全マージン（10%）
  private static readonly SAFETY_MARGIN = 0.1

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

  static getUsedSpace(): number {
    let totalSize = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        const value = localStorage.getItem(key)
        if (value !== null) {
          // キーと値の両方のサイズを計算
          totalSize += key.length + value.length
        }
      }
    }
    // UTF-16を考慮（1文字2バイト）
    return totalSize * 2
  }

  static getRemainingSpace(): number {
    const maxSpace = this.STORAGE_QUOTA * (1 - this.SAFETY_MARGIN)
    return Math.max(0, maxSpace - this.getUsedSpace())
  }

  static checkStorageQuota(key: string, data: unknown): boolean {
    try {
      const serialized = JSON.stringify(data)
      const newDataSize = (key.length + serialized.length) * 2

      // 既存データがある場合は差分を計算
      const existingItem = localStorage.getItem(key)
      const existingSize = existingItem
        ? (key.length + existingItem.length) * 2
        : 0
      const deltaSize = newDataSize - existingSize

      // 差分が残容量以下かチェック
      return deltaSize <= this.getRemainingSpace()
    } catch {
      return false
    }
  }

  static saveWithQuotaCheck(key: string, data: unknown): void {
    if (!this.checkStorageQuota(key, data)) {
      const error = new Error('Storage quota exceeded')
      error.name = 'QuotaExceededError'
      throw error
    }

    this.save(key, data)
  }

  static isQuotaExceededError(error: unknown): boolean {
    if (!(error instanceof Error || error instanceof DOMException)) {
      return false
    }

    return (
      // Chrome/Safari
      error.name === 'QuotaExceededError' ||
      (error instanceof DOMException && error.code === 22) ||
      // Firefox
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      (error instanceof DOMException && error.code === 1014)
    )
  }
}
