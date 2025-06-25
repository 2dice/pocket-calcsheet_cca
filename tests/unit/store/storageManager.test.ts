import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageManager } from '@/utils/storage/storageManager'
import { MigrationManager } from '@/utils/storage/migrationManager'

describe('StorageManager', () => {
  beforeEach(() => {
    // localStorage をクリア
    localStorage.clear()
    // コンソールエラーのモックをクリア
    vi.clearAllMocks()
  })

  describe('getKey', () => {
    it('正しいキー形式を生成する', () => {
      const key = StorageManager.getKey(1)
      expect(key).toBe('pocket-calcsheet/1')
    })

    it('スキーマバージョンが変わると異なるキーを生成する', () => {
      const key1 = StorageManager.getKey(1)
      const key2 = StorageManager.getKey(2)
      expect(key1).toBe('pocket-calcsheet/1')
      expect(key2).toBe('pocket-calcsheet/2')
      expect(key1).not.toBe(key2)
    })
  })

  describe('save', () => {
    it('データをlocalStorageに保存できる', () => {
      const testData = { test: 'value' }
      const key = 'test-key'

      StorageManager.save(key, testData)

      const saved = localStorage.getItem(key)
      expect(saved).toBe(JSON.stringify(testData))
    })

    it('複雑なオブジェクトを保存できる', () => {
      const complexData = {
        schemaVersion: 1,
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

      StorageManager.save('complex-data', complexData)

      const saved = localStorage.getItem('complex-data')
      expect(saved).toBe(JSON.stringify(complexData))
    })

    it('JSON.stringifyエラー時にエラーを投げる', () => {
      // 循環参照オブジェクトを作成
      const circularData: { a: number; self?: unknown } = { a: 1 }
      circularData.self = circularData

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      expect(() => {
        StorageManager.save('circular-data', circularData)
      }).toThrow()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save to localStorage:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('localStorage容量超過時にエラーを投げる', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // localStorage.setItemがエラーを投げるようにモック
      const setItemSpy = vi
        .spyOn(Storage.prototype, 'setItem')
        .mockImplementation(() => {
          throw new Error('QuotaExceededError')
        })

      expect(() => {
        StorageManager.save('quota-test', { data: 'test' })
      }).toThrow('QuotaExceededError')

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save to localStorage:',
        expect.any(Error)
      )

      setItemSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('load', () => {
    it('保存されたデータを読み込める', () => {
      const testData = { test: 'value' }
      const key = 'load-test-key'

      // データを直接localStorageに保存
      localStorage.setItem(key, JSON.stringify(testData))

      const loaded = StorageManager.load(key)
      expect(loaded).toEqual(testData)
    })

    it('存在しないキーに対してnullを返す', () => {
      const loaded = StorageManager.load('non-existent-key')
      expect(loaded).toBeNull()
    })

    it('複雑なオブジェクトを読み込める', () => {
      const complexData = {
        schemaVersion: 1,
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

      localStorage.setItem('complex-load-test', JSON.stringify(complexData))

      const loaded = StorageManager.load('complex-load-test')
      expect(loaded).toEqual(complexData)
    })

    it('不正なJSONデータの場合nullを返す', () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // 不正なJSONを直接localStorageに保存
      localStorage.setItem('invalid-json', '{ invalid json }')

      const loaded = StorageManager.load('invalid-json')
      expect(loaded).toBeNull()

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load from localStorage:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('型指定して読み込める', () => {
      interface TestType {
        name: string
        value: number
      }

      const testData: TestType = { name: 'test', value: 42 }
      localStorage.setItem('typed-test', JSON.stringify(testData))

      const loaded = StorageManager.load<TestType>('typed-test')
      expect(loaded).toEqual(testData)
      expect(loaded?.name).toBe('test')
      expect(loaded?.value).toBe(42)
    })
  })

  describe('save and load integration', () => {
    it('データの保存と読み込みが正しく動作する', () => {
      const testData = {
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        sheets: [
          {
            id: 'integration-test-id',
            name: '統合テストシート',
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        entities: {},
      }

      const key = StorageManager.getKey(1)

      // 保存
      StorageManager.save(key, testData)

      // 読み込み
      const loaded = StorageManager.load(key)

      expect(loaded).toEqual(testData)
    })

    it('同じキーに対して上書き保存ができる', () => {
      const key = 'overwrite-test'
      const firstData = { version: 1 }
      const secondData = { version: 2 }

      // 最初のデータを保存
      StorageManager.save(key, firstData)
      let loaded = StorageManager.load(key)
      expect(loaded).toEqual(firstData)

      // 上書き保存
      StorageManager.save(key, secondData)
      loaded = StorageManager.load(key)
      expect(loaded).toEqual(secondData)
    })
  })

  describe('容量管理機能', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('使用容量を正しく計算する', () => {
      localStorage.setItem('test1', 'a'.repeat(1000))
      localStorage.setItem('test2', 'b'.repeat(2000))

      const usedSpace = StorageManager.getUsedSpace()
      // JSON.stringifyによるオーバーヘッドを考慮（キー + 値の両方のサイズ）
      // UTF-16考慮で2倍
      const expectedSize = ('test1'.length + 1000 + ('test2'.length + 2000)) * 2
      expect(usedSpace).toBe(expectedSize)
    })

    it('残容量を正しく計算する', () => {
      localStorage.setItem('test', 'x'.repeat(1000))

      const remainingSpace = StorageManager.getRemainingSpace()
      const usedSpace = StorageManager.getUsedSpace()
      const maxSpace = 5 * 1024 * 1024 * 0.9 // 5MB - 10%安全マージン

      expect(remainingSpace).toBe(Math.max(0, maxSpace - usedSpace))
    })

    it('保存前に容量チェックを行う - 保存可能な場合', () => {
      const smallData = { test: 'small' }
      const result = StorageManager.checkStorageQuota('test-key', smallData)
      expect(result).toBe(true)
    })

    it('保存前に容量チェックを行う - 容量超過の場合', () => {
      const largeData = 'x'.repeat(5 * 1024 * 1024) // 5MB
      const result = StorageManager.checkStorageQuota('test-key', largeData)
      expect(result).toBe(false)
    })

    it('容量チェック付き保存 - 正常系', () => {
      const testData = { test: 'value' }
      const key = 'quota-test-key'

      expect(() => {
        StorageManager.saveWithQuotaCheck(key, testData)
      }).not.toThrow()

      const saved = localStorage.getItem(key)
      expect(saved).toBe(JSON.stringify(testData))
    })

    it('容量チェック付き保存 - 容量超過時にエラー', () => {
      const largeData = { data: 'x'.repeat(5 * 1024 * 1024) } // 5MB
      const key = 'quota-exceeded-key'

      expect(() => {
        StorageManager.saveWithQuotaCheck(key, largeData)
      }).toThrow('Storage quota exceeded')
    })

    it('QuotaExceededErrorを正しく判定する - Chrome形式', () => {
      const chromeError = new DOMException(
        'QuotaExceededError',
        'QuotaExceededError'
      )
      expect(StorageManager.isQuotaExceededError(chromeError)).toBe(true)
    })

    it('QuotaExceededErrorを正しく判定する - Firefox形式', () => {
      const firefoxError = new DOMException(
        'NS_ERROR_DOM_QUOTA_REACHED',
        'NS_ERROR_DOM_QUOTA_REACHED'
      )
      expect(StorageManager.isQuotaExceededError(firefoxError)).toBe(true)
    })

    it('QuotaExceededErrorを正しく判定する - DOMException code 22', () => {
      const chromeCodeError = new DOMException('Quota exceeded')
      Object.defineProperty(chromeCodeError, 'code', {
        value: 22,
        configurable: true,
      })
      expect(StorageManager.isQuotaExceededError(chromeCodeError)).toBe(true)
    })

    it('QuotaExceededErrorを正しく判定する - DOMException code 1014', () => {
      const firefoxCodeError = new DOMException('Quota exceeded')
      Object.defineProperty(firefoxCodeError, 'code', {
        value: 1014,
        configurable: true,
      })
      expect(StorageManager.isQuotaExceededError(firefoxCodeError)).toBe(true)
    })

    it('QuotaExceededErrorを正しく判定する - 通常のError', () => {
      const normalError = new Error('Some other error')
      expect(StorageManager.isQuotaExceededError(normalError)).toBe(false)
    })

    it('QuotaExceededErrorを正しく判定する - null/undefined', () => {
      expect(StorageManager.isQuotaExceededError(null)).toBe(false)
      expect(StorageManager.isQuotaExceededError(undefined)).toBe(false)
      expect(StorageManager.isQuotaExceededError('string')).toBe(false)
    })

    it('JSON.stringify失敗時のcheckStorageQuotaのハンドリング', () => {
      // 循環参照オブジェクトを作成
      const circularData: { a: number; self?: unknown } = { a: 1 }
      circularData.self = circularData

      const result = StorageManager.checkStorageQuota('test-key', circularData)
      expect(result).toBe(false)
    })
  })
})

describe('MigrationManager', () => {
  describe('needsMigration', () => {
    it('schemaVersionが未定義の場合、マイグレーションが必要と判定する', () => {
      const data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      expect(MigrationManager.needsMigration(data)).toBe(true)
    })

    it('schemaVersionが0の場合、マイグレーションが必要と判定する', () => {
      const data = {
        schemaVersion: 0,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      expect(MigrationManager.needsMigration(data)).toBe(true)
    })

    it('schemaVersionが1の場合、マイグレーションが不要と判定する', () => {
      const data = {
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

    it('dataがnullの場合、マイグレーションが必要と判定する', () => {
      expect(MigrationManager.needsMigration(null)).toBe(true)
    })

    it('dataがundefinedの場合、マイグレーションが必要と判定する', () => {
      expect(MigrationManager.needsMigration(undefined)).toBe(true)
    })
  })

  describe('migrate', () => {
    it('バージョン0から1へのマイグレーションを実行する', () => {
      const v0Data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      const result = MigrationManager.migrate(v0Data, 0, 1)

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toBe(v0Data.savedAt)
      expect(result.sheets).toEqual(v0Data.sheets)
      expect(result.entities).toEqual(v0Data.entities)
    })

    it('同一バージョンの場合はそのまま返す', () => {
      const v1Data = {
        schemaVersion: 1,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      const result = MigrationManager.migrate(v1Data, 1, 1)

      expect(result).toEqual(v1Data)
    })

    it('複数バージョンをまたぐマイグレーションで未実装関数があればエラーを投げる', () => {
      const v0Data = {
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      expect(() => {
        MigrationManager.migrate(v0Data, 0, 2) // v1->v2のマイグレーション関数が存在しない
      }).toThrow('Migration function not found for version 1 to 2')
    })

    it('不正なデータ（null）でエラーを投げる', () => {
      expect(() => {
        MigrationManager.migrate(null, 0, 1)
      }).toThrow('Invalid data provided for migration: data must be an object')
    })

    it('不正なデータ（undefined）でエラーを投げる', () => {
      expect(() => {
        MigrationManager.migrate(undefined, 0, 1)
      }).toThrow('Invalid data provided for migration: data must be an object')
    })

    it('後方バージョンへのマイグレーションでエラーを投げる', () => {
      const v1Data = {
        schemaVersion: 1,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      expect(() => {
        MigrationManager.migrate(v1Data, 1, 0)
      }).toThrow('Cannot migrate backwards')
    })

    it('マイグレーション関数が存在しない場合、エラーを投げる', () => {
      const v0Data = {
        schemaVersion: 0,
        savedAt: '2023-01-01T00:00:00.000Z',
        sheets: [],
        entities: {},
      }
      expect(() => {
        MigrationManager.migrate(v0Data, 0, 3) // v2のマイグレーション関数が存在しない
      }).toThrow('Migration function not found for version 1 to 2')
    })

    it('オブジェクト以外のデータでエラーを投げる', () => {
      expect(() => {
        MigrationManager.migrate('string data', 0, 1)
      }).toThrow('Invalid data provided for migration: data must be an object')

      expect(() => {
        MigrationManager.migrate(123, 0, 1)
      }).toThrow('Invalid data provided for migration: data must be an object')
    })
  })

  describe('migrateV0ToV1', () => {
    it('バージョン0のデータをバージョン1に変換する', () => {
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

      const result = MigrationManager.migrateV0ToV1(v0Data)

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toBe(v0Data.savedAt)
      expect(result.sheets).toEqual(v0Data.sheets)
      expect(result.entities).toEqual(v0Data.entities)
    })

    it('部分的なデータでもデフォルト値を設定して変換する', () => {
      const partialData = {
        savedAt: '2023-01-01T00:00:00.000Z',
      }

      const result = MigrationManager.migrateV0ToV1(partialData)

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toBe(partialData.savedAt)
      expect(result.sheets).toEqual([])
      expect(result.entities).toEqual({})
    })

    it('savedAtが存在しない場合、現在時刻を設定する', () => {
      const dataWithoutSavedAt = {
        sheets: [],
        entities: {},
      }

      const beforeTime = new Date().toISOString()
      const result = MigrationManager.migrateV0ToV1(dataWithoutSavedAt)
      const afterTime = new Date().toISOString()

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
      expect(result.savedAt >= beforeTime).toBe(true)
      expect(result.savedAt <= afterTime).toBe(true)
      expect(result.sheets).toEqual([])
      expect(result.entities).toEqual({})
    })

    it('空のオブジェクトでもデフォルト値を設定して変換する', () => {
      const emptyData = {}

      const result = MigrationManager.migrateV0ToV1(emptyData)

      expect(result.schemaVersion).toBe(1)
      expect(result.savedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
      expect(result.sheets).toEqual([])
      expect(result.entities).toEqual({})
    })
  })
})
