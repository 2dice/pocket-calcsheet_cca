import { useEffect, type RefObject } from 'react'

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

      // カスタムキーボードの高さを考慮（約280px）
      const KEYBOARD_HEIGHT = 280

      requestAnimationFrame(() => {
        if (typeof window === 'undefined') return

        const rect = element.getBoundingClientRect()
        const viewportHeight = window.innerHeight
        const elementBottom = rect.bottom

        // キーボードで隠れる位置を計算
        const keyboardTop = viewportHeight - KEYBOARD_HEIGHT

        if (elementBottom > keyboardTop) {
          // 要素がキーボードで隠れる場合はスクロール
          const scrollBy = elementBottom - keyboardTop + 20 // 20pxの余裕を追加
          window.scrollBy({
            top: scrollBy,
            behavior: 'smooth',
          })
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
