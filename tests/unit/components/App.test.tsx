import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import App from '../../../src/App'
import { TopPage } from '../../../src/pages/TopPage'
import { StorageManager } from '../../../src/utils/storage/storageManager'
import { useUIStore } from '../../../src/store/uiStore'
import { useSheetsStore } from '../../../src/store/sheetsStore'

// テスト用のRouter wrapper - App.tsxには既にHashRouterがあるので包む必要なし
const renderWithRouter = (
  ui: React.ReactElement,
  { initialEntries = ['/'] } = {}
) => {
  // React Router警告を抑制
  const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

  // テスト環境でのHashRouter対応
  window.location.hash = initialEntries[0].replace('/', '#/')
  const result = render(ui)

  // テスト終了後にモックを復元
  result.unmount = () => {
    consoleWarnSpy.mockRestore()
  }

  return result
}

describe('App - Step2-1対応後のテスト', () => {
  let mockRequestPersistentStorage: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React Router警告を抑制
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Act警告を抑制するため、永続化リクエストをモック
    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)
  })

  afterEach(() => {
    mockRequestPersistentStorage.mockRestore()
    consoleWarnSpy.mockRestore()
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
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React Router警告を抑制
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // StorageManager.requestPersistentStorage をモック
    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)

    // sessionStorageをクリアしてテスト間の干渉を防ぐ
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    mockRequestPersistentStorage.mockRestore()
    consoleWarnSpy.mockRestore()
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

    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<App />)

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Failed to request persistent storage:',
        expect.any(Error)
      )
    })

    consoleLogSpy.mockRestore()
  })
})

// この画面切り替えテストはStep3-2でReact Router対応により不要になりました
// URLベースの画面切り替えテストは後続のテストケースで実装されています

describe('App - React Router導入 (Step3-2)', () => {
  let mockRequestPersistentStorage: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React Router警告を抑制
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)

    // ストアを初期状態にリセット
    act(() => {
      useSheetsStore.setState({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        sheets: [],
        entities: {},
        storageError: false,
        persistenceError: false,
      })
      useUIStore.setState({
        isEditMode: false,
      })
      // テストデータを追加
      useSheetsStore.getState().addSheet('テストシート')
    })
  })

  afterEach(() => {
    mockRequestPersistentStorage.mockRestore()
    consoleWarnSpy.mockRestore()
    // ストアを完全にクリア
    act(() => {
      useSheetsStore.setState({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        sheets: [],
        entities: {},
        storageError: false,
        persistenceError: false,
      })
    })
  })

  test('トップページが/#/でレンダリングされる', async () => {
    renderWithRouter(<App />)

    expect(screen.getByTestId('top-page')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('シート詳細overview画面が/#/{id}/overviewでレンダリングされる', async () => {
    const sheet = useSheetsStore.getState().sheets[0]

    renderWithRouter(<App />, { initialEntries: [`/${sheet.id}/overview`] })

    // ヘッダーにシート名が表示される
    expect(screen.getByText('テストシート')).toBeInTheDocument()

    // Overviewタブのコンテンツが表示される
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'この計算表の説明を入力してください...'
    )

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('存在しないシートIDの場合トップページにリダイレクトされる', async () => {
    renderWithRouter(<App />, { initialEntries: ['/invalid-id/overview'] })

    // TopPageが表示される
    expect(screen.getByTestId('top-page')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('不正なタブ名の場合overviewにリダイレクトされる', async () => {
    const sheet = useSheetsStore.getState().sheets[0]

    renderWithRouter(<App />, { initialEntries: [`/${sheet.id}/invalid-tab`] })

    // Overviewタブのコンテンツが表示される（リダイレクト先）
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'placeholder',
      'この計算表の説明を入力してください...'
    )

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })
})

describe('Navigation Components - React Router対応', () => {
  let mockRequestPersistentStorage: ReturnType<typeof vi.spyOn>
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // React Router警告を抑制
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)

    // ストアを初期状態にリセット
    act(() => {
      useSheetsStore.setState({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        sheets: [],
        entities: {},
        storageError: false,
        persistenceError: false,
      })
      useUIStore.setState({
        isEditMode: false,
      })
      // テストデータを追加
      useSheetsStore.getState().addSheet('テストシート')
    })
  })

  afterEach(() => {
    mockRequestPersistentStorage.mockRestore()
    consoleWarnSpy.mockRestore()
    // ストアを完全にクリア
    act(() => {
      useSheetsStore.setState({
        schemaVersion: 1,
        savedAt: new Date().toISOString(),
        sheets: [],
        entities: {},
        storageError: false,
        persistenceError: false,
      })
    })
  })

  test('SheetListItemクリックでシート詳細に遷移する', async () => {
    renderWithRouter(<App />)

    const sheetItem = screen.getByText('テストシート')

    act(() => {
      fireEvent.click(sheetItem)
    })

    // シート詳細画面が表示される
    expect(screen.getByRole('tab', { name: 'Overview' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Variables' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Formula' })).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('Headerの戻るボタンでトップページに遷移する', async () => {
    const sheet = useSheetsStore.getState().sheets[0]

    renderWithRouter(<App />, { initialEntries: [`/${sheet.id}/overview`] })

    // 戻るボタンをクリック
    act(() => {
      const backButton = screen.getByRole('button', { name: '戻る' })
      fireEvent.click(backButton)
    })

    // TopPageが表示される
    expect(screen.getByTestId('top-page')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })
})
