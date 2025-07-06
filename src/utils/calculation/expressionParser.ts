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

// 変数参照が隣接していないかチェック
export function hasAdjacentVariables(expression: string): boolean {
  // 変数参照パターン（[var]形式）
  const varPattern = /\[[^\]]+\]/g

  // 変数参照を一時的なマーカーに置換
  let tempExpr = expression
  let index = 0
  const markers: string[] = []

  tempExpr = tempExpr.replace(varPattern, () => {
    const marker = `__VAR${index}__`
    markers.push(marker)
    index++
    return marker
  })

  // 隣接パターンをチェック
  // 1. 変数同士の隣接: __VAR0____VAR1__
  // 2. 変数と数字の隣接: __VAR0__123 または 123__VAR0__
  const adjacentPattern = /__VAR\d+__(?:__VAR\d+__|[\d])|[\d]__VAR\d+__/

  return adjacentPattern.test(tempExpr)
}
