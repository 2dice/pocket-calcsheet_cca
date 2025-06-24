import type { RootModel } from '@/types/storage'

type MigrationFunction = (data: unknown) => RootModel

export class MigrationManager {
  public static readonly LATEST_SCHEMA_VERSION = 1

  private static migrations: Record<number, MigrationFunction> = {
    0: data => MigrationManager.migrateV0ToV1(data),
  }

  static migrate(
    data: unknown,
    fromVersion: number,
    toVersion: number
  ): RootModel {
    if (data === null || data === undefined || typeof data !== 'object') {
      throw new Error(
        'Invalid data provided for migration: data must be an object'
      )
    }

    if (fromVersion > toVersion) {
      throw new Error('Cannot migrate backwards')
    }

    let currentData = data
    let currentVersion = fromVersion

    while (currentVersion < toVersion) {
      const migration = this.migrations[currentVersion]
      if (!migration) {
        throw new Error(
          `Migration function not found for version ${currentVersion} to ${currentVersion + 1}`
        )
      }
      currentData = migration(currentData)
      currentVersion++
    }

    return currentData as RootModel
  }

  static needsMigration(data: unknown): boolean {
    if (data === null || data === undefined) {
      return true
    }

    const rootModel = data as Partial<RootModel>
    return (
      !rootModel.schemaVersion ||
      rootModel.schemaVersion < MigrationManager.LATEST_SCHEMA_VERSION
    )
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
