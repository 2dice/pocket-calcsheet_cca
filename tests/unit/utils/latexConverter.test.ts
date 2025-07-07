import { describe, it, expect } from 'vitest'
import {
  usesFunctions,
  convertToLatexWithoutFunctionNames,
  convertToLatexWithFunctionNames,
} from '@/utils/calculation/latexConverter'

describe('latexConverter', () => {
  describe('usesFunctions', () => {
    it('関数を含む式でtrueを返す', () => {
      expect(usesFunctions('sin(30)')).toBe(true)
      expect(usesFunctions('sqrt(4)')).toBe(true)
      expect(usesFunctions('atan(1)')).toBe(true)
      expect(usesFunctions('log(100)')).toBe(true)
      expect(usesFunctions('ln(2)')).toBe(true)
    })

    it('random、pi、eのみの場合はfalseを返す', () => {
      expect(usesFunctions('random(1,10)')).toBe(false)
      expect(usesFunctions('pi() * 2')).toBe(false)
      expect(usesFunctions('e() + 1')).toBe(false)
      expect(usesFunctions('pi() + e() + random(0,1)')).toBe(false)
    })

    it('関数を含まない式でfalseを返す', () => {
      expect(usesFunctions('2 + 3')).toBe(false)
      expect(usesFunctions('[var1] * [var2]')).toBe(false)
      expect(usesFunctions('100 + [var_x]')).toBe(false)
    })

    it('関数と除外対象の組み合わせでtrueを返す', () => {
      expect(usesFunctions('sin(pi())')).toBe(true)
      expect(usesFunctions('sqrt(random(1,10))')).toBe(true)
    })
  })

  describe('convertToLatexWithoutFunctionNames', () => {
    it('基本的な演算子を変換する', () => {
      expect(convertToLatexWithoutFunctionNames('2 * 3')).toBe('2\\times 3')
      expect(convertToLatexWithoutFunctionNames('4 / 2')).toBe('\\frac{4}{2}')
      expect(convertToLatexWithoutFunctionNames('2^3')).toBe('2^{3}')
    })

    it('変数参照を保持する', () => {
      expect(convertToLatexWithoutFunctionNames('[var1] * [var2]')).toBe(
        '[var1]\\times [var2]'
      )
      expect(convertToLatexWithoutFunctionNames('2 * [var1] / [var2]')).toBe(
        '\\frac{2\\times [var1]}{[var2]}'
      )
    })

    it('関数名をそのまま保持する', () => {
      expect(convertToLatexWithoutFunctionNames('atan(2)')).toBe('atan(2)')
      expect(convertToLatexWithoutFunctionNames('sin(30)')).toBe('sin(30)')
      expect(convertToLatexWithoutFunctionNames('sqrt(4)')).toBe('sqrt(4)')
    })
  })

  describe('convertToLatexWithFunctionNames', () => {
    it('関数名をLaTeX形式に変換する', () => {
      expect(convertToLatexWithFunctionNames('atan(1)')).toBe('\\tan^{-1}(1)°')
      expect(convertToLatexWithFunctionNames('sin(30)')).toBe('\\sin(30°)')
      expect(convertToLatexWithFunctionNames('sqrt(4)')).toBe('\\sqrt{4}')
      expect(convertToLatexWithFunctionNames('log(100)')).toBe(
        '\\log_{10}(100)'
      )
      expect(convertToLatexWithFunctionNames('ln(2)')).toBe('\\log_{e}(2)')
    })

    it('定数関数を変換する', () => {
      expect(convertToLatexWithFunctionNames('pi()')).toBe('\\pi')
      expect(convertToLatexWithFunctionNames('e()')).toBe('e')
    })

    it('関数を含まない式はそのまま変換する', () => {
      expect(convertToLatexWithFunctionNames('2 * 3')).toBe('2\\times 3')
      expect(convertToLatexWithFunctionNames('[var1] + [var2]')).toBe(
        '[var1] + [var2]'
      )
    })
  })

  describe('design_others.mdのテストケース', () => {
    it('atan(2*[var1]/[var2])を正しく変換する', () => {
      const input = 'atan(2*[var1]/[var2])'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'atan(\\frac{2\\times [var1]}{[var2]})'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\tan^{-1}(\\frac{2\\times [var1]}{[var2]})°'
      )
    })

    it('(100 + [var_x]) % [var_y]を正しく変換する', () => {
      const input = '(100 + [var_x]) % [var_y]'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        '(100 + [var_x]) \\bmod [var_y]'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '(100 + [var_x]) \\bmod [var_y]'
      )
    })

    it('exp(pi() * [i]) + e()を正しく変換する', () => {
      const input = 'exp(pi() * [i]) + e()'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'exp(\\pi\\times [i]) + e'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        'e^{\\pi\\times [i]} + e'
      )
    })

    it('sqrt(log(100*[var1]))を正しく変換する', () => {
      const input = 'sqrt(log(100*[var1]))'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'sqrt(log(100\\times [var1]))'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\sqrt{\\log_{10}(100\\times [var1])}'
      )
    })

    it('1 + exp(-sin(30*[var1]))を正しく変換する', () => {
      const input = '1 + exp(-sin(30*[var1]))'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        '1 + exp(-sin(30\\times [var1]))'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '1 + e^{-\\sin(30\\times [var1]°)}'
      )
    })

    it('(sin([x]))^2 + (cos([x]))^2を正しく変換する', () => {
      const input = '(sin([x]))^2 + (cos([x]))^2'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        '(sin([x]))^{2} + (cos([x]))^{2}'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '(\\sin([x]°))^{2} + (\\cos([x]°))^{2}'
      )
    })

    it('acos([x]/sqrt([x]^2+[y]^2))を正しく変換する', () => {
      const input = 'acos([x]/sqrt([x]^2+[y]^2))'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'acos(\\frac{[x]}{sqrt([x]^{2}+[y]^{2})})'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\cos^{-1}\\left(\\frac{[x]}{\\sqrt{[x]^{2}+[y]^{2}}}\\right)°'
      )
    })

    it('random(0, 1) * ([max] - [min]) + [min]を正しく変換する', () => {
      const input = 'random(0, 1) * ([max] - [min]) + [min]'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'random(0, 1)\\times ([max] - [min]) + [min]'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        'random(0, 1)\\times ([max] - [min]) + [min]'
      )
    })

    it('sqrt([a]^2 + [b]^2 - 2*[a]*[b]*cos([c]))を正しく変換する', () => {
      const input = 'sqrt([a]^2 + [b]^2 - 2*[a]*[b]*cos([c]))'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'sqrt([a]^{2} + [b]^{2} - 2\\times [a]\\times [b]\\times cos([c]))'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\sqrt{[a]^{2} + [b]^{2} - 2\\times [a]\\times [b]\\times \\cos([c]°)}'
      )
    })

    it('ln(([var1]+1)/([var1]-1)) / 2を正しく変換する', () => {
      const input = 'ln(([var1]+1)/([var1]-1)) / 2'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        '\\frac{ln(\\frac{([var1]+1)}{([var1]-1)})}{2}'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\frac{\\log_{e}\\left(\\frac{[var1]+1}{[var1]-1}\\right)}{2}'
      )
    })

    it('([x]^2 + [y]^2)^0.5 / (1 + [z]^-2)を正しく変換する', () => {
      const input = '([x]^2 + [y]^2)^0.5 / (1 + [z]^-2)'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        '\\frac{([x]^{2} + [y]^{2})^{0.5}}{1 + [z]^{-2}}'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\frac{([x]^{2} + [y]^{2})^{0.5}}{1 + [z]^{-2}}'
      )
    })

    it('atan([y]/[x]) + atan([y2]/[x2])を正しく変換する', () => {
      const input = 'atan([y]/[x]) + atan([y2]/[x2])'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'atan(\\frac{[y]}{[x]}) + atan(\\frac{[y2]}{[x2]})'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\tan^{-1}\\left(\\frac{[y]}{[x]}\\right)° + \\tan^{-1}\\left(\\frac{[y2]}{[x2]}\\right)°'
      )
    })

    it('exp(1) * sin(rtod(pi()/6)) - log(10)を正しく変換する', () => {
      const input = 'exp(1) * sin(rtod(pi()/6)) - log(10)'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        'exp(1)\\times sin(rtod(\\frac{\\pi}{6})) - log(10)'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        'e^{1}\\times \\sin(rtod(\\frac{\\pi}{6})°) - \\log_{10}(10)'
      )
    })

    it('(e()^[var1] - e()^-[var1])/(e()^[var1] + e()^-[var1]) + tan(asin([var2]))を正しく変換する', () => {
      const input =
        '(e()^[var1] - e()^-[var1])/(e()^[var1] + e()^-[var1]) + tan(asin([var2]))'

      expect(convertToLatexWithoutFunctionNames(input)).toBe(
        '\\frac{(e^{[var1]} - e^{-[var1]})}{(e^{[var1]} + e^{-[var1]})} + tan(asin([var2]))'
      )

      expect(convertToLatexWithFunctionNames(input)).toBe(
        '\\frac{e^{[var1]} - e^{-[var1]}}{e^{[var1]} + e^{-[var1]}} + \\tan(\\sin^{-1}([var2])°)'
      )
    })
  })

  describe('演算子の優先順位と式のグループ化', () => {
    it('乗除算の左結合性を正しく処理する', () => {
      // 6/2*4 は (6/2)*4 と解釈され、\frac{6}{2} \times 4 となるべき
      expect(convertToLatexWithoutFunctionNames('6/2*4')).toBe(
        '\\frac{6}{2}\\times 4'
      )
      expect(convertToLatexWithFunctionNames('6/2*4')).toBe(
        '\\frac{6}{2}\\times 4'
      )

      // 8/4/2 は (8/4)/2 と解釈され、\frac{8/4}{2} ではなく \frac{8}{4}/2 となるべき
      expect(convertToLatexWithoutFunctionNames('8/4/2')).toBe('\\frac{8}{4}/2')
      expect(convertToLatexWithFunctionNames('8/4/2')).toBe('\\frac{8}{4}/2')
    })

    it('括弧で囲まれた式の除算でグループ化を維持する', () => {
      // (1+1)/(1+1) は \frac{({1+1})}{({1+1})} となるべき
      expect(convertToLatexWithoutFunctionNames('(1+1)/(1+1)')).toBe(
        '\\frac{({1+1})}{({1+1})}'
      )
      expect(convertToLatexWithFunctionNames('(1+1)/(1+1)')).toBe(
        '\\frac{({1+1})}{({1+1})}'
      )

      // (a+b)/(c+d) の場合も同様
      expect(convertToLatexWithoutFunctionNames('([a]+[b])/([c]+[d])')).toBe(
        '\\frac{({[a]+[b]})}{({[c]+[d]})}'
      )
      expect(convertToLatexWithFunctionNames('([a]+[b])/([c]+[d])')).toBe(
        '\\frac{({[a]+[b]})}{({[c]+[d]})}'
      )
    })

    it('複雑な混合式を正しく処理する', () => {
      // 6/2*4 + 8/4*2 のような複雑な式
      expect(convertToLatexWithoutFunctionNames('6/2*4 + 8/4*2')).toBe(
        '\\frac{6}{2}\\times 4 + \\frac{8}{4}\\times 2'
      )
      expect(convertToLatexWithFunctionNames('6/2*4 + 8/4*2')).toBe(
        '\\frac{6}{2}\\times 4 + \\frac{8}{4}\\times 2'
      )
    })
  })

  describe('エラーハンドリング', () => {
    it('無効な式の場合は元の式を返す', () => {
      const invalidInput = 'invalid((('

      expect(convertToLatexWithoutFunctionNames(invalidInput)).toBe(
        invalidInput
      )

      expect(convertToLatexWithFunctionNames(invalidInput)).toBe(invalidInput)
    })

    it('空文字列の場合は空文字列を返す', () => {
      expect(convertToLatexWithoutFunctionNames('')).toBe('')
      expect(convertToLatexWithFunctionNames('')).toBe('')
    })
  })
})
