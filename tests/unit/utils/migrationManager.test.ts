import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MigrationManager } from '@/utils/storage/migrationManager'
import type { RootModel } from '@/types/storage'

describe('MigrationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('needsMigration', () => {
    it('schemaVersionが未定義の場合、マイグレーションが必要と判定する', () => {
      const data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      expect(MigrationManager.needsMigration(data)).toBe(true)
    })

    it('schemaVersionが1未満の場合、マイグレーションが必要と判定する', () => {
      const data = {
        schemaVersion: 0,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      expect(MigrationManager.needsMigration(data)).toBe(true)
    })

    it('schemaVersionが1の場合、マイグレーションが不要と判定する', () => {
      const data: RootModel = {
        schemaVersion: 1,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      expect(MigrationManager.needsMigration(data)).toBe(false)
    })

    it('schemaVersionが1より大きい場合、マイグレーションが不要と判定する', () => {
      const data = {
        schemaVersion: 2,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      expect(MigrationManager.needsMigration(data)).toBe(false)
    })

    it('データがnullの場合、マイグレーションが必要と判定する', () => {
      expect(MigrationManager.needsMigration(null)).toBe(true)
    })

    it('データがundefinedの場合、マイグレーションが必要と判定する', () => {
      expect(MigrationManager.needsMigration(undefined)).toBe(true)
    })
  })

  describe('migrate', () => {
    it('同じバージョン間では何も変更しない', () => {
      const data: RootModel = {
        schemaVersion: 1,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      const result = MigrationManager.migrate(data, 1, 1)
      expect(result).toEqual(data)
    })

    it('バージョン0から1へのマイグレーションを実行する', () => {
      const v0Data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [
          {
            id: 'test-id',
            name: 'テストシート',
            order: 0,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        entities: {},
      }

      const result = MigrationManager.migrate(v0Data, 0, 1)

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toBe(v0Data.savedAt)
      expect(result.sheets).toEqual(v0Data.sheets)
      expect(result.entities).toEqual(v0Data.entities)
    })

    it('複数世代のマイグレーションチェーンを実行する', () => {
      const v0Data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      // 仮にバージョン0から3までのマイグレーションがある場合
      const result = MigrationManager.migrate(v0Data, 0, 3)

      expect(result.schemaVersion).toBe(3)
      expect(result.savedAt).toBe(v0Data.savedAt)
    })

    it('無効なデータに対してエラーを投げる', () => {
      const invalidData = null

      expect(() => {
        MigrationManager.migrate(invalidData, 0, 1)
      }).toThrow('Invalid data provided for migration')
    })

    it('fromVersionがtoVersionより大きい場合はエラーを投げる', () => {
      const data: RootModel = {
        schemaVersion: 1,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      expect(() => {
        MigrationManager.migrate(data, 2, 1)
      }).toThrow('Cannot migrate backwards')
    })

    it('マイグレーション関数が存在しない場合はデータをそのまま返す', () => {
      const data = {
        schemaVersion: 5,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      // バージョン5から6へのマイグレーション関数は存在しない想定
      const result = MigrationManager.migrate(data, 5, 6)

      expect(result.schemaVersion).toBe(6)
      expect(result.savedAt).toBe(data.savedAt)
      expect(result.sheets).toEqual(data.sheets)
      expect(result.entities).toEqual(data.entities)
    })
  })

  describe('migrateV0ToV1', () => {
    it('schemaVersionプロパティを追加する', () => {
      const v0Data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      const result = MigrationManager.migrateV0ToV1(v0Data)

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toBe(v0Data.savedAt)
      expect(result.sheets).toEqual(v0Data.sheets)
      expect(result.entities).toEqual(v0Data.entities)
    })

    it('既存のschemaVersionを上書きする', () => {
      const v0Data = {
        schemaVersion: 0,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }

      const result = MigrationManager.migrateV0ToV1(v0Data)

      expect(result.schemaVersion).toBe(1)
    })

    it('複雑なデータでもマイグレーションが正しく動作する', () => {
      const v0Data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [
          {
            id: 'sheet-1',
            name: 'シート1',
            order: 0,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
          {
            id: 'sheet-2',
            name: 'シート2',
            order: 1,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        entities: {
          'sheet-1': {
            id: 'sheet-1',
            name: 'シート1',
            order: 0,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        },
      }

      const result = MigrationManager.migrateV0ToV1(v0Data)

      expect(result.schemaVersion).toBe(1)
      expect(result.sheets).toEqual(v0Data.sheets)
      expect(result.entities).toEqual(v0Data.entities)
    })
  })
})