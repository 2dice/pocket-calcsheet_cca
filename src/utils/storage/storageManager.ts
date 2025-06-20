import type { RootModel, StorageConfig } from '@/types/storage'
import { QuotaExceededError } from '@/types/storage'

/**
 * ストレージ管理クラス
 * localStorage操作の抽象化とエラーハンドリングを提供
 */
export class StorageManager {
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
  }

  /**
   * localStorage保存キーを生成
   */
  private getStorageKey(): string {
    return `${this.config.keyPrefix}/${this.config.currentSchemaVersion}`
  }

  /**
   * 持続的ストレージの許可を要求
   * @returns 許可が得られたかどうか
   */
  async requestPersistentStorage(): Promise<boolean> {
    try {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist()
        console.log(`Persistent storage: ${persistent ? 'granted' : 'denied'}`)
        return persistent
      } else {
        console.warn('Persistent storage API not supported')
        return false
      }
    } catch (error) {
      console.error('Failed to request persistent storage:', error)
      return false
    }
  }

  /**
   * ストレージ使用量を取得
   * @returns 使用量情報（取得できない場合は null）
   */
  async getStorageEstimate(): Promise<{
    usage: number
    quota: number
    usagePercentage: number
  } | null> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate()
        const usage = estimate.usage || 0
        const quota = estimate.quota || 0
        const usagePercentage = quota > 0 ? (usage / quota) * 100 : 0

        return {
          usage,
          quota,
          usagePercentage,
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get storage estimate:', error)
      return null
    }
  }

  /**
   * データをlocalStorageに保存
   * @param data 保存するデータ
   * @throws QuotaExceededError localStorage容量超過時
   */
  save(data: RootModel): void {
    try {
      const key = this.getStorageKey()
      const json = JSON.stringify(data)
      console.log(`[StorageManager] Saving to key: ${key}`) // デバッグ用
      localStorage.setItem(key, json)
      console.log(`[StorageManager] Saved successfully`) // デバッグ用
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        throw new QuotaExceededError(
          'localStorage容量を超過しました。不要なデータを削除してください。'
        )
      }
      throw error
    }
  }

  /**
   * localStorageからデータを読み込み
   * @returns 読み込んだデータ（存在しない場合は null）
   */
  load(): RootModel | null {
    try {
      const key = this.getStorageKey()
      console.log(`[StorageManager] Loading from key: ${key}`) // デバッグ用
      const json = localStorage.getItem(key)
      if (!json) {
        console.log(`[StorageManager] No data found for key: ${key}`) // デバッグ用
        return null
      }
      console.log(`[StorageManager] Data loaded successfully`) // デバッグ用
      return JSON.parse(json) as RootModel
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  /**
   * 指定されたスキーマバージョンのデータが存在するかチェック
   * @param schemaVersion チェックするスキーマバージョン
   * @returns データの存在有無
   */
  exists(schemaVersion?: number): boolean {
    try {
      const version = schemaVersion || this.config.currentSchemaVersion
      const key = `${this.config.keyPrefix}/${version}`
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.error('Failed to check localStorage existence:', error)
      return false
    }
  }

  /**
   * 旧バージョンのデータを読み込み
   * @param schemaVersion 読み込むスキーマバージョン
   * @returns 読み込んだデータ（存在しない場合は null）
   */
  loadLegacyData(schemaVersion: number): unknown {
    try {
      const key = `${this.config.keyPrefix}/${schemaVersion}`
      const json = localStorage.getItem(key)
      if (!json) {
        return null
      }
      return JSON.parse(json)
    } catch (error) {
      console.error(
        `Failed to load legacy data (version ${schemaVersion}):`,
        error
      )
      return null
    }
  }

  /**
   * localStorageをクリア（現在のキーのみ）
   */
  clear(): void {
    try {
      const key = this.getStorageKey()
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Failed to clear localStorage:', error)
    }
  }

  /**
   * 全てのバージョンのデータをクリア
   */
  clearAll(): void {
    try {
      // localStorage全体をスキャンして該当キーを削除
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.config.keyPrefix)) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.error('Failed to clear all localStorage data:', error)
    }
  }
}

/**
 * デフォルトのストレージマネージャーインスタンス
 */
export const defaultStorageManager = new StorageManager({
  keyPrefix: 'pocket-calcsheet',
  currentSchemaVersion: 1,
})
