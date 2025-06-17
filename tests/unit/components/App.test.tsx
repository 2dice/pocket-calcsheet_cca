import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../../src/App'
import { TopPage } from '../../../src/pages/TopPage'

describe('App - Step2-1対応後のテスト', () => {
  test('アプリケーションがクラッシュせずにレンダリングされる', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
  })

  test('TopPageが表示される', () => {
    render(<App />)
    expect(screen.getByTestId('top-page')).toBeInTheDocument()
  })

  test('アプリ名「ぽけっと計算表」が表示される', () => {
    render(<App />)
    expect(screen.getByText('ぽけっと計算表')).toBeInTheDocument()
  })

  test('DOM環境が正しく設定されている', () => {
    expect(window).toBeDefined()
    expect(document).toBeDefined()
  })

  test('Vitestのモック機能が動作する', () => {
    const mockFn = vi.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })

  test('Service Worker登録関数のモック確認', () => {
    // Service Worker APIのモック
    const mockServiceWorker = {
      register: vi.fn().mockResolvedValue({
        scope: '/pocket-calcsheet_cca/',
        update: vi.fn(),
        unregister: vi.fn(),
      }),
    }

    // navigator.serviceWorkerをモック
    Object.defineProperty(navigator, 'serviceWorker', {
      value: mockServiceWorker,
      writable: true,
    })

    // Service Worker登録のテスト
    expect(navigator.serviceWorker).toBeDefined()
    expect(typeof navigator.serviceWorker.register).toBe('function')
  })
})

describe('TopPage', () => {
  test('正常にレンダリングされる', () => {
    render(<TopPage />)

    const topPage = screen.getByTestId('top-page')
    expect(topPage).toBeInTheDocument()
  })

  test('アプリ名「ぽけっと計算表」が表示される', () => {
    render(<TopPage />)

    const appName = screen.getByText('ぽけっと計算表')
    expect(appName).toBeInTheDocument()
  })

  test('編集ボタンが存在する', () => {
    render(<TopPage />)

    const editButton = screen.getByTestId('edit-button')
    expect(editButton).toBeInTheDocument()
    expect(editButton).toHaveTextContent('編集')
  })

  test('SheetListコンポーネントが表示される', () => {
    render(<TopPage />)

    const sheetList = screen.getByTestId('sheet-list')
    expect(sheetList).toBeInTheDocument()
  })
})
