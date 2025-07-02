// 変数名を抽出
export function extractVariableNames(expression: string): string[] {
  const matches = expression.match(/\[([^\]]+)\]/g) || []
  return matches.map(match => match.slice(1, -1))
}

// 式の前処理（変数名を実際の値に置換）
export function preprocessExpression(
  expression: string,
  variables: Record<string, number | null>
): string {
  let processed = expression

  // [var1]形式を実際の値に置換
  Object.entries(variables).forEach(([name, value]) => {
    if (value !== null) {
      processed = processed.replace(
        new RegExp(`\\[${name}\\]`, 'g'),
        value.toString()
      )
    }
  })

  return processed
}
