import { describe, it, expect, beforeEach } from 'vitest'
import { useSheetsStore } from '@/store/sheetsStore'

describe('SheetsStore', () => {
  // 各テストの前にストアをリセット
  beforeEach(() => {
    useSheetsStore.getState().reset?.()
  })

  describe('初期状態', () => {
    it('初期状態では空の配列を持つ', () => {
      const state = useSheetsStore.getState()
      expect(state.sheets).toEqual([])
    })
  })

  describe('addSheet', () => {
    it('新しいシートを追加できる', () => {
      const { addSheet } = useSheetsStore.getState()

      const testName = 'テストシート'
      addSheet(testName)

      const newSheets = useSheetsStore.getState().sheets
      expect(newSheets).toHaveLength(1)
      expect(newSheets[0].name).toBe(testName)
    })

    it('追加されたシートが正しいプロパティを持つ', () => {
      const { addSheet } = useSheetsStore.getState()

      const testName = 'プロパティテストシート'
      addSheet(testName)

      const newSheets = useSheetsStore.getState().sheets
      const addedSheet = newSheets[0]

      // IDが文字列で存在する
      expect(typeof addedSheet.id).toBe('string')
      expect(addedSheet.id).toBeTruthy()

      // 名前が正しく設定される
      expect(addedSheet.name).toBe(testName)

      // 順序が正しく設定される（最初なので0）
      expect(addedSheet.order).toBe(0)

      // 作成日時が ISO 8601 形式
      expect(addedSheet.createdAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      // 更新日時が ISO 8601 形式
      expect(addedSheet.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      // 作成日時と更新日時が同じ
      expect(addedSheet.createdAt).toBe(addedSheet.updatedAt)
    })

    it('複数のシートを追加すると順序が正しく設定される', () => {
      const { addSheet } = useSheetsStore.getState()

      addSheet('シート1')
      addSheet('シート2')
      addSheet('シート3')

      const newSheets = useSheetsStore.getState().sheets
      expect(newSheets).toHaveLength(3)

      expect(newSheets[0].order).toBe(0)
      expect(newSheets[1].order).toBe(1)
      expect(newSheets[2].order).toBe(2)

      expect(newSheets[0].name).toBe('シート1')
      expect(newSheets[1].name).toBe('シート2')
      expect(newSheets[2].name).toBe('シート3')
    })

    it('各シートのIDが一意である', () => {
      const { addSheet } = useSheetsStore.getState()

      addSheet('シートA')
      addSheet('シートB')
      addSheet('シートC')

      const newSheets = useSheetsStore.getState().sheets
      const ids = newSheets.map(sheet => sheet.id)

      // Set を使って重複をチェック
      expect(new Set(ids).size).toBe(ids.length)
    })
  })
})
