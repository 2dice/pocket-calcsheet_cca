import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../../src/App'

describe('App', () => {
  it('基本レンダリングテスト: ViteとReactのロゴが表示される', () => {
    render(<App />)

    // ロゴ画像の確認
    const viteLogoLink = screen.getByRole('link', { name: /vite logo/i })
    const reactLogoLink = screen.getByRole('link', { name: /react logo/i })

    expect(viteLogoLink).toBeInTheDocument()
    expect(reactLogoLink).toBeInTheDocument()
  })

  it('基本レンダリングテスト: Vite + Reactのタイトルが表示される', () => {
    render(<App />)

    const heading = screen.getByRole('heading', { name: /vite \+ react/i })
    expect(heading).toBeInTheDocument()
  })

  it('カウンターボタンの動作テスト', async () => {
    const user = userEvent.setup()
    render(<App />)

    // カウンターボタンを取得
    const button = screen.getByRole('button', { name: /count is 0/i })
    expect(button).toBeInTheDocument()

    // ボタンをクリック
    await user.click(button)

    // カウントが1になることを確認
    expect(
      screen.getByRole('button', { name: /count is 1/i })
    ).toBeInTheDocument()
  })

  it('テキストコンテンツの確認', () => {
    render(<App />)

    // HMRに関するテキストの確認
    expect(screen.getByText(/edit/i)).toBeInTheDocument()
    expect(screen.getByText(/src\/app\.tsx/i)).toBeInTheDocument()
    expect(screen.getByText(/and save to test hmr/i)).toBeInTheDocument()

    // 詳細な説明テキストの確認
    expect(
      screen.getByText(/click on the vite and react logos to learn more/i)
    ).toBeInTheDocument()
  })

  // vitest-fail-on-console動作確認テスト
  // 注意: このテストは意図的にコンソールエラーを発生させて、vitest-fail-on-consoleが機能することを確認する
  // 実際の運用時は削除またはコメントアウトする
  it.skip('コンソールエラー検知テスト（vitest-fail-on-console動作確認）', () => {
    // 以下のコメントを外すとテストが失敗するはず
    // console.error('This is a test error for vitest-fail-on-console')
    expect(true).toBe(true)
  })

  it.skip('コンソール警告検知テスト（vitest-fail-on-console動作確認）', () => {
    // 以下のコメントを外すとテストが失敗するはず
    // console.warn('This is a test warning for vitest-fail-on-console')
    expect(true).toBe(true)
  })
})
