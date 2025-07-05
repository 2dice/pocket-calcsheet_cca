import { useCallback } from 'react'
import { useSheetsStore } from '@/store'
import {
  evaluateExpression,
  evaluateFormulaExpression,
} from '@/utils/calculation/mathEngine'
import type { CalculationContext } from '@/types/calculation'

export function useCalculation() {
  const { entities, updateVariableSlot, updateFormulaData } = useSheetsStore()

  const calculateAllVariables = useCallback(
    (sheetId: string) => {
      const sheet = entities[sheetId]
      if (!sheet?.variableSlots) return

      // 変数マップと値マップを外側で管理
      const variables: Record<string, number | null> = {}
      const updatedValues: Record<
        number,
        { value: number | null; error: string | null }
      > = {}

      // 初期値をセット
      sheet.variableSlots.forEach(slot => {
        if (slot.varName) {
          variables[slot.varName] = slot.value
        }
        updatedValues[slot.slot] = { value: slot.value, error: slot.error }
      })

      // 2回計算（循環参照対策）
      for (let iteration = 0; iteration < 2; iteration++) {
        // 各スロットを順番に計算
        sheet.variableSlots.forEach(slot => {
          if (!slot.expression.trim()) {
            updatedValues[slot.slot] = { value: null, error: null }
            if (slot.varName) {
              variables[slot.varName] = null
            }
            return
          }

          const context: CalculationContext = {
            variables,
            variableSlots: sheet.variableSlots.map(s => ({
              ...s,
              value: updatedValues[s.slot].value ?? s.value,
            })),
          }
          const result = evaluateExpression(slot.expression, context)

          // 一時マップに保存
          updatedValues[slot.slot] = {
            value: result.value,
            error: result.error,
          }

          // 変数マップを即座に更新
          if (slot.varName) {
            variables[slot.varName] = result.value
          }
        })
      }

      // 最後に一括更新
      Object.entries(updatedValues).forEach(([slotStr, result]) => {
        const slotNumber = parseInt(slotStr)
        updateVariableSlot(sheetId, slotNumber, result)
      })
    },
    [entities, updateVariableSlot]
  )

  const calculateFormula = useCallback(
    (sheetId: string) => {
      const sheet = entities[sheetId]
      if (!sheet?.formulaData || !sheet.variableSlots) return

      // 変数マップを構築（実際の計算値を使用）
      const variables: Record<string, number | null> = {}
      sheet.variableSlots.forEach(slot => {
        if (slot.varName) {
          variables[slot.varName] = slot.value
        }
      })

      const context: CalculationContext = {
        variables,
        variableSlots: sheet.variableSlots,
      }

      // Formula計算実行
      const result = evaluateFormulaExpression(
        sheet.formulaData.inputExpr,
        context
      )

      updateFormulaData(sheetId, {
        result: result.value,
        error: result.error,
      })
    },
    [entities, updateFormulaData]
  )

  // 変数計算後にFormula計算も実行
  const calculateAll = useCallback(
    (sheetId: string) => {
      calculateAllVariables(sheetId)
      // 変数計算完了後にFormula計算
      setTimeout(() => calculateFormula(sheetId), 0)
    },
    [calculateAllVariables, calculateFormula]
  )

  return { calculateAllVariables, calculateFormula, calculateAll }
}
