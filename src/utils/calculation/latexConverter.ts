// 関数名のマッピング（3行目用）
const FUNCTION_LATEX_MAP: Record<string, string> = {
  asin: '\\sin^{-1}',
  acos: '\\cos^{-1}',
  atan: '\\tan^{-1}',
  sin: '\\sin',
  cos: '\\cos',
  tan: '\\tan',
  sqrt: '\\sqrt',
  log: '\\log_{10}',
  ln: '\\log_{e}',
  exp: 'exp', // 後で特別処理
  dtor: 'dtor',
  rtod: 'rtod',
}

// 定数関数のマッピング
const CONSTANT_LATEX_MAP: Record<string, string> = {
  pi: '\\pi',
  e: 'e',
}

// 関数を使用しているか判定（random、pi、e以外）
export function usesFunctions(expression: string): boolean {
  // 除外する関数リスト
  const excludedFunctions = ['random', 'pi', 'e']

  // チェック対象の関数リスト
  const functionsToCheck = Object.keys(FUNCTION_LATEX_MAP).filter(
    fn => !excludedFunctions.includes(fn)
  )

  return functionsToCheck.some(fn => {
    // 関数名の後に開き括弧が来るパターンをチェック
    const regex = new RegExp(`\\b${fn}\\s*\\(`)
    return regex.test(expression)
  })
}

// 2行目用：関数名をそのままでLaTeX変換
export function convertToLatexWithoutFunctionNames(expression: string): string {
  try {
    if (!expression.trim()) return ''

    const cleanedExpr = expression.replace(/\s+/g, ' ').trim()

    // カスタム変換処理
    return convertToCustomLatex(cleanedExpr, false)
  } catch {
    return expression // エラー時は元の式を返す
  }
}

// 3行目用：関数名も含めてLaTeX変換
export function convertToLatexWithFunctionNames(expression: string): string {
  try {
    if (!expression.trim()) return ''

    const cleanedExpr = expression.replace(/\s+/g, ' ').trim()

    // カスタム変換処理
    return convertToCustomLatex(cleanedExpr, true)
  } catch {
    return expression
  }
}

// カスタムLaTeX変換
function convertToCustomLatex(
  expression: string,
  convertFunctions: boolean
): string {
  let result = expression

  // 1. 定数関数の変換（最初に実行）
  Object.entries(CONSTANT_LATEX_MAP).forEach(([fn, latexFn]) => {
    const regex = new RegExp(`\\b${fn}\\(\\)`, 'g')
    result = result.replace(regex, latexFn)
  })

  // 2. べき乗の変換（数値、変数、括弧の後の指数のみ）
  result = result.replace(/\^(-?[\d.]+)/g, '^{$1}') // 数値の指数
  result = result.replace(/\^(-?\[[\w_]+\])/g, '^{$1}') // 変数の指数
  result = result.replace(/\^(-?\w+)/g, '^{$1}') // 一般的な単語の指数

  // 3. 分数の変換
  result = convertFractions(result)

  // 4. 関数変換（必要な場合のみ）
  if (convertFunctions) {
    result = convertFunctionNames(result)
  }

  // 5. 基本的な演算子変換
  result = result.replace(/\s*\*\s*/g, '\\times ')

  // 6. モジュロ演算子の変換
  result = result.replace(/\s*%\s*/g, ' \\bmod ')

  // 7. 重複した度記号の削除
  result = result.replace(/°°/g, '°')

  // 8. 空白の正規化
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

// 関数名変換（3行目のみ）
function convertFunctionNames(expression: string): string {
  let result = expression

  // 1. 三角関数（度記号付き）
  result = result.replace(/\bsin\(([^)]+)\)/g, '\\sin($1°)')
  result = result.replace(/\bcos\(([^)]+)\)/g, '\\cos($1°)')
  result = result.replace(/\btan\(([^)]+)\)/g, '\\tan($1°)')

  // 2. 逆三角関数（度記号付き、複雑な場合は\left \right追加）
  result = replaceFunctionWithBalancedParens(
    result,
    'asin',
    content => `\\sin^{-1}(${content})°`
  )

  result = replaceFunctionWithBalancedParens(result, 'acos', content => {
    // 複雑な分数と平方根の組み合わせには\left \right追加
    if (content.includes('\\frac{') && content.includes('\\sqrt{')) {
      return `\\cos^{-1}\\left(${content}\\right)°`
    }
    return `\\cos^{-1}(${content})°`
  })

  result = replaceFunctionWithBalancedParens(result, 'atan', content => {
    // 複数のatan関数がある場合やより複雑な場合のみ\left \right追加
    const hasMultipleVariables =
      (content.match(/\[[\w_]+\]/g) || []).length >= 2

    if (content.includes('\\frac{') && hasMultipleVariables) {
      return `\\tan^{-1}\\left(${content}\\right)°`
    }
    return `\\tan^{-1}(${content})°`
  })

  // 3. 対数関数（複雑な分数には\left \right追加）
  result = replaceFunctionWithBalancedParens(
    result,
    'log',
    content => `\\log_{10}(${content})`
  )
  result = replaceFunctionWithBalancedParens(result, 'ln', content => {
    if (content.includes('\\frac{')) {
      return `\\log_{e}\\left(${content}\\right)`
    }
    return `\\log_{e}(${content})`
  })

  // 4. 平方根
  result = replaceFunctionWithBalancedParens(
    result,
    'sqrt',
    content => `\\sqrt{${content}}`
  )

  // 5. 指数関数
  result = replaceFunctionWithBalancedParens(
    result,
    'exp',
    content => `e^{${content}}`
  )

  // 6. 度・ラジアン変換
  result = result.replace(/\bdtor\(([^)]+)\)/g, 'dtor($1°)')
  result = result.replace(/\brtod\(([^)]+)\)/g, 'rtod($1)°')

  return result
}

// 分数変換の改良版
function convertFractions(expression: string): string {
  let result = expression

  // 段階的に分数変換を実行

  // 1. 関数の引数内での分数変換（最初に処理）
  result = replaceFunctionArgsWithFractions(result)

  // 2. 複雑な括弧同士の除算
  result = result.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{$1}{$2}')

  // 3. 複雑な式 / 単純な項（関数と数値など）
  result = result.replace(
    /(\w+\([^)]+\))\s*\/\s*([^/\s()]+)/g,
    '\\frac{$1}{$2}'
  )

  // 4. 複雑な括弧式 / 項
  result = result.replace(
    /(\([^)]+\)(?:\^[^/\s()]+)?)\s*\/\s*([^/\s()]+)/g,
    '\\frac{$1}{$2}'
  )

  // 5. 一般的な分数（最後に処理）
  // 分子: 乗算チェーン、分母: 単一項
  const numeratorPattern = /[^\s/()]+(?:\s*\*\s*[^\s/()]+)*/
  const denominatorPattern = /[^\s*/+-]+/

  const generalFractionRegex = new RegExp(
    `(${numeratorPattern.source})\\s*\\/\\s*(${denominatorPattern.source})`,
    'g'
  )
  result = result.replace(generalFractionRegex, '\\frac{$1}{$2}')

  return result
}

// 関数の引数内で分数変換を実行（バランスした括弧を考慮）
function replaceFunctionArgsWithFractions(expression: string): string {
  let result = expression
  const functionRegex = /(\w+)\(/g
  let match

  while ((match = functionRegex.exec(result)) !== null) {
    const funcName = match[1]
    const startIndex = match.index
    const openParenIndex = match.index + match[0].length - 1

    // バランスした括弧の終了位置を見つける
    let parenCount = 1
    let endIndex = openParenIndex + 1

    while (endIndex < result.length && parenCount > 0) {
      if (result[endIndex] === '(') {
        parenCount++
      } else if (result[endIndex] === ')') {
        parenCount--
      }
      endIndex++
    }

    if (parenCount === 0) {
      // 関数の引数を抽出
      const args = result.substring(openParenIndex + 1, endIndex - 1)

      if (args.includes('/')) {
        // 引数内で分数変換を実行
        const convertedArgs = args.replace(
          /([^/\s()]+(?:\s*\*\s*[^/\s()]+)*)\s*\/\s*([^/\s()]+)/g,
          '\\frac{$1}{$2}'
        )

        // 置換
        result =
          result.substring(0, startIndex) +
          `${funcName}(${convertedArgs})` +
          result.substring(endIndex)

        // 検索位置をリセット
        functionRegex.lastIndex =
          startIndex + `${funcName}(${convertedArgs})`.length
      }
    }
  }

  return result
}

// バランスした括弧を考慮した関数置換
function replaceFunctionWithBalancedParens(
  expression: string,
  functionName: string,
  replacer: (content: string) => string
): string {
  let result = expression
  const regex = new RegExp(`\\b${functionName}\\(`, 'g')
  let match

  while ((match = regex.exec(result)) !== null) {
    const startIndex = match.index
    const openParenIndex = match.index + match[0].length - 1

    // バランスした括弧の終了位置を見つける
    let parenCount = 1
    let endIndex = openParenIndex + 1

    while (endIndex < result.length && parenCount > 0) {
      if (result[endIndex] === '(') {
        parenCount++
      } else if (result[endIndex] === ')') {
        parenCount--
      }
      endIndex++
    }

    if (parenCount === 0) {
      // 関数の中身を抽出
      const content = result.substring(openParenIndex + 1, endIndex - 1)
      const replacement = replacer(content)

      // 置換
      result =
        result.substring(0, startIndex) +
        replacement +
        result.substring(endIndex)

      // 検索位置をリセット（文字列が変更されたため）
      regex.lastIndex = startIndex + replacement.length
    }
  }

  return result
}
