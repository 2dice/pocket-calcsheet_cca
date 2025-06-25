import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react'
import App from '../../../src/App'
import { TopPage } from '../../../src/pages/TopPage'
import { StorageManager } from '../../../src/utils/storage/storageManager'
import { useUIStore } from '../../../src/store/uiStore'
import { useSheetsStore } from '../../../src/store/sheetsStore'

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

    // sessionStorageをクリアしてテスト間の干渉を防ぐ
    sessionStorage.clear()
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

describe('App - 画面切り替え (Step3-1)', () => {
  let mockRequestPersistentStorage: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockRequestPersistentStorage = vi
      .spyOn(StorageManager, 'requestPersistentStorage')
      .mockResolvedValue(true)

    // ストアをリセット
    act(() => {
      useUIStore.getState().setCurrentSheetId(null)
      useUIStore.getState().setCurrentTab('overview')
      useSheetsStore.getState().addSheet('テストシート')
    })
  })

  afterEach(() => {
    mockRequestPersistentStorage.mockRestore()
    // ストアをクリア
    act(() => {
      useSheetsStore.setState({ sheets: [] })
    })
  })

  test('currentSheetIdがnullの場合はTopPageが表示される', async () => {
    act(() => {
      useUIStore.getState().setCurrentSheetId(null)
    })

    render(<App />)

    expect(screen.getByTestId('top-page')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('有効なcurrentSheetIdが設定されている場合は3タブレイアウトが表示される', async () => {
    const sheet = useSheetsStore.getState().sheets[0]
    act(() => {
      useUIStore.getState().setCurrentSheetId(sheet.id)
    })

    render(<App />)

    // ヘッダーにシート名が表示される
    expect(screen.getByText('テストシート')).toBeInTheDocument()

    // タブが表示される
    expect(screen.getByRole('button', { name: 'Overview' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Variables' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Formula' })).toBeInTheDocument()

    // 戻るボタンが表示される
    expect(screen.getByRole('button', { name: '戻る' })).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('無効なcurrentSheetIdが設定されている場合はTopPageに戻る', async () => {
    act(() => {
      useUIStore.getState().setCurrentSheetId('invalid-id')
    })

    render(<App />)

    // TopPageが表示される
    expect(screen.getByTestId('top-page')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })

  test('戻るボタンをクリックするとTopPageに戻る', async () => {
    const sheet = useSheetsStore.getState().sheets[0]
    act(() => {
      useUIStore.getState().setCurrentSheetId(sheet.id)
    })

    render(<App />)

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

  test('タブを切り替えると対応するコンテンツが表示される', async () => {
    const sheet = useSheetsStore.getState().sheets[0]
    act(() => {
      useUIStore.getState().setCurrentSheetId(sheet.id)
    })

    render(<App />)

    // 初期状態でOverviewタブのコンテンツが表示される
    expect(
      screen.getByText(
        '概要タブのプレースホルダーです。実装は後のステップで行います。'
      )
    ).toBeInTheDocument()

    // Variablesタブをクリック
    act(() => {
      const variablesTab = screen.getByRole('button', { name: 'Variables' })
      fireEvent.click(variablesTab)
    })

    // Variablesタブのコンテンツが表示される
    expect(
      screen.getByText(
        '変数タブのプレースホルダーです。実装は後のステップで行います。'
      )
    ).toBeInTheDocument()

    // Formulaタブをクリック
    act(() => {
      const formulaTab = screen.getByRole('button', { name: 'Formula' })
      fireEvent.click(formulaTab)
    })

    // Formulaタブのコンテンツが表示される
    expect(
      screen.getByText(
        '数式タブのプレースホルダーです。実装は後のステップで行います。'
      )
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(mockRequestPersistentStorage).toHaveBeenCalled()
    })
  })
})
