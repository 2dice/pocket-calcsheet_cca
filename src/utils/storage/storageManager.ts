const STORAGE_KEY_PREFIX = 'pocket-calcsheet'

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
}
