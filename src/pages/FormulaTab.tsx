import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FormulaInput } from '@/components/calculator/FormulaInput'
import { CustomKeyboard } from '@/components/keyboard/CustomKeyboard'
import { useSheetsStore } from '@/store'
import { useUIStore } from '@/store/uiStore'

const KEYBOARD_HEIGHT = 280

export function FormulaTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, initializeSheet } = useSheetsStore()
  const { keyboardState, hideKeyboard } = useUIStore()

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.formulaData) {
      initializeSheet(id)
    }
  }, [id, sheet, initializeSheet])

  // documentレベルでのクリックイベント監視
  useEffect(() => {
    if (!keyboardState.visible || keyboardState.target?.type !== 'formula') {
      return
    }

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement

      // TEXTAREA内のクリックは無視
      if (target.tagName === 'TEXTAREA' || target.closest('textarea')) {
        return
      }

      // カスタムキーボード内のクリックは無視
      const keyboard = document.querySelector('[data-testid="custom-keyboard"]')
      if (keyboard && keyboard.contains(target)) {
        return
      }

      hideKeyboard()
    }

    // 少し遅延させてから登録（現在のクリックイベントと競合しないように）
    const timer = setTimeout(() => {
      document.addEventListener('click', handleDocumentClick)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [keyboardState, hideKeyboard])

  if (!sheet) {
    return (
      <div className="p-4">
        <div className="text-gray-600">シートが見つかりません。</div>
      </div>
    )
  }

  if (!sheet.formulaData) {
    return (
      <div className="p-4">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <>
      <div
        className="p-4 pb-safe h-full overflow-y-auto"
        style={{
          paddingBottom: `calc(${KEYBOARD_HEIGHT}px + env(safe-area-inset-bottom))`,
        }}
      >
        <FormulaInput value={sheet.formulaData.inputExpr} />
        {/* Result表示は次のステップで実装 */}
      </div>

      <CustomKeyboard visible={keyboardState.visible} />
    </>
  )
}
