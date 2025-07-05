import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FormulaInput } from '@/components/calculator/FormulaInput'
import { CustomKeyboard } from '@/components/keyboard/CustomKeyboard'
import { useSheetsStore } from '@/store'
import { useUIStore } from '@/store/uiStore'

const KEYBOARD_HEIGHT = 280

export function FormulaTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateFormulaData, initializeSheet } = useSheetsStore()
  const { keyboardState, hideKeyboard } = useUIStore()

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.formulaData) {
      initializeSheet(id)
    }
  }, [id, sheet, initializeSheet])

  // hideKeyboard実行時に値を保存
  useEffect(() => {
    // キーボードが非表示になった時に保存
    if (
      !keyboardState.visible &&
      keyboardState.target?.type === 'formula' &&
      id
    ) {
      const { keyboardInput } = useUIStore.getState()
      if (keyboardInput !== null) {
        updateFormulaData(id, { inputExpr: keyboardInput.value })
      }
    }
  }, [keyboardState, id, updateFormulaData])

  const handleOutsideClick = () => hideKeyboard()

  if (!sheet) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-gray-600">シートが見つかりません。</div>
      </div>
    )
  }

  if (!sheet.formulaData) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" onClick={handleOutsideClick}>
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
    </div>
  )
}
