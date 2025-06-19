import type { RootModel, MigrationFunction } from '@/types/storage'
import { StorageManager } from './storageManager'

/**
 * スキーママイグレーション管理クラス
 * 将来のスキーマ変更に対応できるマイグレーション機構を提供
 */
export class MigrationManager {
  public storageManager: StorageManager
  private migrations: Record<number, MigrationFunction> = {}

  constructor(storageManager: StorageManager) {
    this.storageManager = storageManager
    this.registerMigrations()
  }

  /**
   * マイグレーション関数を登録
   */
  private registerMigrations(): void {
    // 将来のマイグレーション関数をここに追加
    // 例: this.migrations[2] = this.migrateV1ToV2
    // 例: this.migrations[3] = this.migrateV2ToV3
  }

  /**
   * データの読み込みとマイグレーション実行
   * @returns マイグレーション済みのデータ（存在しない場合は null）
   */
  loadWithMigration(): RootModel | null {
    // 現在のバージョンのデータを試行
    const currentData = this.storageManager.load()
    if (currentData) {
      return this.validateAndMigrate(currentData)
    }

    // 旧バージョンからのマイグレーションを試行
    return this.loadFromLegacyVersions()
  }

  /**
   * 旧バージョンからのデータ読み込みとマイグレーション
   * @returns マイグレーション済みのデータ（存在しない場合は null）
   */
  private loadFromLegacyVersions(): RootModel | null {
    // 現在のバージョンから逆順で旧バージョンをチェック
    const currentVersion = 1 // TODO: configから取得するように変更
    
    for (let version = currentVersion - 1; version >= 1; version--) {
      const legacyData = this.storageManager.loadLegacyData(version)
      if (legacyData) {
        console.log(`Legacy data found at version ${version}, migrating...`)
        return this.migrateFromVersion(legacyData, version)
      }
    }

    return null
  }

  /**
   * 指定されたバージョンからのマイグレーション実行
   * @param data マイグレーション元データ
   * @param fromVersion マイグレーション元バージョン
   * @returns マイグレーション済みデータ
   */
  private migrateFromVersion(data: unknown, fromVersion: number): RootModel {
    let currentData: unknown = data
    const currentVersion = 1 // TODO: configから取得するように変更

    // 段階的にマイグレーションを実行
    for (let version = fromVersion + 1; version <= currentVersion; version++) {
      const migrationFn = this.migrations[version]
      if (!migrationFn) {
        throw new Error(`Migration function not found for version ${version}`)
      }
      currentData = migrationFn(currentData)
      console.log(`Migrated data to version ${version}`)
    }

    // マイグレーション完了後、新しいバージョンで保存
    this.storageManager.save(currentData as RootModel)
    console.log('Migration completed and saved')

    return currentData as RootModel
  }

  /**
   * データの検証とマイグレーション実行
   * @param data 検証対象データ
   * @returns 検証・マイグレーション済みデータ
   */
  private validateAndMigrate(data: RootModel): RootModel {
    // スキーマバージョンチェック
    if (!this.isValidRootModel(data)) {
      throw new Error('Invalid root model structure')
    }

    const currentVersion = 1 // TODO: configから取得するように変更
    
    // 現在のバージョンと一致している場合はそのまま返す
    if (data.schemaVersion === currentVersion) {
      return data
    }

    // 新しいバージョンのデータの場合（通常は発生しない）
    if (data.schemaVersion > currentVersion) {
      console.warn(
        `Data schema version (${data.schemaVersion}) is newer than current version (${currentVersion})`
      )
      return data
    }

    // 旧バージョンからのマイグレーション
    return this.migrateFromVersion(data, data.schemaVersion)
  }

  /**
   * RootModelの基本構造を検証
   * @param data 検証対象データ
   * @returns 有効かどうか
   */
  private isValidRootModel(data: unknown): data is RootModel {
    if (!data || typeof data !== 'object') {
      return false
    }

    const obj = data as Record<string, unknown>
    return Boolean(
      typeof obj.schemaVersion === 'number' &&
      typeof obj.savedAt === 'string' &&
      Array.isArray(obj.sheets) &&
      obj.entities && typeof obj.entities === 'object'
    )
  }

  /**
   * 初期データの作成
   * @returns 初期のRootModel
   */
  createInitialData(): RootModel {
    return {
      schemaVersion: 1,
      savedAt: new Date().toISOString(),
      sheets: [],
      entities: {},
    }
  }

  // 将来のマイグレーション関数の例
  // private migrateV1ToV2(data: any): RootModel {
  //   // バージョン1からバージョン2へのマイグレーション処理
  //   return {
  //     ...data,
  //     schemaVersion: 2,
  //     // 新しいフィールドの追加や既存フィールドの変更
  //   }
  // }
}

/**
 * デフォルトのマイグレーションマネージャーインスタンス
 */
export const defaultMigrationManager = new MigrationManager(
  new StorageManager({
    keyPrefix: 'pocket-calcsheet',
    currentSchemaVersion: 1,
  })
)