import type { VariableSlot } from '@/types/sheet'

// 変数名を抽出
export function extractVariableNames(expression: string): string[] {
  const matches = expression.match(/\[([^\]]+)\]/g) || []
  return matches.map(match => match.slice(1, -1))
}

// 式の前処理（変数名を実際の値に置換）
export function preprocessExpression(
  expression: string,
  variables: Record<string, number | null>,
  variableSlots: VariableSlot[] // 追加
): string {
  let processed = expression

  // 既存の変数名による置換
  Object.entries(variables).forEach(([name, value]) => {
    if (value !== null) {
      processed = processed.replace(
        new RegExp(`\\[${name}\\]`, 'g'),
        value.toString()
      )
    }
  })

  // Variable1〜8形式の置換（変数名未入力時）
  variableSlots.forEach(slot => {
    const variableLabel = `Variable${slot.slot}`
    if (slot.value !== null) {
      processed = processed.replace(
        new RegExp(`\\[${variableLabel}\\]`, 'g'),
        slot.value.toString()
      )
    }
  })

  return processed
}
