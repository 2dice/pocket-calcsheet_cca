import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { HashRouter } from 'react-router-dom'
import { SheetList } from '@/components/sheets/SheetList'
import type { SheetMeta } from '@/types/sheet'

// Router Wrapper for tests
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<HashRouter>{ui}</HashRouter>)
}

const mockSheets: SheetMeta[] = [
  {
    id: '1',
    name: 'テストシート1',
    order: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'テストシート2',
    order: 1,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
]

describe('SheetList', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React Router警告を抑制
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  describe('通常モード', () => {
    it('空のリストを正常にレンダリングする', () => {
      renderWithRouter(<SheetList sheets={[]} isEditMode={false} />)

      // 空のリストメッセージまたは横線が表示されることを確認
      const listContainer = screen.getByTestId('sheet-list')
      expect(listContainer).toBeInTheDocument()
    })

    it('空のリストで横線が表示される', () => {
      renderWithRouter(<SheetList sheets={[]} isEditMode={false} />)

      // 空のリストでも横線が表示されることを確認（リストとして認識できるように）
      const emptyState = screen.getByTestId('empty-list-indicator')
      expect(emptyState).toBeInTheDocument()
    })

    it('シート配列が渡された場合の基本レンダリング', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={false} />)

      const listContainer = screen.getByTestId('sheet-list')
      expect(listContainer).toBeInTheDocument()

      // シート名が表示されることを確認
      expect(screen.getByText('テストシート1')).toBeInTheDocument()
      expect(screen.getByText('テストシート2')).toBeInTheDocument()
    })

    it('通常モードではシートをクリックできる', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={false} />)

      const firstSheet = screen.getByText('テストシート1')
      fireEvent.click(firstSheet)

      // React Router navigation is tested in App.test.tsx
      // Here we just verify the sheet item is clickable
      expect(firstSheet).toBeInTheDocument()
    })
  })

  describe('編集モード', () => {
    it('編集モードで編集中の新規アイテムが表示される', () => {
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onNewItemConfirm={vi.fn()}
          onNewItemCancel={vi.fn()}
        />
      )

      // 編集中の新規アイテムの入力フィールドが表示される
      const input = screen.getByTestId('new-sheet-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveFocus()
    })

    it('編集中の新規アイテムがfocusを持つ', () => {
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onNewItemConfirm={vi.fn()}
          onNewItemCancel={vi.fn()}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      expect(input).toHaveFocus()
    })

    it('Enter キーで新規アイテムの確定処理が呼ばれる', () => {
      const mockOnConfirm = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onNewItemConfirm={mockOnConfirm}
          onNewItemCancel={vi.fn()}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      fireEvent.change(input, { target: { value: '新しいシート' } })
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnConfirm).toHaveBeenCalledWith('新しいシート')
    })

    it('Escape キーで新規アイテムのキャンセル処理が呼ばれる', () => {
      const mockOnCancel = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onNewItemConfirm={vi.fn()}
          onNewItemCancel={mockOnCancel}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })

      expect(mockOnCancel).toHaveBeenCalled()
    })

    it('入力フィールドからフォーカスが外れると確定処理が呼ばれる', () => {
      const mockOnConfirm = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onNewItemConfirm={mockOnConfirm}
          onNewItemCancel={vi.fn()}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      fireEvent.change(input, { target: { value: '新しいシート' } })
      fireEvent.blur(input)

      expect(mockOnConfirm).toHaveBeenCalledWith('新しいシート')
    })

    it('空の値で確定しようとしてもコールバックが呼ばれる（AlertDialogは上位で処理）', () => {
      const mockOnConfirm = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onNewItemConfirm={mockOnConfirm}
          onNewItemCancel={vi.fn()}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnConfirm).toHaveBeenCalledWith('')
    })
  })

  describe('ドラッグ&ドロップ機能', () => {
    it('編集モード時にドラッグハンドルが表示される', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={true} />)

      // 各シートアイテムにドラッグハンドルが表示される
      const dragHandles = screen.getAllByTestId('drag-handle')
      expect(dragHandles).toHaveLength(mockSheets.length)
    })

    it('通常モード時にドラッグハンドルが表示されない', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={false} />)

      // ドラッグハンドルが表示されない
      const dragHandles = screen.queryAllByTestId('drag-handle')
      expect(dragHandles).toHaveLength(0)
    })

    it('DndContextが正しく設定されている', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={true} />)

      // DndContext内でレンダリングされていることを確認
      // ドラッグハンドルが表示されている=DndContextが動作している
      const dragHandles = screen.getAllByTestId('drag-handle')
      expect(dragHandles).toHaveLength(mockSheets.length)
    })

    it('SortableContextが正しく設定されている', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={true} />)

      // SortableContext内でレンダリングされていることを確認
      // SortableItem(SheetListItem)が正しく表示されている=SortableContextが動作している
      const firstSheetItem = screen.getByText('テストシート1')
      expect(firstSheetItem).toBeInTheDocument()

      const secondSheetItem = screen.getByText('テストシート2')
      expect(secondSheetItem).toBeInTheDocument()
    })

    it('ドラッグハンドルにtouch-action: noneが適用されている', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={true} />)

      const dragHandles = screen.getAllByTestId('drag-handle')
      dragHandles.forEach(handle => {
        // style属性内でtouchActionが設定されていることを確認
        expect(handle.style.touchAction).toBe('none')
      })
    })

    it('ソート可能なアイテムが正しくレンダリングされる', () => {
      const mockOnReorder = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onReorderSheets={mockOnReorder}
        />
      )

      // ドラッグ中のスタイル適用をテスト
      // これは実際のドラッグ操作後に確認されるもの
      const firstItem = screen
        .getByText('テストシート1')
        .closest('[data-sortable-item]')
      expect(firstItem).toBeInTheDocument()
    })
  })

  describe('シート名編集機能（インライン編集）', () => {
    it('通常モード時にシート名をクリックしても編集状態にならない', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={false}
          onUpdateSheet={mockOnUpdate}
        />
      )

      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      // 編集状態になっていないことを確認
      expect(screen.queryByTestId('sheet-name-input')).not.toBeInTheDocument()
      expect(mockOnUpdate).not.toHaveBeenCalled()
    })

    it('編集モード時にシート名をクリックすると編集状態になる', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={mockOnUpdate}
        />
      )

      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      // 編集状態になることを確認
      const input = screen.getByTestId('sheet-name-input')
      expect(input).toBeInTheDocument()
      expect(input).toHaveFocus()
      expect(input).toHaveValue('テストシート1')
    })

    it('編集中のシート名でEnterキーを押すと編集が完了する', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={mockOnUpdate}
        />
      )

      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      const input = screen.getByTestId('sheet-name-input')
      fireEvent.change(input, { target: { value: '更新されたシート名' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockOnUpdate).toHaveBeenCalledWith('1', '更新されたシート名')
    })

    it('編集中のシート名からフォーカスが外れると編集が完了する', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={mockOnUpdate}
        />
      )

      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      const input = screen.getByTestId('sheet-name-input')
      fireEvent.change(input, { target: { value: '更新されたシート名' } })
      fireEvent.blur(input)

      expect(mockOnUpdate).toHaveBeenCalledWith('1', '更新されたシート名')
    })

    it('編集中にEscapeキーを押すと編集をキャンセルする', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={mockOnUpdate}
        />
      )

      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      const input = screen.getByTestId('sheet-name-input')
      fireEvent.change(input, { target: { value: '更新されたシート名' } })
      fireEvent.keyDown(input, { key: 'Escape' })

      // onUpdateSheetが呼ばれないことを確認
      expect(mockOnUpdate).not.toHaveBeenCalled()

      // 編集状態が終了することを確認
      expect(screen.queryByTestId('sheet-name-input')).not.toBeInTheDocument()
      expect(screen.getByText('テストシート1')).toBeInTheDocument()
    })

    it('空欄での編集完了は拒否される（onUpdateSheetが呼ばれる）', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={mockOnUpdate}
        />
      )

      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      const input = screen.getByTestId('sheet-name-input')
      fireEvent.change(input, { target: { value: '' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      // 空欄でもonUpdateSheetが呼ばれることを確認（バリデーションは上位で処理）
      expect(mockOnUpdate).toHaveBeenCalledWith('1', '')
    })

    it('複数のシートで個別に編集状態を管理できる', () => {
      const mockOnUpdate = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={mockOnUpdate}
        />
      )

      // 1つ目のシートを編集状態にする
      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      // 編集用のinputが1つだけ存在することを確認
      const inputs = screen.getAllByTestId('sheet-name-input')
      expect(inputs).toHaveLength(1)
      expect(inputs[0]).toHaveValue('テストシート1')

      // 2つ目のシート名は通常表示のまま
      expect(screen.getByText('テストシート2')).toBeInTheDocument()
    })

    it('編集状態のシートで削除ボタンが非表示になる', () => {
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={vi.fn()}
          onDeleteSheet={vi.fn()}
        />
      )

      // 初期状態では削除ボタンが表示される
      const deleteButtons = screen.getAllByTestId('delete-button')
      expect(deleteButtons).toHaveLength(2)

      // 1つ目のシートを編集状態にする
      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      // 編集中のシートの削除ボタンは表示されない
      const remainingDeleteButtons = screen.getAllByTestId('delete-button')
      expect(remainingDeleteButtons).toHaveLength(1)
    })

    it('編集状態のシートでドラッグハンドルが非表示になる', () => {
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onUpdateSheet={vi.fn()}
          onReorderSheets={vi.fn()}
        />
      )

      // 初期状態ではドラッグハンドルが表示される
      const dragHandles = screen.getAllByTestId('drag-handle')
      expect(dragHandles).toHaveLength(2)

      // 1つ目のシートを編集状態にする
      const firstSheetName = screen.getByText('テストシート1')
      fireEvent.click(firstSheetName)

      // 編集中のシートのドラッグハンドルは表示されない
      const remainingDragHandles = screen.getAllByTestId('drag-handle')
      expect(remainingDragHandles).toHaveLength(1)
    })
  })

  describe('削除機能', () => {
    it('通常モード時に削除ボタンが表示されない', () => {
      renderWithRouter(<SheetList sheets={mockSheets} isEditMode={false} />)

      // 削除ボタンが表示されない
      const deleteButtons = screen.queryAllByTestId('delete-button')
      expect(deleteButtons).toHaveLength(0)
    })

    it('編集モード時に削除ボタンが表示される', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      // 各シートアイテムに削除ボタンが表示される
      const deleteButtons = screen.getAllByTestId('delete-button')
      expect(deleteButtons).toHaveLength(mockSheets.length)
    })

    it('削除ボタンクリック時にAlertDialogが表示される', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')

      // 最初のシートの削除ボタンをクリック
      fireEvent.click(deleteButtons[0])

      // AlertDialogが表示される（onDeleteSheetはまだ呼ばれない）
      expect(screen.getByRole('alertdialog')).toBeInTheDocument()
      expect(mockOnDelete).not.toHaveBeenCalled()
    })

    it('削除ボタンにTrash2アイコンが表示される', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      // 削除ボタン内のTrash2アイコンが表示される
      const deleteButtons = screen.getAllByTestId('delete-button')
      expect(deleteButtons[0]).toBeInTheDocument()

      // ボタン内にSVG要素が存在することを確認（lucide-reactアイコン）
      const svgElements = deleteButtons[0].querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })

    it('削除ボタンが適切なタッチターゲットサイズを持つ', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')

      // ボタンのスタイルを確認（44px以上のタッチターゲット）
      deleteButtons.forEach(button => {
        // Tailwindクラスによるサイズ設定を確認
        expect(button.className).toMatch(/min-h-|h-/)
        expect(button.className).toMatch(/min-w-|w-/)
      })
    })
  })

  describe('AlertDialog確認機能', () => {
    it('削除ボタンクリック時にAlertDialogが表示される', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')
      fireEvent.click(deleteButtons[0])

      // AlertDialogが表示される
      const alertDialog = screen.getByRole('alertdialog')
      expect(alertDialog).toBeInTheDocument()
    })

    it('AlertDialogに正しいタイトルと説明が表示される', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')
      fireEvent.click(deleteButtons[0])

      // タイトルの確認
      expect(screen.getByText('シートを削除')).toBeInTheDocument()

      // 説明文の確認（シート名を含む）
      expect(
        screen.getByText(
          '"テストシート1"を削除してもよろしいですか？この操作は取り消せません。'
        )
      ).toBeInTheDocument()
    })

    it('AlertDialogのキャンセルボタンで削除がキャンセルされる', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')
      fireEvent.click(deleteButtons[0])

      // キャンセルボタンをクリック
      const cancelButton = screen.getByText('キャンセル')
      fireEvent.click(cancelButton)

      // onDeleteSheetが呼ばれない
      expect(mockOnDelete).not.toHaveBeenCalled()

      // AlertDialogが非表示になる
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('AlertDialogの削除ボタンで削除が実行される', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')
      fireEvent.click(deleteButtons[0])

      // 削除確認ボタンをクリック
      const confirmButton = screen.getByText('削除')
      fireEvent.click(confirmButton)

      // onDeleteSheetが正しいIDで呼ばれる
      expect(mockOnDelete).toHaveBeenCalledWith('1')

      // AlertDialogが非表示になる
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('複数のシートで個別のAlertDialogが正常に動作する', () => {
      const mockOnDelete = vi.fn()
      renderWithRouter(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          onDeleteSheet={mockOnDelete}
        />
      )

      const deleteButtons = screen.getAllByTestId('delete-button')

      // 2番目のシートの削除ボタンをクリック
      fireEvent.click(deleteButtons[1])

      // 説明文に2番目のシート名が表示される
      expect(
        screen.getByText(
          '"テストシート2"を削除してもよろしいですか？この操作は取り消せません。'
        )
      ).toBeInTheDocument()

      // 削除確認
      const confirmButton = screen.getByText('削除')
      fireEvent.click(confirmButton)

      // 2番目のシートのIDで呼ばれる
      expect(mockOnDelete).toHaveBeenCalledWith('2')
    })
  })
})
