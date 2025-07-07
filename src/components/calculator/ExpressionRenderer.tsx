import { useEffect, useRef } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import {
  usesFunctions,
  convertToLatexWithoutFunctionNames,
  convertToLatexWithFunctionNames,
} from '@/utils/calculation/latexConverter'

interface Props {
  expression: string
  className?: string
}

export function ExpressionRenderer({ expression, className }: Props) {
  const line2Ref = useRef<HTMLDivElement>(null)
  const line3Ref = useRef<HTMLDivElement>(null)

  const hasFunction = usesFunctions(expression)
  const latexWithoutFn = convertToLatexWithoutFunctionNames(expression)
  const latexWithFn = convertToLatexWithFunctionNames(expression)

  // KaTeXでレンダリング
  useEffect(() => {
    if (hasFunction && line2Ref.current) {
      try {
        katex.render(latexWithoutFn, line2Ref.current, {
          throwOnError: false,
          displayMode: false,
        })
      } catch (error) {
        console.warn('KaTeX rendering failed:', error)
        line2Ref.current.textContent = latexWithoutFn
      }
    }

    if (line3Ref.current) {
      try {
        katex.render(latexWithFn, line3Ref.current, {
          throwOnError: false,
          displayMode: false,
        })
      } catch (error) {
        console.warn('KaTeX rendering failed:', error)
        line3Ref.current.textContent = latexWithFn
      }
    }
  }, [expression, hasFunction, latexWithoutFn, latexWithFn])

  return (
    <div className={className}>
      {/* 1行目：元の式 */}
      <div className="font-mono text-sm whitespace-pre-wrap break-all">
        {expression}
      </div>

      {/* 2行目：関数名そのまま（関数使用時のみ） */}
      {hasFunction && (
        <div ref={line2Ref} className="mt-2 text-base break-all" />
      )}

      {/* 3行目：関数名変換 */}
      <div ref={line3Ref} className="mt-2 text-base break-all" />
    </div>
  )
}
