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

      // 変数マップを外側で初期化
      const variables: Record<string, number | null> = {}

      // スロット数分ループして依存関係を解決
      for (
        let iteration = 0;
        iteration < sheet.variableSlots.length;
        iteration++
      ) {
        // 各イテレーションで変数マップを再構築
        sheet.variableSlots.forEach(slot => {
          if (slot.varName && slot.value !== null) {
            variables[slot.varName] = slot.value
          }
        })

        // 各スロットを順番に計算
        sheet.variableSlots.forEach(slot => {
          if (!slot.expression.trim()) {
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
          if (slot.varName) {
            variables[slot.varName] = result.value
          }
        })
      }
    },
    [entities, updateVariableSlot]
  )

  return { calculateAllVariables }
}
