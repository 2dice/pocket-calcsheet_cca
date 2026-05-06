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

  // 6.5. 基本分数の正規化（a/(\frac{b}{c})）
  result = result.replace(
    /([^\s/()]+)\s*\/\s*\((\\frac\{[^{}]+\}\{[^{}]+\})\)/g,
    '\\frac{$1}{$2}'
  )

  // 7. 重複した度記号の削除
  result = result.replace(/°°+/g, '°')

  // 8. 空白の正規化
  result = result.replace(/\s+/g, ' ').trim()

  return result
}

// べき乗変換の改良版
function convertPowers(expression: string): string {
  let result = ''
  for (let i = 0; i < expression.length; i++) {
    const current = expression[i]
    if (current !== '^') {
      result += current
      continue
    }

    const next = expression[i + 1]
    if (next === '(') {
      let depth = 1
      let j = i + 2
      while (j < expression.length && depth > 0) {
        if (expression[j] === '(') depth++
        if (expression[j] === ')') depth--
        j++
      }

      if (depth === 0) {
        const content = expression.slice(i + 1, j) // "(...)"
        result += `^{${content}}`
        i = j - 1
        continue
      }
    }

    const match = expression.slice(i + 1).match(/^-?[\d.a-zA-Z[\]_]+/)
    if (match) {
      result += `^{${match[0]}}`
      i += match[0].length
      continue
    }

    result += '^'
  }

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
  const structuralResult = convertFractionsStructurally(expression)
  if (structuralResult !== null) {
    return structuralResult
  }

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

  // 4. 括弧式 / 項
  result = result.replace(
    /(\([^)]+\)(?:\^{[^}]+})?)\s*\/\s*(\w+\([^)]*\)(?:\^\{[^}]+\})?|[^\s/()+\-*]+)/g,
    '\\frac{$1}{$2}'
  )

  // 5. 演算子優先順位を考慮した基本分数
  result = convertBasicFractions(result)
  if (convertFunctions) {
    result = result.replace(
      /(\d+)\\times \\frac\{(\d+)\}\{(\d+)\}/g,
      '$1\\times\\frac{$2}{$3}'
    )
    result = result.replace(
      /\\times \((\\frac\{[^{}]+\}\{[^{}]+\})\)/g,
      '\\times($1)'
    )
  }

  return result
}

type FractionAstNode =
  | { type: 'raw'; value: string }
  | { type: 'unary'; operator: '-'; value: FractionAstNode }
  | {
      type: 'binary'
      operator: '+' | '-' | '*' | '/'
      left: FractionAstNode
      right: FractionAstNode
    }
  | { type: 'paren'; value: FractionAstNode }
  | { type: 'function'; name: string; args: FractionAstNode[] }

type FractionToken =
  | { type: 'raw'; value: string }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'paren'; value: '(' | ')' }
  | { type: 'comma'; value: ',' }

function convertFractionsStructurally(expression: string): string | null {
  if (!shouldUseStructuralFractionConverter(expression)) {
    return null
  }

  const tokens = tokenizeFractionExpression(expression)
  if (tokens === null) {
    return null
  }

  const parser = new FractionExpressionParser(tokens)
  const ast = parser.parse()
  if (ast === null || !parser.isAtEnd()) {
    return null
  }

  return formatFractionAst(ast)
}

function shouldUseStructuralFractionConverter(expression: string): boolean {
  if (!expression.includes('/') || expression.includes('[')) {
    return false
  }

  if (expression.includes('pi')) {
    return false
  }

  return (
    expression.startsWith('((') ||
    /\/\s*\(\(/.test(expression) ||
    /\/\s*\([^()]*\/[^()]*\)/.test(expression) ||
    /\b(?:sin|cos|tan|asin|acos|atan|sqrt|log|ln|exp|dtor|rtod)\([^)]*\)\s*[+-]/.test(
      expression
    )
  )
}

function tokenizeFractionExpression(
  expression: string
): FractionToken[] | null {
  const tokens: FractionToken[] = []
  let index = 0

  while (index < expression.length) {
    const current = expression[index]

    if (/\s/.test(current)) {
      index++
      continue
    }

    if (current === '\\' && expression.startsWith('\\times', index)) {
      tokens.push({ type: 'operator', value: '*' })
      index += '\\times'.length
      continue
    }

    if (
      current === '+' ||
      current === '-' ||
      current === '*' ||
      current === '/'
    ) {
      tokens.push({ type: 'operator', value: current })
      index++
      continue
    }

    if (current === '(' || current === ')') {
      tokens.push({ type: 'paren', value: current })
      index++
      continue
    }

    if (current === ',') {
      tokens.push({ type: 'comma', value: current })
      index++
      continue
    }

    let endIndex = index
    while (endIndex < expression.length) {
      const char = expression[endIndex]
      if (
        /\s/.test(char) ||
        char === '(' ||
        char === ')' ||
        char === ',' ||
        char === '/' ||
        char === '*'
      ) {
        break
      }

      if ((char === '+' || char === '-') && endIndex > index) {
        const previous = expression[endIndex - 1]
        if (previous !== '^') {
          break
        }
      }

      endIndex++
    }

    if (endIndex === index) {
      return null
    }

    tokens.push({ type: 'raw', value: expression.slice(index, endIndex) })
    index = endIndex
  }

  return tokens
}

class FractionExpressionParser {
  private current = 0
  private readonly tokens: FractionToken[]

  constructor(tokens: FractionToken[]) {
    this.tokens = tokens
  }

  parse(): FractionAstNode | null {
    return this.parseAdditive()
  }

  isAtEnd(): boolean {
    return this.current >= this.tokens.length
  }

  private parseAdditive(): FractionAstNode | null {
    let node = this.parseMultiplicative()
    if (node === null) return null

    while (this.matchOperator('+') || this.matchOperator('-')) {
      const operator = this.previous().value as '+' | '-'
      const right = this.parseMultiplicative()
      if (right === null) return null
      node = { type: 'binary', operator, left: node, right }
    }

    return node
  }

  private parseMultiplicative(): FractionAstNode | null {
    let node = this.parseUnary()
    if (node === null) return null

    while (this.matchOperator('*') || this.matchOperator('/')) {
      const operator = this.previous().value as '*' | '/'
      const right = this.parseUnary()
      if (right === null) return null
      node = { type: 'binary', operator, left: node, right }
    }

    return node
  }

  private parseUnary(): FractionAstNode | null {
    if (this.matchOperator('-')) {
      const value = this.parseUnary()
      if (value === null) return null
      return { type: 'unary', operator: '-', value }
    }

    return this.parsePrimary()
  }

  private parsePrimary(): FractionAstNode | null {
    if (this.matchRaw()) {
      const rawToken = this.previous()
      if (rawToken.type !== 'raw') return null

      if (this.matchParen('(')) {
        const args = this.parseFunctionArgs()
        if (args === null) return null
        return { type: 'function', name: rawToken.value, args }
      }

      return { type: 'raw', value: rawToken.value }
    }

    if (this.matchParen('(')) {
      const value = this.parseAdditive()
      if (value === null || !this.matchParen(')')) {
        return null
      }
      return { type: 'paren', value }
    }

    return null
  }

  private parseFunctionArgs(): FractionAstNode[] | null {
    const args: FractionAstNode[] = []
    if (this.matchParen(')')) {
      return args
    }

    do {
      const arg = this.parseAdditive()
      if (arg === null) return null
      args.push(arg)
    } while (this.matchComma())

    if (!this.matchParen(')')) {
      return null
    }

    return args
  }

  private matchOperator(operator: FractionToken['value']): boolean {
    const token = this.peek()
    if (token?.type !== 'operator' || token.value !== operator) {
      return false
    }
    this.current++
    return true
  }

  private matchParen(paren: '(' | ')'): boolean {
    const token = this.peek()
    if (token?.type !== 'paren' || token.value !== paren) {
      return false
    }
    this.current++
    return true
  }

  private matchRaw(): boolean {
    if (this.peek()?.type !== 'raw') {
      return false
    }
    this.current++
    return true
  }

  private matchComma(): boolean {
    if (this.peek()?.type !== 'comma') {
      return false
    }
    this.current++
    return true
  }

  private peek(): FractionToken | undefined {
    return this.tokens[this.current]
  }

  private previous(): FractionToken {
    return this.tokens[this.current - 1]
  }
}

function formatFractionAst(node: FractionAstNode): string {
  switch (node.type) {
    case 'raw':
      return node.value
    case 'unary':
      return `-${formatFractionAst(node.value)}`
    case 'paren':
      return `(${formatFractionAst(node.value)})`
    case 'function':
      return `${node.name}(${node.args.map(formatFractionAst).join(', ')})`
    case 'binary':
      if (node.operator === '/') {
        return `\\frac{${formatFractionAst(node.left)}}{${formatFractionAst(node.right)}}`
      }
      return `${formatFractionAst(node.left)}${formatFractionOperator(node.operator)}${formatFractionAst(node.right)}`
  }
}

function formatFractionOperator(operator: '+' | '-' | '*'): string {
  if (operator === '*') {
    return '\\times '
  }
  return operator
}

// 基本的な分数変換（左結合性を考慮）
function convertBasicFractions(expression: string): string {
  let result = expression

  // パターン-1: (a)/b/c の左結合
  result = result.replace(
    /\(([^()]+)\)\s*\/\s*([^\s/()]+)\s*\/\s*([^\s/()]+)/g,
    '\\frac{\\frac{($1)}{$2}}{$3}'
  )
  // パターン-1b: a/(b/c) の左結合
  result = result.replace(
    /([^\s/()]+)\s*\/\s*\((\\frac\{.+?\}\{.+?\})\)/g,
    '\\frac{$1}{$2}'
  )

  // パターン0: a/b*c/d の連鎖を左結合で分数化
  // 例: 5/4*3/2 → \frac{5}{4}\times \frac{3}{2}
  result = result.replace(
    /(^|[\s(])([^\s/()*+-]+)\s*\/\s*([^\s/()*+-]+)\s*\\times\s*([^\s/()*+-]+)\s*\/\s*([^\s/()*+-]+)(?=$|[\s)])/g,
    '$1\\frac{$2}{$3}\\times \\frac{$4}{$5}'
  )
  // パターン0b: (a/b)/c の二重分数化
  result = result.replace(
    /\(([^()/]+)\s*\/\s*(\w+\([^)]*\)(?:\^\{[^}]+\})?)\)\s*\/\s*([^\s/()]+)/g,
    '\\frac{\\frac{$1}{$2}}{$3}'
  )

  // パターン1: 複雑な括弧式の分数化
  // 例: ([x]^2 + [y]^2)^0.5 / (1 + [z]^-2) → \frac{([x]^{2} + [y]^{2})^{0.5}}{1 + [z]^{-2}}
  result = result.replace(
    /(\([^)]+\)(?:\^{[^}]+})?)\s*\/\s*\(([^)]+)\)/g,
    '\\frac{$1}{$2}'
  )
  // パターン1b: 単項 / ((関数呼び出し)) の分数化
  result = result.replace(
    /([^\s/()]+)\s*\/\s*(\(\w+\([^)]*\)\))/g,
    '\\frac{$1}{$2}'
  )

  // パターン2: 乗算の連鎖 / 項
  // 例: 2*[var1]/[var2] → \frac{2\times [var1]}{[var2]}
  result = result.replace(
    /(\d+(?:\.\d+)?)\s*\\times\s*([^\s/()+*-]+)\s*\/\s*([^\s/()+*-]+)/g,
    '$1\\times \\frac{$2}{$3}'
  )
  result = result.replace(
    /([^\s/()]+(?:\s*\\times\s*[^\s/()]+)+)\s*\/\s*([^\s/()+-]+)/g,
    '\\frac{$1}{$2}'
  )

  // パターン3: 関数呼び出しの分数（完全な関数を分母として扱う）
  // 例: [x]/sqrt([x]^2+[y]^2) → \frac{[x]}{sqrt([x]^{2}+[y]^{2})}
  result = result.replace(
    /([^\s/()]+)\s*\/\s*(\w+\([^)]*\)(?:\^\{[^}]+\})?)(?=\s*(?:\\times|\/|[+-]|$))/g,
    '\\frac{$1}{$2}'
  )

  // パターン3b: 項 / (複合式)
  result = result.replace(
    /([^\s/()]+)\s*\/\s*(\([^()]*\\times[^()]*\))/g,
    '\\frac{$1}{$2}'
  )
  result = result.replace(
    /([^\s/()]+)\s*\/\s*(\(\\frac\{[^{}]+\}\{[^{}]+\}\))/g,
    '\\frac{$1}{$2}'
  )

  // パターン4: 基本的な分数（左結合性を保持）
  // 6/2*4 は 6/2 のみを分数にして、*4 は外に残す
  // 8/4/2 は 8/4 のみを分数にして、/2 は外に残す
  result = result.replace(
    /([^\s/()+*-]+)\s*\/\s*([^\s/()+*-]+)(?=\s*(?:\\times|\/|[+-]|$))/g,
    '\\frac{$1}{$2}'
  )
  result = result.replace(
    /\(([^()/+\-*]+)\s*\/\s*([^()/+\-*]+)\)/g,
    '(\\frac{$1}{$2})'
  )
  result = result.replace(
    /(\\frac\{[^{}]+\}\{[^{}]+\})\s*\/\s*([^\s/()]+)/g,
    '\\frac{$1}{$2}'
  )
  // パターン5: 変換途中で崩れた入れ子分数の正規化
  result = result.replace(
    /\\frac\{\(([^)]+)\)\\frac\{\}\{([^}]+)\}\}\{([^}]+)\}/g,
    '\\frac{\\frac{($1)}{$2}}{$3}'
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

        // パターン0: (式)/項
        convertedArgs = convertedArgs.replace(
          /^\((.+)\)\s*\/\s*([^\s/()]+)$/g,
          '\\frac{($1)}{$2}'
        )

        // パターン1: 乗算チェーン * 変数 / 単項 の特別処理
        // 例: 2*[var1]/[var2] → 2*\frac{[var1]}{[var2]} (先頭の係数を外に出す)
        convertedArgs = convertedArgs.replace(
          /^([^\s/()]+)\s*\*\s*([^\s/()[\]]+|\[[^\]]+\])\s*\/\s*([^\s/()]+)/g,
          '$1*\\frac{$2}{$3}'
        )

        // パターン1b: その他の乗算チェーン / 単項 （例: a*b*c/d → \frac{a*b*c}{d}）
        convertedArgs = convertedArgs.replace(
          /([^\s/()]+(?:\s*\*\s*[^\s/()[\]]+|\s*\*\s*\[[^\]]+\]){2,})\s*\/\s*([^\s/()]+)/g,
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
          /([^\s/()+*-]+)\s*\/\s*([^\s/()+*-]+)/g,
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
