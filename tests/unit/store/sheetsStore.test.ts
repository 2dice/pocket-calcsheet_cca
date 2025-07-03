import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSheetsStore } from '@/store/sheetsStore'
import { validateSheetName } from '@/types/sheet'

describe('SheetsStore', () => {
  // 各テストの前にストアをリセット
  beforeEach(() => {
    useSheetsStore.getState().reset?.()
  })

  describe('ルートモデル構造', () => {
    it('初期状態が正しく設定される', () => {
      const { schemaVersion, savedAt, sheets, entities } =
        useSheetsStore.getState()
      expect(schemaVersion).toBe(1)
      expect(typeof savedAt).toBe('string')
      expect(savedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
      expect(sheets).toEqual([])
      expect(entities).toEqual({})
    })

    it('addSheetでsheetsとentitiesが同期される', () => {
      const { addSheet } = useSheetsStore.getState()
      addSheet('新しいシート')

      const { sheets, entities } = useSheetsStore.getState()
      expect(sheets).toHaveLength(1)
      expect(entities[sheets[0].id]).toBeDefined()
      expect(entities[sheets[0].id].name).toBe('新しいシート')
    })

    it('removeSheetでsheetsとentitiesが同期される', () => {
      const { addSheet, removeSheet } = useSheetsStore.getState()
      addSheet('テストシート')

      const { sheets: beforeSheets } = useSheetsStore.getState()
      const sheetId = beforeSheets[0].id

      removeSheet(sheetId)

      const { sheets, entities } = useSheetsStore.getState()
      expect(sheets).toHaveLength(0)
      expect(entities[sheetId]).toBeUndefined()
    })

    it('updateSheetでsheetsとentitiesが同期される', () => {
      const { addSheet, updateSheet } = useSheetsStore.getState()
      addSheet('元の名前')

      const { sheets: beforeSheets } = useSheetsStore.getState()
      const sheetId = beforeSheets[0].id

      const validatedName = validateSheetName('新しい名前')
      if (validatedName) {
        updateSheet(sheetId, validatedName)
      }

      const { sheets, entities } = useSheetsStore.getState()
      expect(sheets[0].name).toBe('新しい名前')
      expect(entities[sheetId].name).toBe('新しい名前')
    })

    it('savedAtがアクション実行時に更新される', () => {
      vi.useFakeTimers()

      const initialState = useSheetsStore.getState()
      const initialSavedAt = initialState.savedAt

      // 少し時間を置いてからアクションを実行
      vi.advanceTimersByTime(10)

      const { addSheet } = useSheetsStore.getState()
      addSheet('テストシート')

      const updatedState = useSheetsStore.getState()
      expect(updatedState.savedAt).not.toBe(initialSavedAt)
      expect(updatedState.savedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      vi.useRealTimers()
    })
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
    beforeEach(() => {
      // localStorageをクリア
      localStorage.clear()
    })

    it('ストアの変更がlocalStorageに保存される', () => {
      vi.useFakeTimers()
      const { addSheet } = useSheetsStore.getState()
      addSheet('永続化テスト')

      // persistミドルウェアの非同期処理を即座に実行
      vi.runAllTimers()

      const key = 'pocket-calcsheet/1'
      const saved = localStorage.getItem(key)
      expect(saved).toBeTruthy()

      if (saved) {
        const parsedData = JSON.parse(saved) as {
          state: {
            schemaVersion: number
            sheets: Array<{ name: string }>
          }
        }
        expect(parsedData.state.schemaVersion).toBe(1)
        expect(parsedData.state.sheets).toHaveLength(1)
        expect(parsedData.state.sheets[0].name).toBe('永続化テスト')
      }

      vi.useRealTimers()
    })

    it('アプリ起動時にlocalStorageからデータが復元される', async () => {
      // 事前にlocalStorageにテストデータを保存
      const testData = {
        state: {
          schemaVersion: 1,
          savedAt: new Date().toISOString(),
          sheets: [
            {
              id: 'test-restore-id',
              name: '復元テストシート',
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          entities: {
            'test-restore-id': {
              id: 'test-restore-id',
              name: '復元テストシート',
              order: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        },
        version: 0,
      }

      // localStorageに直接データを保存
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(testData))

      // persist.rehydrateを使用してハイドレーション実行
      await useSheetsStore.persist.rehydrate()

      const { sheets, entities } = useSheetsStore.getState()
      expect(sheets).toHaveLength(1)
      expect(sheets[0].name).toBe('復元テストシート')
      expect(entities['test-restore-id']).toBeDefined()
      expect(entities['test-restore-id'].name).toBe('復元テストシート')
    })

    it('複数の操作後にデータが正しく永続化される', () => {
      vi.useFakeTimers()
      const { addSheet, updateSheet, reorderSheets } = useSheetsStore.getState()

      // 複数のシートを追加
      addSheet('シート1')
      addSheet('シート2')
      addSheet('シート3')

      const { sheets: initialSheets } = useSheetsStore.getState()

      // 名前を更新
      const validatedName = validateSheetName('更新されたシート1')
      if (validatedName) {
        updateSheet(initialSheets[0].id, validatedName)
      }

      // 順序を変更
      reorderSheets(initialSheets[0].id, initialSheets[2].id)

      // persistミドルウェアの非同期処理を即座に実行
      vi.runAllTimers()

      const key = 'pocket-calcsheet/1'
      const saved = localStorage.getItem(key)
      expect(saved).toBeTruthy()

      if (saved) {
        const parsedData = JSON.parse(saved) as {
          state: {
            sheets: Array<{ name: string }>
            entities: Record<string, unknown>
          }
        }
        const savedState = parsedData.state

        expect(savedState.sheets).toHaveLength(3)
        expect(savedState.sheets[2].name).toBe('更新されたシート1')
        expect(Object.keys(savedState.entities)).toHaveLength(3)
      }

      vi.useRealTimers()
    })

    it('削除操作が永続化される', () => {
      vi.useFakeTimers()
      const { addSheet, removeSheet } = useSheetsStore.getState()

      // シートを追加
      addSheet('削除対象シート')
      addSheet('残すシート')

      const { sheets: beforeSheets } = useSheetsStore.getState()
      const deleteTargetId = beforeSheets[0].id

      // シートを削除
      removeSheet(deleteTargetId)

      // persistミドルウェアの非同期処理を即座に実行
      vi.runAllTimers()

      const key = 'pocket-calcsheet/1'
      const saved = localStorage.getItem(key)
      expect(saved).toBeTruthy()

      if (saved) {
        const parsedData = JSON.parse(saved) as {
          state: {
            sheets: Array<{ name: string }>
            entities: Record<string, unknown>
          }
        }
        const savedState = parsedData.state

        expect(savedState.sheets).toHaveLength(1)
        expect(savedState.sheets[0].name).toBe('残すシート')
        expect(savedState.entities[deleteTargetId]).toBeUndefined()
        expect(Object.keys(savedState.entities)).toHaveLength(1)
      }

      vi.useRealTimers()
    })

    it('savedAtフィールドが操作時に更新される', () => {
      vi.useFakeTimers()
      const { addSheet } = useSheetsStore.getState()

      const beforeSavedAt = useSheetsStore.getState().savedAt

      // 時間を進める
      vi.advanceTimersByTime(10)

      addSheet('savedAtテスト')

      const afterSavedAt = useSheetsStore.getState().savedAt
      expect(afterSavedAt).not.toBe(beforeSavedAt)

      // persistミドルウェアの非同期処理を即座に実行
      vi.runAllTimers()

      const key = 'pocket-calcsheet/1'
      const saved = localStorage.getItem(key)
      expect(saved).toBeTruthy()

      if (saved) {
        const parsedData = JSON.parse(saved) as {
          state: { savedAt: string }
        }
        expect(parsedData.state.savedAt).toBe(afterSavedAt)
      }

      vi.useRealTimers()
    })
  })

  describe('Zustandマイグレーション統合', () => {
    beforeEach(() => {
      // localStorageをクリア
      localStorage.clear()
    })

    it('旧データが自動的にマイグレーションされる', async () => {
      // 旧形式データをlocalStorageに設定（schemaVersionなし）
      const oldData = {
        state: {
          savedAt: '2023-01-01T00:00:00.000Z',
          sheets: [
            {
              id: 'test-migration-id',
              name: 'マイグレーションテスト',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          ],
          entities: {
            'test-migration-id': {
              id: 'test-migration-id',
              name: 'マイグレーションテスト',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(oldData))

      // ストアをリハイドレート（importを再実行相当）
      await useSheetsStore.persist.rehydrate()

      // マイグレーション後のデータを確認
      const state = useSheetsStore.getState()
      expect(state.schemaVersion).toBe(1)
      expect(state.sheets).toHaveLength(1)
      expect(state.sheets[0].name).toBe('マイグレーションテスト')
      expect(state.entities['test-migration-id']).toBeDefined()
    })

    it('最新データはマイグレーションされない', async () => {
      // 最新形式データを設定（schemaVersion: 1）
      const latestData = {
        state: {
          schemaVersion: 1,
          savedAt: '2023-01-01T00:00:00.000Z',
          sheets: [
            {
              id: 'test-latest-id',
              name: '最新データテスト',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          ],
          entities: {
            'test-latest-id': {
              id: 'test-latest-id',
              name: '最新データテスト',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(latestData))

      // ストア初期化とデータ確認
      await useSheetsStore.persist.rehydrate()

      const state = useSheetsStore.getState()
      expect(state.schemaVersion).toBe(1)
      expect(state.sheets).toHaveLength(1)
      expect(state.sheets[0].name).toBe('最新データテスト')
      expect(state.entities['test-latest-id']).toBeDefined()
    })

    it('マイグレーションエラー時は初期状態にフォールバックする', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      // 不正なデータをlocalStorageに設定
      const invalidData = {
        state: 'invalid-data-structure', // オブジェクトではない
        version: 0,
      }
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(invalidData))

      // ストアをリハイドレート
      await useSheetsStore.persist.rehydrate()

      // フォールバック後のデータを確認
      const state = useSheetsStore.getState()
      expect(state.schemaVersion).toBe(1)
      expect(state.sheets).toEqual([])
      expect(state.entities).toEqual({})
      expect(state.savedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      // エラーがコンソールに出力されることを確認
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Migration failed:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })

    it('空のlocalStorageからの起動は正常動作する', async () => {
      // localStorageは既にbeforeEachでクリア済み

      // ストアをリハイドレート
      await useSheetsStore.persist.rehydrate()

      // 初期状態が設定されることを確認
      const state = useSheetsStore.getState()
      expect(state.schemaVersion).toBe(1)
      expect(state.sheets).toEqual([])
      expect(state.entities).toEqual({})
      expect(state.savedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )
    })

    it('部分的なデータでもマイグレーションされる', async () => {
      // 部分的な旧形式データをlocalStorageに設定
      const partialData = {
        state: {
          savedAt: '2023-01-01T00:00:00.000Z',
          // sheetsとentitiesが存在しない
        },
        version: 0,
      }
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(partialData))

      // ストアをリハイドレート
      await useSheetsStore.persist.rehydrate()

      // デフォルト値が設定されることを確認
      const state = useSheetsStore.getState()
      expect(state.schemaVersion).toBe(1)
      expect(state.savedAt).toBe('2023-01-01T00:00:00.000Z')
      expect(state.sheets).toEqual([])
      expect(state.entities).toEqual({})
    })

    it('複数のシートを含む旧データのマイグレーション', async () => {
      // 複数シートを含む旧形式データ
      const oldDataWithMultipleSheets = {
        state: {
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
            'sheet-2': {
              id: 'sheet-2',
              name: 'シート2',
              order: 1,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        version: 0,
      }
      localStorage.setItem(
        'pocket-calcsheet/1',
        JSON.stringify(oldDataWithMultipleSheets)
      )

      // ストアをリハイドレート
      await useSheetsStore.persist.rehydrate()

      // 全てのシートがマイグレーションされることを確認
      const state = useSheetsStore.getState()
      expect(state.schemaVersion).toBe(1)
      expect(state.sheets).toHaveLength(2)
      expect(state.sheets[0].name).toBe('シート1')
      expect(state.sheets[1].name).toBe('シート2')
      expect(state.entities['sheet-1']).toBeDefined()
      expect(state.entities['sheet-2']).toBeDefined()
    })
  })

  describe('ストレージエラーハンドリング', () => {
    beforeEach(() => {
      useSheetsStore.getState().reset?.()
      // ストレージエラー状態をリセット
      useSheetsStore.getState().setStorageError(false)
    })

    it('初期状態でstorageErrorがfalse', () => {
      const { storageError } = useSheetsStore.getState()
      expect(storageError).toBe(false)
    })

    it('setStorageErrorでエラー状態を変更できる', () => {
      const { setStorageError } = useSheetsStore.getState()

      setStorageError(true)
      expect(useSheetsStore.getState().storageError).toBe(true)

      setStorageError(false)
      expect(useSheetsStore.getState().storageError).toBe(false)
    })

    it('容量超過時にaddSheetがエラー状態を設定する', async () => {
      // StorageManagerの容量チェックをスパイして失敗させる
      const { StorageManager } = await import('@/utils/storage/storageManager')
      const checkStorageQuotaSpy = vi
        .spyOn(StorageManager, 'checkStorageQuota')
        .mockReturnValue(false)

      const { addSheet } = useSheetsStore.getState()

      // addSheetを実行（容量チェックが失敗する）
      addSheet('容量超過テストシート')

      // ストレージエラー状態がtrueになることを確認
      expect(useSheetsStore.getState().storageError).toBe(true)

      // シートが追加されていないことを確認
      expect(useSheetsStore.getState().sheets).toHaveLength(0)

      // スパイを復元
      checkStorageQuotaSpy.mockRestore()
    })
  })

  describe('Formula機能', () => {
    beforeEach(() => {
      const { addSheet } = useSheetsStore.getState()
      addSheet('Formulaテストシート')
    })

    it('updateFormulaDataアクションが存在する', () => {
      const { updateFormulaData } = useSheetsStore.getState()
      expect(typeof updateFormulaData).toBe('function')
    })

    it('新規シート作成時にformulaDataが初期化される', () => {
      const { addSheet } = useSheetsStore.getState()
      addSheet('新規Formulaシート')

      const { sheets, entities } = useSheetsStore.getState()
      const newSheet = sheets[sheets.length - 1]
      const entity = entities[newSheet.id]

      expect(entity.formulaData).toBeDefined()
      expect(entity.formulaData.inputExpr).toBe('')
      expect(entity.formulaData.result).toBeNull()
      expect(entity.formulaData.error).toBeNull()
    })

    it('updateFormulaDataで数式データが更新される', () => {
      const { updateFormulaData } = useSheetsStore.getState()
      const { sheets } = useSheetsStore.getState()
      const sheetId = sheets[0].id

      const testFormula = '2 + 3 * 4\n+ 5'
      updateFormulaData(sheetId, { inputExpr: testFormula })

      const { entities } = useSheetsStore.getState()
      const updatedSheet = entities[sheetId]

      expect(updatedSheet.formulaData.inputExpr).toBe(testFormula)
      expect(updatedSheet.formulaData.result).toBeNull() // 本ステップでは未使用
      expect(updatedSheet.formulaData.error).toBeNull() // 本ステップでは未使用
    })

    it('updateFormulaDataで部分的な更新が可能', () => {
      const { updateFormulaData } = useSheetsStore.getState()
      const { sheets } = useSheetsStore.getState()
      const sheetId = sheets[0].id

      // 初期データを設定
      updateFormulaData(sheetId, {
        inputExpr: '初期式',
        result: 42,
        error: '初期エラー',
      })

      // inputExprのみ更新
      updateFormulaData(sheetId, { inputExpr: '更新された式' })

      const { entities } = useSheetsStore.getState()
      const updatedSheet = entities[sheetId]

      expect(updatedSheet.formulaData.inputExpr).toBe('更新された式')
      expect(updatedSheet.formulaData.result).toBe(42) // 変更されない
      expect(updatedSheet.formulaData.error).toBe('初期エラー') // 変更されない
    })

    it('updateFormulaData実行時にupdatedAtが更新される', () => {
      vi.useFakeTimers()

      const { updateFormulaData } = useSheetsStore.getState()
      const { sheets } = useSheetsStore.getState()
      const sheetId = sheets[0].id
      const initialUpdatedAt =
        useSheetsStore.getState().entities[sheetId].updatedAt

      // 時間を進める
      vi.advanceTimersByTime(1000)

      updateFormulaData(sheetId, { inputExpr: 'テスト式' })

      const { entities } = useSheetsStore.getState()
      const updatedSheet = entities[sheetId]

      expect(updatedSheet.updatedAt).not.toBe(initialUpdatedAt)
      expect(updatedSheet.updatedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      vi.useRealTimers()
    })

    it('updateFormulaData実行時にsavedAtが更新される', () => {
      vi.useFakeTimers()

      const { updateFormulaData } = useSheetsStore.getState()
      const { sheets } = useSheetsStore.getState()
      const sheetId = sheets[0].id
      const initialSavedAt = useSheetsStore.getState().savedAt

      // 時間を進める
      vi.advanceTimersByTime(1000)

      updateFormulaData(sheetId, { inputExpr: 'テスト式' })

      const updatedSavedAt = useSheetsStore.getState().savedAt

      expect(updatedSavedAt).not.toBe(initialSavedAt)
      expect(updatedSavedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      )

      vi.useRealTimers()
    })

    it('存在しないシートIDでupdateFormulaDataを実行してもエラーにならない', () => {
      const { updateFormulaData } = useSheetsStore.getState()

      expect(() => {
        updateFormulaData('non-existent-id', { inputExpr: 'テスト' })
      }).not.toThrow()

      // 元のデータが変更されていないことを確認
      const { sheets } = useSheetsStore.getState()
      expect(sheets).toHaveLength(1)
    })

    it('initializeSheetでformulaDataが初期化される', () => {
      const { initializeSheet } = useSheetsStore.getState()
      const { addSheet } = useSheetsStore.getState()

      // formulaDataなしのシートを作成（通常のaddSheetは自動でformulaDataを追加するため、手動で削除）
      addSheet('初期化テストシート')
      const { sheets, entities } = useSheetsStore.getState()
      const newSheetId = sheets[sheets.length - 1].id

      // formulaDataを削除してinitializeSheetをテスト
      const sheetWithoutFormula = { ...entities[newSheetId] }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      delete (sheetWithoutFormula as any).formulaData
      useSheetsStore.setState(state => ({
        ...state,
        entities: {
          ...state.entities,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          [newSheetId]: sheetWithoutFormula as any,
        },
      }))

      // initializeSheetを実行
      initializeSheet(newSheetId)

      const { entities: updatedEntities } = useSheetsStore.getState()
      const initializedSheet = updatedEntities[newSheetId]

      expect(initializedSheet.formulaData).toBeDefined()
      expect(initializedSheet.formulaData.inputExpr).toBe('')
      expect(initializedSheet.formulaData.result).toBeNull()
      expect(initializedSheet.formulaData.error).toBeNull()
    })

    it('localStorage保存時にvariableSlots+formulaDataが同時保存される', () => {
      vi.useFakeTimers()

      const { updateFormulaData, updateVariableSlot } =
        useSheetsStore.getState()
      const { sheets } = useSheetsStore.getState()
      const sheetId = sheets[0].id

      // 変数とformula両方を更新
      updateVariableSlot(sheetId, 1, { varName: 'x', expression: '10' })
      updateFormulaData(sheetId, { inputExpr: '[x] * 2 + 5' })

      // persistミドルウェアの非同期処理を即座に実行
      vi.runAllTimers()

      const key = 'pocket-calcsheet/1'
      const saved = localStorage.getItem(key)
      expect(saved).toBeTruthy()

      if (saved) {
        const parsedData = JSON.parse(saved) as {
          state: {
            entities: Record<
              string,
              {
                variableSlots: Array<{ varName: string; expression: string }>
                formulaData: { inputExpr: string }
              }
            >
          }
        }
        const savedEntity = parsedData.state.entities[sheetId]

        expect(savedEntity.variableSlots).toBeDefined()
        expect(savedEntity.variableSlots[0].varName).toBe('x')
        expect(savedEntity.variableSlots[0].expression).toBe('10')
        expect(savedEntity.formulaData).toBeDefined()
        expect(savedEntity.formulaData.inputExpr).toBe('[x] * 2 + 5')
      }

      vi.useRealTimers()
    })
  })
})
