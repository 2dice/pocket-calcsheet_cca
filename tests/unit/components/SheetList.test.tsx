import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SheetList } from '@/components/sheets/SheetList'

describe('SheetList', () => {
  it('空のリストを正常にレンダリングする', () => {
    render(<SheetList sheets={[]} />)

    // 空のリストメッセージまたは横線が表示されることを確認
    const listContainer = screen.getByTestId('sheet-list')
    expect(listContainer).toBeInTheDocument()
  })

  it('空のリストで横線が表示される', () => {
    render(<SheetList sheets={[]} />)

    // 空のリストでも横線が表示されることを確認（リストとして認識できるように）
    const emptyState = screen.getByTestId('empty-list-indicator')
    expect(emptyState).toBeInTheDocument()
  })

  it('シート配列が渡された場合の基本レンダリング', () => {
    const mockSheets = [
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

    render(<SheetList sheets={mockSheets} />)

    const listContainer = screen.getByTestId('sheet-list')
    expect(listContainer).toBeInTheDocument()

    // シート名が表示されることを確認
    expect(screen.getByText('テストシート1')).toBeInTheDocument()
    expect(screen.getByText('テストシート2')).toBeInTheDocument()
  })
})
