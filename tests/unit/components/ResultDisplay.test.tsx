import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ResultDisplay } from '@/components/calculator/ResultDisplay'
import { formatForFormula } from '@/utils/calculation/numberFormatter'

describe('ResultDisplay', () => {
  it('計算結果を右詰めで表示する', () => {
    render(<ResultDisplay result={123.456} error={null} />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('123.46')).toBeInTheDocument()

    // 右詰めのスタイルが適用されているかチェック
    const resultContainer = screen.getByText('123.46').parentElement
    expect(resultContainer).toHaveClass('text-right')
  })

  it('エラー時に"Error"を表示する', () => {
    render(<ResultDisplay result={null} error="Error" />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('Error')).toBeInTheDocument()

    // エラー時の赤色スタイルが適用されているかチェック
    const errorText = screen.getByText('Error')
    expect(errorText).toHaveClass('text-red-500')
  })

  it('結果がnullでエラーもない場合は"-"を表示する', () => {
    render(<ResultDisplay result={null} error={null} />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()

    // グレーアウトのスタイルが適用されているかチェック
    const placeholder = screen.getByText('-')
    expect(placeholder).toHaveClass('text-gray-400')
  })

  it('デフォルトフォーマッター（SI接頭語2桁）で表示', () => {
    render(<ResultDisplay result={1234567.89} error={null} />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('1.23×10^6')).toBeInTheDocument()
  })

  it('カスタムフォーマッター（SI接頭語15桁）で表示', () => {
    render(
      <ResultDisplay
        result={1234567.89}
        error={null}
        formatter={formatForFormula}
      />
    )

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('1.234567890000000×10^6')).toBeInTheDocument()
  })

  it('カスタムクラス名を適用できる', () => {
    render(<ResultDisplay result={123} error={null} className="custom-class" />)

    const container = screen.getByText('Result').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('0の場合は正しく表示する', () => {
    render(<ResultDisplay result={0} error={null} />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('0.00')).toBeInTheDocument()
  })

  it('負の数値を正しく表示する', () => {
    render(<ResultDisplay result={-123.456} error={null} />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('-123.46')).toBeInTheDocument()
  })

  it('非常に小さい数値をSI接頭語で表示する', () => {
    render(<ResultDisplay result={0.000123} error={null} />)

    expect(screen.getByText('Result')).toBeInTheDocument()
    expect(screen.getByText('123.00×10^-6')).toBeInTheDocument()
  })

  it('フォントスタイル（等幅フォント）が適用されている', () => {
    render(<ResultDisplay result={123} error={null} />)

    const resultContainer = screen.getByText('123.00').parentElement
    expect(resultContainer).toHaveClass('font-mono')
  })

  it('テキストサイズが適用されている', () => {
    render(<ResultDisplay result={123} error={null} />)

    const resultContainer = screen.getByText('123.00').parentElement
    expect(resultContainer).toHaveClass('text-lg')
  })
})
