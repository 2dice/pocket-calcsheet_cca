import { useCallback } from 'react'
import { useSheetsStore } from '@/store'
import { evaluateExpression } from '@/utils/calculation/mathEngine'
import type { CalculationContext } from '@/types/calculation'

export function useCalculation() {
  const { entities, updateVariableSlot } = useSheetsStore()

  const calculateAllVariables = useCallback(
    (sheetId: string) => {
      const sheet = entities[sheetId]
      if (!sheet?.variableSlots) return

      // 2回計算（循環参照対策）
      for (let iteration = 0; iteration < 2; iteration++) {
        // 変数マップを構築
        const variables: Record<string, number | null> = {}
        sheet.variableSlots.forEach(slot => {
          if (slot.varName) {
            variables[slot.varName] = slot.value
          }
        })

        // 各スロットを順番に計算
        sheet.variableSlots.forEach(slot => {
          if (!slot.expression.trim()) {
            // 空の式の場合
            updateVariableSlot(sheetId, slot.slot, {
              value: null,
              error: null,
            })
            return
          }

          const context: CalculationContext = { variables }
          const result = evaluateExpression(slot.expression, context)

          updateVariableSlot(sheetId, slot.slot, {
            value: result.value,
            error: result.error,
          })

          // 変数マップを更新
          if (slot.varName && result.value !== null) {
            variables[slot.varName] = result.value
          }
        })
      }
    },
    [entities, updateVariableSlot]
  )

  return { calculateAllVariables }
}
