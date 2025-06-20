import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSheetsStore } from '@/store/sheetsStore'
import { validateSheetName } from '@/types/sheet'

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

  describe('updateSheet', () => {
    beforeEach(() => {
      // テスト用のシートを3つ追加
      const { addSheet } = useSheetsStore.getState()
      addSheet('シート1')
      addSheet('シート2')
      addSheet('シート3')
    })

    it('updateSheet メソッドが存在する', () => {
      const { updateSheet } = useSheetsStore.getState()
      expect(typeof updateSheet).toBe('function')
    })

    it('指定IDのシート名を更新できる', () => {
      const { updateSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const targetSheetId = initialSheets[1].id
      const newName = '更新されたシート名'
      const validatedName = validateSheetName(newName)

      if (validatedName) {
        updateSheet(targetSheetId, validatedName)
      }

      const updatedSheets = useSheetsStore.getState().sheets
      const updatedSheet = updatedSheets.find(
        sheet => sheet.id === targetSheetId
      )

      expect(updatedSheet?.name).toBe(newName)
    })

    it('指定IDのシートのupdatedAtが更新される', () => {
      vi.useFakeTimers()

      const { updateSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const targetSheetId = initialSheets[0].id
      const initialUpdatedAt = initialSheets[0].updatedAt

      // 時間を進める
      vi.advanceTimersByTime(1000)

      const validatedName = validateSheetName('新しい名前')
      if (validatedName) {
        updateSheet(targetSheetId, validatedName)
      }

      const updatedSheets = useSheetsStore.getState().sheets
      const updatedSheet = updatedSheets.find(
        sheet => sheet.id === targetSheetId
      )

      expect(updatedSheet?.updatedAt).not.toBe(initialUpdatedAt)
      expect(updatedSheet?.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      vi.useRealTimers()
    })

    it('他のシートのプロパティは変更されない', () => {
      const { updateSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const targetSheetId = initialSheets[1].id
      const otherSheet1 = { ...initialSheets[0] }
      const otherSheet2 = { ...initialSheets[2] }

      const validatedName = validateSheetName('更新されたシート名')
      if (validatedName) {
        updateSheet(targetSheetId, validatedName)
      }

      const updatedSheets = useSheetsStore.getState().sheets
      const unchangedSheet1 = updatedSheets[0]
      const unchangedSheet2 = updatedSheets[2]

      expect(unchangedSheet1.name).toBe(otherSheet1.name)
      expect(unchangedSheet1.updatedAt).toBe(otherSheet1.updatedAt)
      expect(unchangedSheet1.createdAt).toBe(otherSheet1.createdAt)
      expect(unchangedSheet1.order).toBe(otherSheet1.order)

      expect(unchangedSheet2.name).toBe(otherSheet2.name)
      expect(unchangedSheet2.updatedAt).toBe(otherSheet2.updatedAt)
      expect(unchangedSheet2.createdAt).toBe(otherSheet2.createdAt)
      expect(unchangedSheet2.order).toBe(otherSheet2.order)
    })

    it('存在しないIDで更新を試行してもエラーにならない', () => {
      const { updateSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      // 存在しないIDで実行してもエラーにならない
      expect(() => {
        const validatedName = validateSheetName('新しい名前')
        if (validatedName) {
          updateSheet('non-existent-id', validatedName)
        }
      }).not.toThrow()

      // 元の配列が変更されない
      const unchangedSheets = useSheetsStore.getState().sheets
      expect(unchangedSheets).toEqual(initialSheets)
    })

    it('配列の順序が保持される', () => {
      const { updateSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const targetSheetId = initialSheets[1].id

      const validatedName = validateSheetName('更新されたシート名')
      if (validatedName) {
        updateSheet(targetSheetId, validatedName)
      }

      const updatedSheets = useSheetsStore.getState().sheets

      // 配列の長さが変わらない
      expect(updatedSheets).toHaveLength(3)

      // 順序が保持される
      expect(updatedSheets[0].name).toBe('シート1')
      expect(updatedSheets[1].name).toBe('更新されたシート名')
      expect(updatedSheets[2].name).toBe('シート3')

      // IDも正しく保持される
      expect(updatedSheets[0].id).toBe(initialSheets[0].id)
      expect(updatedSheets[1].id).toBe(initialSheets[1].id)
      expect(updatedSheets[2].id).toBe(initialSheets[2].id)
    })

    it('更新処理が配列の整合性を保つ', () => {
      const { updateSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const targetSheetId = initialSheets[1].id

      const validatedName = validateSheetName('更新されたシート名')
      if (validatedName) {
        updateSheet(targetSheetId, validatedName)
      }

      const updatedSheets = useSheetsStore.getState().sheets

      // すべてのシートが有効なプロパティを持つ
      updatedSheets.forEach(sheet => {
        expect(typeof sheet.id).toBe('string')
        expect(sheet.id).toBeTruthy()
        expect(typeof sheet.name).toBe('string')
        expect(typeof sheet.order).toBe('number')
        expect(sheet.createdAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        )
        expect(sheet.updatedAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        )
      })
    })
  })

  describe('removeSheet', () => {
    beforeEach(() => {
      // テスト用のシートを3つ追加
      const { addSheet } = useSheetsStore.getState()
      addSheet('シート1')
      addSheet('シート2')
      addSheet('シート3')
    })

    it('removeSheet メソッドが存在する', () => {
      const { removeSheet } = useSheetsStore.getState()
      expect(typeof removeSheet).toBe('function')
    })

    it('指定IDのシートを削除できる', () => {
      const { removeSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      // 2番目のシートのIDを取得
      const secondSheetId = initialSheets[1].id

      // シートを削除
      removeSheet(secondSheetId)

      const updatedSheets = useSheetsStore.getState().sheets

      // 配列の長さが1つ減っている
      expect(updatedSheets).toHaveLength(2)

      // 削除されたシートが存在しない
      expect(
        updatedSheets.find(sheet => sheet.id === secondSheetId)
      ).toBeUndefined()

      // 残りのシートが正しく存在する
      expect(updatedSheets[0].name).toBe('シート1')
      expect(updatedSheets[1].name).toBe('シート3')
    })

    it('削除後のorder値が削除前の順序を維持する（歯抜けOK）', () => {
      const { removeSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      // 2番目のシートを削除（order=1）
      const secondSheetId = initialSheets[1].id
      removeSheet(secondSheetId)

      const updatedSheets = useSheetsStore.getState().sheets

      // 残りのシートのorderが変更されない（歯抜けOK）
      expect(updatedSheets[0].order).toBe(0) // シート1
      expect(updatedSheets[1].order).toBe(2) // シート3
    })

    it('最初のシートを削除できる', () => {
      const { removeSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const firstSheetId = initialSheets[0].id
      removeSheet(firstSheetId)

      const updatedSheets = useSheetsStore.getState().sheets

      expect(updatedSheets).toHaveLength(2)
      expect(updatedSheets[0].name).toBe('シート2')
      expect(updatedSheets[1].name).toBe('シート3')
    })

    it('最後のシートを削除できる', () => {
      const { removeSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const lastSheetId = initialSheets[2].id
      removeSheet(lastSheetId)

      const updatedSheets = useSheetsStore.getState().sheets

      expect(updatedSheets).toHaveLength(2)
      expect(updatedSheets[0].name).toBe('シート1')
      expect(updatedSheets[1].name).toBe('シート2')
    })

    it('存在しないIDで削除を試行してもエラーにならない', () => {
      const { removeSheet } = useSheetsStore.getState()

      // 存在しないIDで実行してもエラーにならない
      expect(() => {
        removeSheet('non-existent-id')
      }).not.toThrow()

      // 元の配列が変更されない
      const unchangedSheets = useSheetsStore.getState().sheets
      expect(unchangedSheets).toHaveLength(3)
      expect(unchangedSheets[0].name).toBe('シート1')
      expect(unchangedSheets[1].name).toBe('シート2')
      expect(unchangedSheets[2].name).toBe('シート3')
    })

    it('すべてのシートを削除して空にできる', () => {
      const { removeSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      // すべてのシートを削除
      initialSheets.forEach(sheet => {
        removeSheet(sheet.id)
      })

      const emptySheets = useSheetsStore.getState().sheets
      expect(emptySheets).toHaveLength(0)
    })

    it('削除処理が配列の整合性を保つ', () => {
      const { removeSheet } = useSheetsStore.getState()
      const initialSheets = useSheetsStore.getState().sheets

      const secondSheetId = initialSheets[1].id
      removeSheet(secondSheetId)

      const updatedSheets = useSheetsStore.getState().sheets

      // すべてのシートが有効なプロパティを持つ
      updatedSheets.forEach(sheet => {
        expect(typeof sheet.id).toBe('string')
        expect(sheet.id).toBeTruthy()
        expect(typeof sheet.name).toBe('string')
        expect(sheet.name).toBeTruthy()
        expect(typeof sheet.order).toBe('number')
        expect(sheet.createdAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        )
        expect(sheet.updatedAt).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
        )
      })
    })
  })

  describe('localStorage永続化', () => {
    // この機能は複雑で実際の動作テストが困難なため、
    // 基本的な統合テストは除外し、主要コンポーネントの単体テストに注力する
    it.skip('localStorage永続化機能の統合テストは手動で確認', () => {
      // E2Eテストで実際のブラウザ環境での動作を確認する
      // ここでは基本的なAPIの存在のみを確認
      expect(typeof useSheetsStore.getState().addSheet).toBe('function')
      expect(typeof useSheetsStore.getState().removeSheet).toBe('function')
      expect(typeof useSheetsStore.getState().updateSheet).toBe('function')
      expect(typeof useSheetsStore.getState().reorderSheets).toBe('function')
    })
  })
})
