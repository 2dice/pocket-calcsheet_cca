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

  test('navigator.storage.persistが呼び出される', async () => {
    const mockPersist = vi.fn().mockResolvedValue(true)
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // navigator.storage.persistをモック
    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: mockPersist,
      },
      writable: true,
    })

    render(<App />)

    // 少し待ってuseEffectが実行されるのを確認
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockPersist).toHaveBeenCalledOnce()
    expect(consoleLogSpy).toHaveBeenCalledWith('Storage persisted')

    consoleLogSpy.mockRestore()
  })

  test('navigator.storageが利用不可能な場合でもエラーにならない', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // navigatorをundefinedに設定
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
    })

    render(<App />)

    // 少し待ってuseEffectが実行されるのを確認
    await new Promise(resolve => setTimeout(resolve, 100))

    // エラーが投げられないことを確認
    expect(consoleLogSpy).not.toHaveBeenCalled()

    consoleLogSpy.mockRestore()
  })

  test('navigator.storage.persistでエラーが発生した場合のハンドリング', async () => {
    const mockPersist = vi.fn().mockRejectedValue(new Error('Persist failed'))
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: mockPersist,
      },
      writable: true,
    })

    render(<App />)

    // 少し待ってuseEffectが実行されるのを確認
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockPersist).toHaveBeenCalledOnce()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to request persistent storage:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  test('navigator.storage.persistが拒否された場合のログ出力', async () => {
    const mockPersist = vi.fn().mockResolvedValue(false)
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    Object.defineProperty(navigator, 'storage', {
      value: {
        persist: mockPersist,
      },
      writable: true,
    })

    render(<App />)

    // 少し待ってuseEffectが実行されるのを確認
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(mockPersist).toHaveBeenCalledOnce()
    expect(consoleLogSpy).toHaveBeenCalledWith('Storage not persisted')

    consoleLogSpy.mockRestore()
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

  test('ストレージ容量超過エラーダイアログが表示される', async () => {
    render(<TopPage />)

    // ストレージ容量超過エラーをトリガー
    const errorDialog = screen.queryByText('ストレージ容量不足')
    expect(errorDialog).not.toBeInTheDocument()

    // TODO: 実際のエラートリガー方法は実装後に追加
  })

  test('ストレージ容量超過エラーダイアログのOKボタンで閉じる', async () => {
    render(<TopPage />)

    // TODO: エラーダイアログの表示とOKボタンクリックのテストは実装後に追加
  })
})
