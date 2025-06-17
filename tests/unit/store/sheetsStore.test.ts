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

  describe('reorderSheets', () => {
    beforeEach(() => {
      // テスト用のシートを3つ追加
      const { addSheet } = useSheetsStore.getState()
      addSheet('シート1')
      addSheet('シート2')
      addSheet('シート3')
    })

    it('reorderSheets メソッドが存在する', () => {
      const { reorderSheets } = useSheetsStore.getState()
      expect(typeof reorderSheets).toBe('function')
    })

    it('シートの順序を正しく入れ替える（前から後ろへ）', () => {
      const { reorderSheets } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      // 最初のシートのIDを取得
      const firstSheetId = initialSheets[0].id
      const thirdSheetId = initialSheets[2].id

      // 最初のシートを最後に移動
      reorderSheets(firstSheetId, thirdSheetId)

      const reorderedSheets = useSheetsStore.getState().sheets

      // 順序が正しく変更されていることを確認
      expect(reorderedSheets[0].name).toBe('シート2')
      expect(reorderedSheets[1].name).toBe('シート3')
      expect(reorderedSheets[2].name).toBe('シート1')

      // order プロパティが正しく更新されていることを確認
      expect(reorderedSheets[0].order).toBe(0)
      expect(reorderedSheets[1].order).toBe(1)
      expect(reorderedSheets[2].order).toBe(2)
    })

    it('シートの順序を正しく入れ替える（後ろから前へ）', () => {
      const { reorderSheets } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      // 最後のシートのIDを取得
      const firstSheetId = initialSheets[0].id
      const thirdSheetId = initialSheets[2].id

      // 最後のシートを最初に移動
      reorderSheets(thirdSheetId, firstSheetId)

      const reorderedSheets = useSheetsStore.getState().sheets

      // 順序が正しく変更されていることを確認
      expect(reorderedSheets[0].name).toBe('シート3')
      expect(reorderedSheets[1].name).toBe('シート1')
      expect(reorderedSheets[2].name).toBe('シート2')

      // order プロパティが正しく更新されていることを確認
      expect(reorderedSheets[0].order).toBe(0)
      expect(reorderedSheets[1].order).toBe(1)
      expect(reorderedSheets[2].order).toBe(2)
    })

    it('隣接するシートの入れ替えが正しく動作する', () => {
      const { reorderSheets } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const firstSheetId = initialSheets[0].id
      const secondSheetId = initialSheets[1].id

      // 隣接するシートを入れ替え
      reorderSheets(firstSheetId, secondSheetId)

      const reorderedSheets = useSheetsStore.getState().sheets

      // 順序が正しく変更されていることを確認
      expect(reorderedSheets[0].name).toBe('シート2')
      expect(reorderedSheets[1].name).toBe('シート1')
      expect(reorderedSheets[2].name).toBe('シート3')
    })

    it('存在しないIDで並び替えを試行してもエラーにならない', () => {
      const { reorderSheets } = useSheetsStore.getState()

      // 存在しないIDで実行してもエラーにならない
      expect(() => {
        reorderSheets('non-existent-id', 'another-non-existent-id')
      }).not.toThrow()

      // 元の順序が保持されている
      const sheets = useSheetsStore.getState().sheets
      expect(sheets[0].name).toBe('シート1')
      expect(sheets[1].name).toBe('シート2')
      expect(sheets[2].name).toBe('シート3')
    })

    it('同じIDで並び替えを試行してもエラーにならない', () => {
      const { reorderSheets } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets
      const firstSheetId = initialSheets[0].id

      // 同じIDで実行してもエラーにならない
      expect(() => {
        reorderSheets(firstSheetId, firstSheetId)
      }).not.toThrow()

      // 元の順序が保持されている
      const sheets = useSheetsStore.getState().sheets
      expect(sheets[0].name).toBe('シート1')
      expect(sheets[1].name).toBe('シート2')
      expect(sheets[2].name).toBe('シート3')
    })

    it('配列の整合性が保たれる', () => {
      const { reorderSheets } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const firstSheetId = initialSheets[0].id
      const thirdSheetId = initialSheets[2].id

      reorderSheets(firstSheetId, thirdSheetId)

      const reorderedSheets = useSheetsStore.getState().sheets

      // 配列の長さが変わらない
      expect(reorderedSheets).toHaveLength(3)

      // すべてのIDが保持されている
      const originalIds = initialSheets.map(sheet => sheet.id).sort()
      const reorderedIds = reorderedSheets.map(sheet => sheet.id).sort()
      expect(reorderedIds).toEqual(originalIds)

      // すべてのorderが連続した値になっている
      const orders = reorderedSheets.map(sheet => sheet.order).sort()
      expect(orders).toEqual([0, 1, 2])
    })
  })
})
