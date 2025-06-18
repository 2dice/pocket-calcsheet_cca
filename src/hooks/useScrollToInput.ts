import { useEffect, type RefObject } from 'react'

/**
 * 入力要素がフォーカスされた時に、キーボードに隠れないよう自動スクロールするフック
 * モバイルブラウザのvisualViewportを考慮してスクロール調整を行う
 *
 * @param inputRef - 対象の入力要素のref
 */
export function useScrollToInput(
  inputRef: RefObject<HTMLInputElement | HTMLTextAreaElement | null>
) {
  useEffect(() => {
    const element = inputRef.current
    if (!element) return

    const handleFocus = () => {
      // requestAnimationFrameで次のフレームまで待機
      // これによりキーボードの表示が完了してからスクロール処理を実行
      requestAnimationFrame(() => {
        // visualViewportがサポートされている場合はそれを使用
        if (typeof window !== 'undefined' && window.visualViewport) {
          const rect = element.getBoundingClientRect()
          const viewportHeight = window.visualViewport.height
          const elementBottom = rect.bottom

          // 要素の下端がキーボード表示エリアに隠れる場合にスクロール
          if (elementBottom > viewportHeight - 20) {
            // 20pxのマージン
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })
          }
        } else {
          // フォールバック: 標準のscrollIntoViewを使用
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        }
      })
    }

    element.addEventListener('focus', handleFocus)

    // クリーンアップ
    return () => {
      element.removeEventListener('focus', handleFocus)
    }
  }, [inputRef])
}
