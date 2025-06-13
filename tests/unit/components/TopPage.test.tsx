import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TopPage } from '@/pages/TopPage'

describe('TopPage', () => {
  it('正常にレンダリングされる', () => {
    render(<TopPage />)

    const topPage = screen.getByTestId('top-page')
    expect(topPage).toBeInTheDocument()
  })

  it('アプリ名「ぽけっと計算表」が表示される', () => {
    render(<TopPage />)

    const appName = screen.getByText('ぽけっと計算表')
    expect(appName).toBeInTheDocument()
  })

  it('編集ボタンが存在する', () => {
    render(<TopPage />)

    const editButton = screen.getByTestId('edit-button')
    expect(editButton).toBeInTheDocument()
    expect(editButton).toHaveTextContent('編集')
  })

  it('SheetListコンポーネントが表示される', () => {
    render(<TopPage />)

    const sheetList = screen.getByTestId('sheet-list')
    expect(sheetList).toBeInTheDocument()
  })
})
