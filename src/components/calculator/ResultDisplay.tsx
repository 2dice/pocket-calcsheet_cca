import { formatWithSIPrefix } from '@/utils/calculation/numberFormatter'
import type { FormulaError } from '@/types/calculation'

interface Props {
  result: number | null
  error: FormulaError | null
  className?: string
  formatter?: (value: number) => string
}

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
            {errorMessages[error] || 'Error'}
          </span>
        ) : result !== null ? (
          <span>{formatter(result)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    </div>
  )
}
