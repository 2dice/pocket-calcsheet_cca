import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import App from '../../../src/App'

describe('App - テスト環境の動作確認', () => {
  test('アプリケーションがクラッシュせずにレンダリングされる', () => {
    const { container } = render(<App />)
    expect(container).toBeTruthy()
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
})
