import { formatWithSIPrefix } from '@/utils/calculation/numberFormatter'
import type { FormulaError } from '@/types/calculation'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface Props {
  result: number | null
  error: FormulaError | null
  className?: string
  formatter?: (value: number) => string
}

type KatexRenderToString = (
  expression: string,
  options: { throwOnError: boolean; displayMode: boolean }
) => string

const renderKatexToString = (katex as { renderToString: KatexRenderToString })
  .renderToString

// エラーメッセージのマッピング
const errorMessages: Record<FormulaError, string> = {
  'Undefined variable': 'Undefined Variable',
  'Division by zero': 'Division by Zero',
  'Syntax error': 'Syntax Error',
  Error: 'Error',
}

export function ResultDisplay({
  result,
  error,
  className,
  formatter = formatWithSIPrefix,
}: Props) {
  const renderLatexResult = (text: string) => {
    const latexBody = text
      .replace('×', '\\times')
      .replace(/10\^(-?\d+)/g, '10^{$1}')
    const latex = `= ${latexBody}`

    try {
      const html = renderKatexToString(latex, {
        throwOnError: false,
        displayMode: false,
      })
      return (
        <span
          data-testid="result-latex"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    } catch {
      return <span>= {text}</span>
    }
  }

  return (
    <div className={className} role="region">
      <label className="text-sm font-medium" id="result-label">
        Result
      </label>
      <div
        className="mt-1 text-right font-mono text-lg"
        aria-labelledby="result-label"
        aria-live="polite"
        aria-atomic="true"
      >
        {error ? (
          <span className="text-red-500" role="alert">
            = {errorMessages[error] || 'Error'}
          </span>
        ) : result !== null ? (
          renderLatexResult(formatter(result))
        ) : (
          <span className="text-gray-400">= -</span>
        )}
      </div>
    </div>
  )
}
