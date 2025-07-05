import * as math from 'mathjs'
import type { CalculationContext, CalculationResult } from '@/types/calculation'
import { preprocessExpression } from './expressionParser'
import { formatWithSIPrefix, formatForFormula } from './numberFormatter'

const mathInstance = math.create(math.all)

// Store original functions before overriding
const originalSin = mathInstance.sin.bind(mathInstance)
const originalCos = mathInstance.cos.bind(mathInstance)
const originalTan = mathInstance.tan.bind(mathInstance)
const originalAsin = mathInstance.asin.bind(mathInstance)
const originalAcos = mathInstance.acos.bind(mathInstance)
const originalAtan = mathInstance.atan.bind(mathInstance)

// 度数法の三角関数設定
mathInstance.import(
  {
    sin: (x: number) => originalSin(mathInstance.unit(`${x} deg`)),
    cos: (x: number) => originalCos(mathInstance.unit(`${x} deg`)),
    tan: (x: number) => originalTan(mathInstance.unit(`${x} deg`)),
    asin: (x: number) => {
      const result = originalAsin(x)
      return mathInstance.unit(`${Number(result)} rad`).toNumber('deg')
    },
    acos: (x: number) => {
      const result = originalAcos(x)
      return mathInstance.unit(`${Number(result)} rad`).toNumber('deg')
    },
    atan: (x: number) => {
      const result = originalAtan(x)
      return mathInstance.unit(`${Number(result)} rad`).toNumber('deg')
    },
    dtor: (x: number) => (x * Math.PI) / 180,
    rtod: (x: number) => (x * 180) / Math.PI,

    // 常用対数（底10）- mathjs標準のlogを上書き
    log: (x: number) => Math.log10(x),
    // 自然対数をlnとして追加（mathjs標準のlogをコピー）
    ln: (x: number) => Math.log(x),
    // 定数関数
    pi: () => Math.PI,
    e: () => Math.E,
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
    const processed = preprocessExpression(
      expression,
      context.variables,
      context.variableSlots
    )

    // 未解決の変数参照が残っている場合
    if (processed.includes('[')) {
      return { value: null, error: 'Error' }
    }

    // 計算実行
    const result = mathInstance.evaluate(processed) as unknown
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

export function evaluateFormulaExpression(
  expression: string,
  context: CalculationContext
): CalculationResult {
  try {
    // 空文字列の場合
    if (!expression.trim()) {
      return { value: null, error: null }
    }

    // 改行・余分な空白を除去
    const cleanedExpression = expression.replace(/\s+/g, ' ').trim()

    // 変数参照を実際の値に置換
    const processed = preprocessExpression(
      cleanedExpression,
      context.variables,
      context.variableSlots
    )

    // 未解決の変数参照が残っている場合
    if (processed.includes('[')) {
      return {
        value: null,
        error: 'Error',
      }
    }

    // 計算実行
    const result = mathInstance.evaluate(processed) as unknown
    const numValue = Number(result)

    if (isNaN(numValue) || !isFinite(numValue)) {
      return { value: null, error: 'Error' }
    }

    return {
      value: numValue,
      error: null,
      formattedValue: formatForFormula(numValue), // formatForFormulaを使用
    }
  } catch {
    return { value: null, error: 'Error' }
  }
}
