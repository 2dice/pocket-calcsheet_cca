import { create, all } from 'mathjs'
import type { CalculationContext, CalculationResult } from '@/types/calculation'
import { preprocessExpression } from './expressionParser'
import { formatWithSIPrefix } from './numberFormatter'

const math = create(all)

// 度数法の三角関数設定
math.import(
  {
    sin: (x: number) => {
      const radians = (x * Math.PI) / 180
      return Math.sin(radians)
    },
    cos: (x: number) => {
      const radians = (x * Math.PI) / 180
      return Math.cos(radians)
    },
    tan: (x: number) => {
      const radians = (x * Math.PI) / 180
      return Math.tan(radians)
    },
    asin: (x: number) => {
      const radians = Math.asin(x)
      return (radians * 180) / Math.PI
    },
    acos: (x: number) => {
      const radians = Math.acos(x)
      return (radians * 180) / Math.PI
    },
    atan: (x: number) => {
      const radians = Math.atan(x)
      return (radians * 180) / Math.PI
    },
    dtor: (x: number) => (x * Math.PI) / 180,
    rtod: (x: number) => (x * 180) / Math.PI,
  },
  { override: true }
)

export function evaluateExpression(
  expression: string,
  context: CalculationContext
): CalculationResult {
  try {
    // 空文字列の場合
    if (!expression.trim()) {
      return { value: null, error: null }
    }

    // 変数参照を実際の値に置換
    const processed = preprocessExpression(expression, context.variables)

    // 未解決の変数参照が残っている場合
    if (processed.includes('[')) {
      return { value: null, error: 'Error' }
    }

    // 計算実行
    const result = math.evaluate(processed) as unknown
    const numValue = Number(result)

    if (isNaN(numValue) || !isFinite(numValue)) {
      return { value: null, error: 'Error' }
    }

    return {
      value: numValue,
      error: null,
      formattedValue: formatWithSIPrefix(numValue),
    }
  } catch {
    return { value: null, error: 'Error' }
  }
}
