import { describe, it, expect } from 'vitest'
import { formatWithSIPrefix } from '@/utils/calculation/numberFormatter'
import { evaluateExpression } from '@/utils/calculation/mathEngine'
import {
  extractVariableNames,
  preprocessExpression,
} from '@/utils/calculation/expressionParser'
import type { CalculationContext } from '@/types/calculation'
import type { VariableSlot } from '@/types/sheet'

describe('numberFormatter', () => {
  describe('formatWithSIPrefix', () => {
    it('小さい数値を正しくフォーマットする', () => {
      expect(formatWithSIPrefix(0.0003)).toBe('300.00×10^-6')
    })

    it('大きい数値を正しくフォーマットする', () => {
      expect(formatWithSIPrefix(2000000)).toBe('2.00×10^6')
    })

    it('1以上1000未満の数値は指数なし', () => {
      expect(formatWithSIPrefix(123.456)).toBe('123.46') // 四捨五入で.46
    })

    it('ゼロは"0.00"と表示', () => {
      expect(formatWithSIPrefix(0)).toBe('0.00')
    })

    it('負の数も正しくフォーマット', () => {
      expect(formatWithSIPrefix(-0.0003)).toBe('-300.00×10^-6')
    })

    it('非常に小さい数値', () => {
      expect(formatWithSIPrefix(0.000000123)).toBe('123.00×10^-9')
    })

    it('非常に大きい数値', () => {
      expect(formatWithSIPrefix(1234567890)).toBe('1.23×10^9') // 四捨五入で.23
    })

    it('1000の場合', () => {
      expect(formatWithSIPrefix(1000)).toBe('1.00×10^3')
    })

    it('0.999の場合', () => {
      expect(formatWithSIPrefix(0.999)).toBe('999.00×10^-3')
    })

    // 四捨五入の境界値テスト追加
    it('四捨五入の境界値（切り上げ）', () => {
      expect(formatWithSIPrefix(123.455)).toBe('123.46')
      expect(formatWithSIPrefix(0.0009995)).toBe('999.50×10^-6')
    })

    it('四捨五入の境界値（切り捨て）', () => {
      expect(formatWithSIPrefix(123.454)).toBe('123.45')
      expect(formatWithSIPrefix(0.0009994)).toBe('999.40×10^-6')
    })
  })
})

describe('expressionParser', () => {
  describe('extractVariableNames', () => {
    it('変数名を正しく抽出する', () => {
      expect(extractVariableNames('[var1] + [var2]')).toEqual(['var1', 'var2'])
    })

    it('重複した変数名を抽出する', () => {
      expect(extractVariableNames('[var1] + [var1] * 2')).toEqual([
        'var1',
        'var1',
      ])
    })

    it('変数がない場合は空配列を返す', () => {
      expect(extractVariableNames('1 + 2')).toEqual([])
    })

    it('複雑な式から変数名を抽出する', () => {
      expect(
        extractVariableNames('sqrt([var1]) + sin([angle]) * [radius]')
      ).toEqual(['var1', 'angle', 'radius'])
    })
  })

  describe('preprocessExpression', () => {
    it('変数名を実際の値に置換する', () => {
      const variables = { var1: 10, var2: 20 }
      const variableSlots: VariableSlot[] = []
      expect(
        preprocessExpression('[var1] + [var2]', variables, variableSlots)
      ).toBe('10 + 20')
    })

    it('null値の変数は置換しない', () => {
      const variables = { var1: 10, var2: null }
      const variableSlots: VariableSlot[] = []
      expect(
        preprocessExpression('[var1] + [var2]', variables, variableSlots)
      ).toBe('10 + [var2]')
    })

    it('未定義の変数は置換しない', () => {
      const variables = { var1: 10 }
      const variableSlots: VariableSlot[] = []
      expect(
        preprocessExpression('[var1] + [var2]', variables, variableSlots)
      ).toBe('10 + [var2]')
    })
  })
})

describe('mathEngine', () => {
  describe('evaluateExpression', () => {
    it('基本的な四則演算を計算する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      expect(evaluateExpression('2 + 3', context)).toEqual({
        value: 5,
        error: null,
        formattedValue: '5.00',
      })

      expect(evaluateExpression('10 / 2', context)).toEqual({
        value: 5,
        error: null,
        formattedValue: '5.00',
      })
    })

    it('変数参照を解決して計算する', () => {
      const context: CalculationContext = {
        variables: { var1: 10, var2: 20 },
        variableSlots: [],
      }

      expect(evaluateExpression('[var1] + [var2]', context)).toEqual({
        value: 30,
        error: null,
        formattedValue: '30.00',
      })
    })

    it('関数を含む式を計算する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      expect(evaluateExpression('sqrt(16)', context)).toEqual({
        value: 4,
        error: null,
        formattedValue: '4.00',
      })
    })

    it('度数法の三角関数を計算する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      const result = evaluateExpression('sin(90)', context)
      expect(result.value).toBeCloseTo(1, 10)
      expect(result.error).toBe(null)
    })

    it('空文字列の場合はnullを返す', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      expect(evaluateExpression('', context)).toEqual({
        value: null,
        error: null,
      })
    })

    it('未解決の変数参照がある場合はエラーを返す', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      expect(evaluateExpression('[undefined_var]', context)).toEqual({
        value: null,
        error: 'Error',
      })
    })

    it('エラー時はerrorを返す', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      expect(evaluateExpression('1 / 0', context)).toEqual({
        value: null,
        error: 'Error',
      })
    })

    it('無効な式の場合はエラーを返す', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      expect(evaluateExpression('invalid expression', context)).toEqual({
        value: null,
        error: 'Error',
      })
    })

    it('常用対数（log）を計算する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      const result = evaluateExpression('log(8)', context)
      expect(result.value).toBeCloseTo(0.903089, 5)
      expect(result.formattedValue).toBe('903.09×10^-3')
    })

    it('自然対数（ln）を計算する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      const result = evaluateExpression('ln(2)', context)
      expect(result.value).toBeCloseTo(0.693147, 5)
      expect(result.formattedValue).toBe('693.15×10^-3')
    })

    it('円周率（pi）を取得する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      const result = evaluateExpression('pi()', context)
      expect(result.value).toBeCloseTo(Math.PI, 10)
      expect(result.formattedValue).toBe('3.14')
    })

    it('ネイピア数（e）を取得する', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [],
      }

      const result = evaluateExpression('e()', context)
      expect(result.value).toBeCloseTo(Math.E, 10)
      expect(result.formattedValue).toBe('2.72')
    })

    it('複雑な計算式', () => {
      const context: CalculationContext = {
        variables: { x: 100 },
        variableSlots: [],
      }

      const result = evaluateExpression('[x] - 1', context)
      expect(result.value).toBe(99)
      expect(result.formattedValue).toBe('99.00')
    })

    it('Variable形式の変数参照', () => {
      const context: CalculationContext = {
        variables: {},
        variableSlots: [
          { slot: 1, varName: '', expression: '100', value: 100, error: null },
          { slot: 2, varName: '', expression: '', value: null, error: null },
        ],
      }

      const result = evaluateExpression('[Variable1] * 2', context)
      expect(result.value).toBe(200)
      expect(result.formattedValue).toBe('200.00')
    })
  })
})
