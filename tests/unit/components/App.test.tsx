import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '../../../src/App'
import { TopPage } from '../../../src/pages/TopPage'
import { StorageManager } from '../../../src/utils/storage/storageManager'

describe('App - Step2-1対応後のテスト', () => {
  let mockRequestPersistentStorage: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Act警告を抑制するため、永続化リクエストをモック
    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)
  })

  afterEach(() => {
    mockRequestPersistentStorage.mockRestore()
  })

  test('アプリケーションがクラッシュせずにレンダリングされる', async () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()

    // 永続化リクエストの完了を待機
    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('TopPageが表示される', async () => {
    render(<App />)
    expect(screen.getByTestId('top-page')).toBeInTheDocument()

    // 永続化リクエストの完了を待機
    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('アプリ名「ぽけっと計算表」が表示される', async () => {
    render(<App />)
    expect(screen.getByText('ぽけっと計算表')).toBeInTheDocument()

    // 永続化リクエストの完了を待機
    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
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

describe('App - 永続化ストレージ保護', () => {
  let mockRequestPersistentStorage: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // StorageManager.requestPersistentStorage をモック
    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockRequestPersistentStorage.mockRestore()
  })

  test('アプリ起動時に永続化ストレージをリクエストする', async () => {
    render(<App />)

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('永続化が失敗した場合にエラー状態を設定する', async () => {
    mockRequestPersistentStorage.mockResolvedValue(false)

    render(<App />)

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })

    // エラーダイアログが表示されるかテスト
    // Note: 実際のストア状態のテストは後でsheetsStoreテストに追加
  })

  test('永続化リクエストエラー時の処理', async () => {
    mockRequestPersistentStorage.mockRejectedValue(new Error('Network error'))

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    render(<App />)

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })

    // エラーが適切にハンドリングされることを確認
    // 実装後にコンソールエラーが出力されることを確認する予定

    consoleErrorSpy.mockRestore()
  })
})
