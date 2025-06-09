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

  // vitest-fail-on-console動作確認テスト
  // 注意: このテストは意図的にコンソールエラーを発生させて、vitest-fail-on-consoleが機能することを確認する
  // 実際の運用時は削除またはコメントアウトする
  test.skip('コンソールエラー検知テスト（vitest-fail-on-console動作確認）', () => {
    // 以下のコメントを外すとテストが失敗するはず
    // console.error('This is a test error for vitest-fail-on-console')
    expect(true).toBe(true)
  })

  test.skip('コンソール警告検知テスト（vitest-fail-on-console動作確認）', () => {
    // 以下のコメントを外すとテストが失敗するはず
    // console.warn('This is a test warning for vitest-fail-on-console')
    expect(true).toBe(true)
  })
})
