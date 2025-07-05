import { formatWithSIPrefix } from '@/utils/calculation/numberFormatter'

interface Props {
  result: number | null
  error: string | null
  className?: string
  formatter?: (value: number) => string // フォーマッター関数を受け取る
}

export function ResultDisplay({
  result,
  error,
  className,
  formatter = formatWithSIPrefix,
}: Props) {
  return (
    <div className={className}>
      <label className="text-sm font-medium">Result</label>
      <div className="mt-1 text-right font-mono text-lg">
        {error ? (
          <span className="text-red-500">Error</span>
        ) : result !== null ? (
          <span>{formatter(result)}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </div>
    </div>
  )
}
