import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { FormulaInput } from '@/components/calculator/FormulaInput'
import { ResultDisplay } from '@/components/calculator/ResultDisplay'
import { CustomKeyboard } from '@/components/keyboard/CustomKeyboard'
import { useSheetsStore } from '@/store'
import { useUIStore } from '@/store/uiStore'
import { useCalculation } from '@/hooks/useCalculation'
import { formatForFormula } from '@/utils/calculation/numberFormatter'

const KEYBOARD_HEIGHT = 280

export function FormulaTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateFormulaData, initializeSheet } = useSheetsStore()
  const { keyboardState, hideKeyboard } = useUIStore()
  const { calculateFormula } = useCalculation()

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.formulaData) {
      initializeSheet(id)
    }
  }, [id, sheet, initializeSheet])

  // タブ遷移時の計算
  useEffect(() => {
    if (id && sheet?.formulaData) {
      calculateFormula(id)
    }
  }, [id, calculateFormula, sheet?.formulaData])

  // hideKeyboard実行時に値を保存と計算
  useEffect(() => {
    if (
      !keyboardState.visible &&
      keyboardState.target?.type === 'formula' &&
      id
    ) {
      const { keyboardInput } = useUIStore.getState()
      if (keyboardInput !== null) {
        updateFormulaData(id, { inputExpr: keyboardInput.value })
        // 入力確定後に計算実行
        setTimeout(() => calculateFormula(id), 0)
      }
    }
  }, [keyboardState, id, updateFormulaData, calculateFormula])

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
        <FormulaInput value={sheet.formulaData.inputExpr} />

        <ResultDisplay
          result={sheet.formulaData.result}
          error={sheet.formulaData.error}
          className="mt-6"
          formatter={formatForFormula} // Formula用フォーマッター
        />
      </div>

      <CustomKeyboard visible={keyboardState.visible} />
    </>
  )
}
