import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExpressionRenderer } from '@/components/calculator/ExpressionRenderer'

// KaTeXのモック
vi.mock('katex', () => ({
  default: {
    render: vi.fn((latex: string, element: HTMLElement) => {
      element.textContent = `KATEX[${latex}]`
    }),
  },
}))

describe('ExpressionRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('3つの表示形式をレンダリングする', () => {
    const expression = 'atan(2*[var1]/[var2])'

    render(<ExpressionRenderer expression={expression} />)

    // 1行目：元の式
    expect(screen.getByText(expression)).toBeInTheDocument()

    // 2行目：関数名そのまま版（KaTeX）
    expect(
      screen.getByText('KATEX[atan(2\\times \\frac{[var1]}{[var2]})]')
    ).toBeInTheDocument()

    // 3行目：関数名変換版（KaTeX）
    expect(
      screen.getByText(
        'KATEX[\\tan^{-1}\\left(2\\times \\frac{[var1]}{[var2]}\\right)°]'
      )
    ).toBeInTheDocument()
  })

  it('関数なしの場合2行目をスキップする', () => {
    const expression = '2 + 3'

    const { container } = render(<ExpressionRenderer expression={expression} />)

    // 1行目：元の式
    expect(screen.getByText(expression)).toBeInTheDocument()

    // 3行目：関数名変換版のみ表示（加算はそのまま）
    expect(screen.getByText('KATEX[2 + 3]')).toBeInTheDocument()

    // 2行目は表示されない（divが2つのみ）
    const childDivs = container.children[0].children
    expect(childDivs).toHaveLength(2)
  })

  it('random、pi、eのみの場合は2行目をスキップする', () => {
    const expression = 'random(1,10) + pi() * e()'

    const { container } = render(<ExpressionRenderer expression={expression} />)

    // 1行目：元の式
    expect(screen.getByText(expression)).toBeInTheDocument()

    // 3行目のみ表示（関数なしと判定される）
    expect(
      screen.getByText('KATEX[random(1,10) + \\pi\\times e]')
    ).toBeInTheDocument()

    // 2行目は表示されない
    const childDivs = container.children[0].children
    expect(childDivs).toHaveLength(2)
  })

  it('KaTeXでレンダリングされる', async () => {
    const katexModule = await import('katex')
    const katex = vi.mocked(katexModule.default)

    render(<ExpressionRenderer expression="sin(30)" />)

    // KaTeXのrenderが呼ばれることを確認
    expect(katex.render).toHaveBeenCalledWith(
      'sin(30)',
      expect.any(HTMLElement),
      { throwOnError: false, displayMode: false }
    )

    expect(katex.render).toHaveBeenCalledWith(
      '\\sin(30°)',
      expect.any(HTMLElement),
      { throwOnError: false, displayMode: false }
    )
  })

  it('LaTeXエラー時に生テキストを表示する', async () => {
    // コンソール警告をモック
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const katexModule = await import('katex')
    const katex = vi.mocked(katexModule.default)

    // KaTeXのrenderでエラーを発生させる
    katex.render.mockImplementationOnce(() => {
      throw new Error('LaTeX error')
    })

    render(<ExpressionRenderer expression="sin(30)" />)

    // エラー時は元のLaTeX文字列が表示される（複数箇所に表示される）
    const elements = screen.getAllByText('sin(30)')
    expect(elements).toHaveLength(2) // 1行目と2行目（エラーフォールバック）

    // 警告が呼ばれたことを確認
    expect(consoleSpy).toHaveBeenCalledWith(
      'KaTeX rendering failed:',
      expect.any(Error)
    )

    // クリーンアップ
    consoleSpy.mockRestore()
  })

  it('カスタムclassNameが適用される', () => {
    const { container } = render(
      <ExpressionRenderer expression="2 + 3" className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('空文字列の場合は何も表示しない', () => {
    const { container } = render(<ExpressionRenderer expression="" />)

    // 空の場合でも基本構造は表示される
    const childDivs = container.children[0].children
    expect(childDivs).toHaveLength(2) // 1行目（空）と3行目のみ
  })

  it('複雑な式が正しく変換される', () => {
    const expression = 'sqrt(log(100*[var1]))'

    render(<ExpressionRenderer expression={expression} />)

    // 1行目：元の式
    expect(screen.getByText(expression)).toBeInTheDocument()

    // 2行目：関数名そのまま版
    expect(
      screen.getByText('KATEX[sqrt(log(100\\times [var1]))]')
    ).toBeInTheDocument()

    // 3行目：関数名変換版
    expect(
      screen.getByText('KATEX[\\sqrt{\\log_{10}(100\\times [var1])}]')
    ).toBeInTheDocument()
  })
})
