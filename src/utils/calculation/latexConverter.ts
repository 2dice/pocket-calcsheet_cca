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

  // 2. べき乗の変換（より包括的に）
  result = convertPowers(result)

  // 3. 基本的な演算子変換（分数変換前に実行）
  result = result.replace(/\s*\*\s*/g, '\\times ')

  // 4. 分数の変換（演算子の優先順位を考慮）
  result = convertFractions(result, convertFunctions)

  // 5. 関数変換（必要な場合のみ）
  if (convertFunctions) {
    result = convertFunctionNames(result)
  }

  // 6. モジュロ演算子の変換
  result = result.replace(/\s*%\s*/g, ' \\bmod ')

  // 7. 重複した度記号の削除
  result = result.replace(/°°+/g, '°')

  // 8. 空白の正規化
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

// べき乗変換の改良版
function convertPowers(expression: string): string {
  let result = expression

  // より包括的なべき乗パターンに対応
  // べき乗記号の後の指数を {} で囲む

  // 1. 任意の式^指数 のパターンを包括的に変換
  // 指数部分: 数値、変数、単語、負号付きなど
  result = result.replace(/\^(-?[\d.a-zA-Z[\]_]+)/g, '^{$1}')

  return result
}

// 関数名変換（3行目のみ）
function convertFunctionNames(expression: string): string {
  let result = expression

  // 1. 三角関数（度記号付き）
  result = replaceFunctionWithBalancedParens(result, 'sin', content => {
    // dtor/rtodが含まれている場合は度記号を重複させない
    if (content.includes('rtod(') && !content.includes('°')) {
      return `\\sin(${content}°)`
    } else if (content.includes('°')) {
      return `\\sin(${content})`
    }
    return `\\sin(${content}°)`
  })

  result = replaceFunctionWithBalancedParens(result, 'cos', content => {
    if (content.includes('rtod(') && !content.includes('°')) {
      return `\\cos(${content}°)`
    } else if (content.includes('°')) {
      return `\\cos(${content})`
    }
    return `\\cos(${content}°)`
  })

  result = replaceFunctionWithBalancedParens(result, 'tan', content => {
    if (content.includes('rtod(') && !content.includes('°')) {
      return `\\tan(${content}°)`
    } else if (content.includes('°')) {
      return `\\tan(${content})`
    }
    return `\\tan(${content}°)`
  })

  // 2. 逆三角関数（度記号付き、複雑な場合は\left \right追加）
  result = replaceFunctionWithBalancedParens(result, 'asin', content => {
    return `\\sin^{-1}(${content})°`
  })

  result = replaceFunctionWithBalancedParens(result, 'acos', content => {
    // 複雑な分数と平方根の組み合わせには\left \right追加
    // 分数を含み、かつ平方根を含む場合、または複雑な関数呼び出しを含む場合
    if (
      content.includes('\\frac{') &&
      (content.includes('\\sqrt{') || /\w+\([^)]*\)/.test(content))
    ) {
      return `\\cos^{-1}\\left(${content}\\right)°`
    }
    return `\\cos^{-1}(${content})°`
  })

  result = replaceFunctionWithBalancedParens(result, 'atan', content => {
    // \left \right を追加する条件：
    // 1. 分数を含む場合
    // 2. ただし、乗算演算子 (\times) を含む場合は除外
    if (content.includes('\\frac{') && !content.includes('\\times')) {
      return `\\tan^{-1}\\left(${content}\\right)°`
    }
    return `\\tan^{-1}(${content})°`
  })

  // 3. 対数関数（複雑な分数には\left \right追加）
  result = replaceFunctionWithBalancedParens(result, 'log', content => {
    return `\\log_{10}(${content})`
  })

  result = replaceFunctionWithBalancedParens(result, 'ln', content => {
    if (content.includes('\\frac{')) {
      return `\\log_{e}\\left(${content}\\right)`
    }
    return `\\log_{e}(${content})`
  })

  // 4. 平方根
  result = replaceFunctionWithBalancedParens(result, 'sqrt', content => {
    return `\\sqrt{${content}}`
  })

  // 5. 指数関数
  result = replaceFunctionWithBalancedParens(result, 'exp', content => {
    return `e^{${content}}`
  })

  // 6. 度・ラジアン変換（度記号の位置を正しく配置）
  result = replaceFunctionWithBalancedParens(result, 'dtor', content => {
    return `dtor(${content}°)`
  })

  result = replaceFunctionWithBalancedParens(result, 'rtod', content => {
    return `rtod(${content})°`
  })

  return result
}

// 分数変換の改良版（段階的な処理）
function convertFractions(
  expression: string,
  convertFunctions: boolean = false
): string {
  let result = expression

  // 1. 関数の引数内での分数変換（最優先で処理）
  result = replaceFunctionArgsWithFractions(result, convertFunctions)

  // 2. 複雑な関数全体 / 項 (例: ln(([var1]+1)/([var1]-1)) / 2)
  // バランスした括弧を考慮した関数全体の分数変換
  result = replaceFunctionCallFractions(result)

  // 3. 複雑な括弧同士の除算
  // パターンA: 複雑な式（LaTeX記号や関数呼び出しを含む）の処理
  if (convertFunctions) {
    // 関数名変換時：複雑な式は括弧を除去、単純な式は二重括弧を保持
    result = result.replace(
      /\(([^)]*[\^{}\\][^)]*)\)\/\(([^)]*[\^{}\\][^)]*)\)/g,
      '\\frac{$1}{$2}'
    )
    result = result.replace(
      /\(([^)]+)\)\/\(([^)]+)\)/g,
      '\\frac{({$1})}{({$2})}'
    )
  } else {
    // 関数名非変換時：複雑な式は単一括弧、単純な式は二重括弧
    result = result.replace(
      /\(([^)]*[\^{}\\][^)]*)\)\/\(([^)]*[\^{}\\][^)]*)\)/g,
      '\\frac{($1)}{($2)}'
    )
    result = result.replace(
      /\(([^)]+)\)\/\(([^)]+)\)/g,
      '\\frac{({$1})}{({$2})}'
    )
  }

  // 4. 関数 / 項
  result = result.replace(
    /(\w+\([^)]+\)(?:\^{[^}]+})?)\s*\/\s*([^\s/()]+)/g,
    '\\frac{$1}{$2}'
  )

  // 5. 括弧式 / 項
  result = result.replace(
    /(\([^)]+\)(?:\^{[^}]+})?)\s*\/\s*([^\s/()]+)/g,
    '\\frac{$1}{$2}'
  )

  // 6. 演算子優先順位を考慮した基本分数
  result = convertBasicFractions(result)

  return result
}

// 基本的な分数変換（左結合性を考慮）
function convertBasicFractions(expression: string): string {
  let result = expression

  // パターン1: 複雑な括弧式の分数化
  // 例: ([x]^2 + [y]^2)^0.5 / (1 + [z]^-2) → \frac{([x]^{2} + [y]^{2})^{0.5}}{1 + [z]^{-2}}
  result = result.replace(
    /(\([^)]+\)(?:\^{[^}]+})?)\s*\/\s*\(([^)]+)\)/g,
    '\\frac{$1}{$2}'
  )

  // パターン2: 乗算の連鎖 / 項
  // 例: 2*[var1]/[var2] → \frac{2\times [var1]}{[var2]}
  result = result.replace(
    /([^\s/()]+(?:\s*\\times\s*[^\s/()]+)+)\s*\/\s*([^\s/()]+)/g,
    '\\frac{$1}{$2}'
  )

  // パターン3: 関数呼び出しの分数（完全な関数を分母として扱う）
  // 例: [x]/sqrt([x]^2+[y]^2) → \frac{[x]}{sqrt([x]^{2}+[y]^{2})}
  result = result.replace(
    /([^\s/()]+)\s*\/\s*(\w+\([^)]*\))(?=\s*(?:\\times|\/|[+-]|$))/g,
    '\\frac{$1}{$2}'
  )

  // パターン4: 基本的な分数（左結合性を保持）
  // 6/2*4 は 6/2 のみを分数にして、*4 は外に残す
  // 8/4/2 は 8/4 のみを分数にして、/2 は外に残す
  result = result.replace(
    /([^\s/()]+)\s*\/\s*([^\s/()]+)(?=\s*(?:\\times|\/|[+-]|$))/g,
    '\\frac{$1}{$2}'
  )

  return result
}

// 関数の引数内で分数変換を実行（バランスした括弧を考慮）
function replaceFunctionArgsWithFractions(
  expression: string,
  convertFunctions: boolean = false
): string {
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
        let convertedArgs = args

        // まず \times を * に戻して統一的に処理
        convertedArgs = convertedArgs.replace(/\\times/g, '*')

        // パターン1: 乗算チェーン * 変数 / 単項 （例: 2*[var1]/[var2] → \frac{2*[var1]}{[var2]}）
        // 変数 [var1] を含む場合にも対応
        convertedArgs = convertedArgs.replace(
          /([^\s/()]+(?:\s*\*\s*[^\s/()[\]]+|\s*\*\s*\[[^\]]+\])+)\s*\/\s*([^\s/()]+)/g,
          '\\frac{$1}{$2}'
        )

        // パターン2: 項 / 関数呼び出し （例: [x]/sqrt([x]^2+[y]^2) → \frac{[x]}{sqrt([x]^{2}+[y]^{2})}）
        convertedArgs = convertedArgs.replace(
          /([^\s/()]+)\s*\/\s*(\w+\([^)]*\))/g,
          '\\frac{$1}{$2}'
        )

        // パターン3: 括弧で囲まれた複雑な式の分数
        if (convertFunctions) {
          // 関数名変換時は括弧を除去
          convertedArgs = convertedArgs.replace(
            /\(([^)]+)\)\/\(([^)]+)\)/g,
            '\\frac{$1}{$2}'
          )
        } else {
          // 関数名非変換時は括弧を保持
          convertedArgs = convertedArgs.replace(
            /(\([^)]+\))\/(\([^)]+\))/g,
            '\\frac{$1}{$2}'
          )
        }

        // パターン4: 基本的な分数（関数呼び出し以外）
        convertedArgs = convertedArgs.replace(
          /([^\s/()]+)\s*\/\s*([^\s/()]+)/g,
          '\\frac{$1}{$2}'
        )

        // 最後に * を \times に戻す
        convertedArgs = convertedArgs.replace(/\*/g, '\\times ')

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

// 複雑な関数呼び出し全体の分数変換
function replaceFunctionCallFractions(expression: string): string {
  let result = expression
  const functionRegex = /(\w+)\(/g
  let match

  while ((match = functionRegex.exec(result)) !== null) {
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
      // 関数呼び出しの終了位置の後に / があるかチェック
      const afterFunction = result.substring(endIndex)

      // パターン: function(...) / term
      const fractionMatch = afterFunction.match(/^\s*\/\s*([^\s/()]+)/)

      if (fractionMatch) {
        const functionCall = result.substring(startIndex, endIndex)
        const denominator = fractionMatch[1]
        const wholeMatchEnd = endIndex + fractionMatch[0].length

        // 関数呼び出し全体を分子とする分数に変換
        const replacement = `\\frac{${functionCall}}{${denominator}}`

        result =
          result.substring(0, startIndex) +
          replacement +
          result.substring(wholeMatchEnd)

        // 検索位置をリセット
        functionRegex.lastIndex = startIndex + replacement.length
      } else {
        // このマッチをスキップして次の関数に進む
        functionRegex.lastIndex = endIndex
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
