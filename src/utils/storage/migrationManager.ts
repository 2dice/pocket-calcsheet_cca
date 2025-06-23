import type { RootModel } from '@/types/storage'

type MigrationFunction = (data: unknown) => RootModel

export class MigrationManager {
  private static migrations: Record<number, MigrationFunction> = {
    0: data => MigrationManager.migrateV0ToV1(data),
  }

  static migrate(
    data: unknown,
    fromVersion: number,
    toVersion: number
  ): RootModel {
    if (data === null || data === undefined) {
      throw new Error('Invalid data provided for migration')
    }

    if (fromVersion > toVersion) {
      throw new Error('Cannot migrate backwards')
    }

    let currentData = data
    let currentVersion = fromVersion

    while (currentVersion < toVersion) {
      const migration = this.migrations[currentVersion]
      if (migration) {
        currentData = migration(currentData)
      } else {
        // マイグレーション関数が存在しない場合、schemaVersionのみ更新
        const dataObj = currentData as Partial<RootModel>
        currentData = {
          ...dataObj,
          schemaVersion: currentVersion + 1,
        }
      }
      currentVersion++
    }

    return currentData as RootModel
  }

  static needsMigration(data: unknown): boolean {
    if (data === null || data === undefined) {
      return true
    }

    const rootModel = data as Partial<RootModel>
    return !rootModel.schemaVersion || rootModel.schemaVersion < 1
  }

  static migrateV0ToV1(data: unknown): RootModel {
    const dataObj = data as Partial<RootModel>

    return {
      schemaVersion: 1,
      savedAt: dataObj.savedAt || new Date().toISOString(),
      sheets: dataObj.sheets || [],
      entities: dataObj.entities || {},
    }
  }
}
