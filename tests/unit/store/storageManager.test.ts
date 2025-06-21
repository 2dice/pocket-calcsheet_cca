import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageManager } from '@/utils/storage/storageManager'

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
})
