import { useEffect, type RefObject } from 'react'

const KEYBOARD_HEIGHT = 280

/**
 * 入力要素がフォーカスされた時に、キーボードに隠れないよう自動スクロールするフック
 * モバイルブラウザのvisualViewportを考慮してスクロール調整を行う
 *
 * @param inputRef - 対象の入力要素のref
 */
export function useScrollToInput(
  ref: RefObject<HTMLInputElement | HTMLTextAreaElement | HTMLElement | null>
) {
  useEffect(() => {
    if (!ref.current) return

    const handleFocus = () => {
      const element = ref.current
      if (!element) return

      requestAnimationFrame(() => {
        if (typeof window === 'undefined') return

        const rect = element.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const elementBottom = rect.bottom
        const elementTop = rect.top

        // キーボードで隠れる位置を計算
        const keyboardTop = viewportHeight - KEYBOARD_HEIGHT

        if (elementBottom > keyboardTop) {
          // スクロール可能な最大値を計算
          const maxScroll =
            document.documentElement.scrollHeight - viewportHeight
          const currentScroll = window.scrollY

          // 必要なスクロール量
          const idealScrollBy = elementBottom - keyboardTop + 40 // 40pxの余裕

          // 実際にスクロール可能な量
          const actualScrollBy = Math.min(
            idealScrollBy,
            maxScroll - currentScroll
          )

          if (actualScrollBy > 0) {
            window.scrollBy({
              top: actualScrollBy,
              behavior: 'smooth',
            })
          } else if (elementTop < 0) {
            // 要素が画面上部に隠れている場合
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        }
      })
    }

    const element = ref.current
    element.addEventListener('focus', handleFocus)

    return () => {
      element.removeEventListener('focus', handleFocus)
    }
  }, [ref])
}
