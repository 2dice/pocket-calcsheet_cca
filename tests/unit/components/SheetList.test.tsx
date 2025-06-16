import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SheetList } from '@/components/sheets/SheetList'
import type { SheetMeta } from '@/types/sheet'

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
  describe('通常モード', () => {
    it('空のリストを正常にレンダリングする', () => {
      render(<SheetList sheets={[]} isEditMode={false} />)

      // 空のリストメッセージまたは横線が表示されることを確認
      const listContainer = screen.getByTestId('sheet-list')
      expect(listContainer).toBeInTheDocument()
    })

    it('空のリストで横線が表示される', () => {
      render(<SheetList sheets={[]} isEditMode={false} />)

      // 空のリストでも横線が表示されることを確認（リストとして認識できるように）
      const emptyState = screen.getByTestId('empty-list-indicator')
      expect(emptyState).toBeInTheDocument()
    })

    it('シート配列が渡された場合の基本レンダリング', () => {
      render(<SheetList sheets={mockSheets} isEditMode={false} />)

      const listContainer = screen.getByTestId('sheet-list')
      expect(listContainer).toBeInTheDocument()

      // シート名が表示されることを確認
      expect(screen.getByText('テストシート1')).toBeInTheDocument()
      expect(screen.getByText('テストシート2')).toBeInTheDocument()
    })

    it('通常モードではシートをクリックできる', () => {
      const mockOnSheetClick = vi.fn()
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={false}
          onSheetClick={mockOnSheetClick}
        />
      )

      const firstSheet = screen.getByText('テストシート1')
      fireEvent.click(firstSheet)

      expect(mockOnSheetClick).toHaveBeenCalledWith('1')
    })
  })

  describe('編集モード', () => {
    it('編集モードで編集中の新規アイテムが表示される', () => {
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onSheetClick={vi.fn()}
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
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onSheetClick={vi.fn()}
          onNewItemConfirm={vi.fn()}
          onNewItemCancel={vi.fn()}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      expect(input).toHaveFocus()
    })

    it('Enter キーで新規アイテムの確定処理が呼ばれる', () => {
      const mockOnConfirm = vi.fn()
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onSheetClick={vi.fn()}
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
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onSheetClick={vi.fn()}
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
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onSheetClick={vi.fn()}
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
      render(
        <SheetList
          sheets={mockSheets}
          isEditMode={true}
          editingNewItem={true}
          onSheetClick={vi.fn()}
          onNewItemConfirm={mockOnConfirm}
          onNewItemCancel={vi.fn()}
        />
      )

      const input = screen.getByTestId('new-sheet-input')
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

      expect(mockOnConfirm).toHaveBeenCalledWith('')
    })
  })
})
