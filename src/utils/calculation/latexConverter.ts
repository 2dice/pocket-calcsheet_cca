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

  // 定数関数の変換
  Object.entries(CONSTANT_LATEX_MAP).forEach(([fn, latexFn]) => {
    const regex = new RegExp(`\\b${fn}\\(\\)`, 'g')
    result = result.replace(regex, latexFn)
  })

  // 分数の変換を演算子変換の前に実行
  result = convertFractions(result)

  if (convertFunctions) {
    // 関数名変換（3行目のみ）
    // 注意：関数の変換順序が重要

    // まず三角関数から処理（度記号の配置を正しくするため）
    result = result.replace(/\bsin\(([^)]+)\)/g, '\\sin($1°)')
    result = result.replace(/\bcos\(([^)]+)\)/g, '\\cos($1°)')
    result = result.replace(/\btan\(([^)]+)\)/g, '\\tan($1°)')

    // 逆三角関数 -> 度記号付き
    result = result.replace(/\basin\(([^)]+)\)/g, '\\sin^{-1}($1)°')
    result = result.replace(/\bacos\(([^)]+)\)/g, '\\cos^{-1}($1)°')
    result = result.replace(/\batan\(([^)]+)\)/g, '\\tan^{-1}($1)°')

    // 対数関数
    result = result.replace(/\blog\(([^)]+)\)/g, '\\log_{10}($1)')
    result = result.replace(/\bln\(([^)]+)\)/g, '\\log_{e}($1)')

    // 特殊処理: sqrt(x) -> \sqrt{x}（バランスした括弧を考慮）
    result = replaceFunctionWithBalancedParens(
      result,
      'sqrt',
      content => `\\sqrt{${content}}`
    )

    // 特殊処理: exp(x) -> e^{x} （最後に処理して度記号の位置を保持）
    result = replaceFunctionWithBalancedParens(
      result,
      'exp',
      content => `e^{${content}}`
    )

    // 度・ラジアン変換
    result = result.replace(/\bdtor\(([^)]+)\)/g, 'dtor($1°)')
    result = result.replace(/\brtod\(([^)]+)\)/g, 'rtod($1)°')
  }

  // 基本的な演算子変換
  result = result.replace(/\s*\*\s*/g, '\\times ')

  // べき乗の変換 (a^b -> a^{b})
  result = result.replace(/\^([^{}\s]+)/g, '^{$1}')

  // モジュロ演算子の変換
  result = result.replace(/\s*%\s*/g, ' \\bmod ')

  // 空白の正規化（`\times `の後の余分な空白は保持）
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

// 分数変換のヘルパー関数
function convertFractions(expression: string): string {
  let result = expression

  // 関数の引数内での分数変換を処理
  // 関数名(...)の中での/を\fracに変換
  result = result.replace(
    /(\w+)\(([^)]*\/[^)]*)\)/g,
    (_match, funcName: string, args: string) => {
      // 引数内での分数変換 - より強力な乗算チェーン対応
      const convertedArgs = args.replace(
        /([^/\s]+(?:\s*\*\s*[^/\s]+)*)\s*\/\s*([^/\s]+)/g,
        '\\frac{$1}{$2}'
      )
      return `${funcName}(${convertedArgs})`
    }
  )

  // 修正点1: 括弧で囲まれた分数のグループ化を維持する
  result = result.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, '\\frac{({$1})}{({$2})}')

  // 修正点2: 一般的な分数の正規表現を修正し、演算子の優先順位を考慮する
  // 分母は「括弧で囲まれたグループ」か「スペースや四則演算子を含まない単一の項」に限定
  const denominator = /(?:\([^)]+\)|[^\s*/+-]+)/
  // 分子は乗算を考慮しつつも、除算の左側にあるもの
  const numerator = /[^\s/()]+(?:\s*\*\s*[^\s/()]+)*/

  const fractionRegex = new RegExp(
    `(${numerator.source})\\s*\\/\\s*(${denominator.source})`,
    'g'
  )
  result = result.replace(fractionRegex, '\\frac{$1}{$2}')

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
