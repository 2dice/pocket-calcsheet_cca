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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sheet?.formulaData])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardState.visible, id])

  const handleFormulaChange = (value: string) => {
    if (id) {
      updateFormulaData(id, { inputExpr: value })
    }
  }

  const handleOutsideClick = (e: React.MouseEvent) => {
    const target = e.target
    if (target instanceof HTMLElement && target.tagName !== 'TEXTAREA') {
      hideKeyboard()
    }
  }

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
        onClick={handleOutsideClick}
        style={{
          paddingBottom: `calc(${KEYBOARD_HEIGHT}px + env(safe-area-inset-bottom))`,
        }}
      >
        <FormulaInput
          value={sheet.formulaData.inputExpr}
          onChange={handleFormulaChange}
        />
        {/* Result表示は次のステップで実装 */}
      </div>

      <CustomKeyboard visible={keyboardState.visible} />
    </>
  )
}
