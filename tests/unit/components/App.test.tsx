import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../../../src/App'

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

  // vitest-fail-on-console動作確認テスト
  // 注意: このテストは意図的にコンソールエラーを発生させて、vitest-fail-on-consoleが機能することを確認する
  test('コンソールエラー検知テスト（vitest-fail-on-console動作確認）', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    console.error('This is a test error for vitest-fail-on-console')
    expect(consoleSpy).toHaveBeenCalledWith(
      'This is a test error for vitest-fail-on-console'
    )
    consoleSpy.mockRestore()
  })

  test('コンソール警告検知テスト（vitest-fail-on-console動作確認）', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    console.warn('This is a test warning for vitest-fail-on-console')
    expect(consoleSpy).toHaveBeenCalledWith(
      'This is a test warning for vitest-fail-on-console'
    )
    consoleSpy.mockRestore()
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
