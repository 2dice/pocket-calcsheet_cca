import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { VariableSlot } from '@/components/calculator/VariableSlot'
import { CustomKeyboard } from '@/components/keyboard/CustomKeyboard'
import { useSheetsStore } from '@/store'
import { useUIStore } from '@/store/uiStore'
import { useCalculation } from '@/hooks/useCalculation'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'

const KEYBOARD_HEIGHT = 280

export function VariablesTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateVariableSlot, initializeSheet } = useSheetsStore()
  const { keyboardState, hideKeyboard } = useUIStore()
  const { calculateAllVariables } = useCalculation()
  const [validationError, setValidationError] = useState<string>('')

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.variableSlots) {
      initializeSheet(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sheet?.variableSlots])

  // タブ遷移時の自動計算
  useEffect(() => {
    if (id && sheet?.variableSlots) {
      calculateAllVariables(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleSlotChange = (
    slotNumber: number,
    updates: Partial<VariableSlotType>
  ) => {
    if (id) {
      updateVariableSlot(id, slotNumber, updates)
    }
  }

  const handleValidationError = (message: string) => {
    setValidationError(message)
  }

  const closeDialog = useCallback(() => {
    setValidationError('')
  }, [])

  const handleOutsideClick = (e: React.MouseEvent) => {
    const target = e.target
    if (target instanceof HTMLElement && target.tagName !== 'INPUT') {
      hideKeyboard()
    }
  }

  // hideKeyboard実行時に計算を実行するようにuseEffectで監視
  useEffect(() => {
    // キーボードが非表示になった時に計算実行
    if (!keyboardState.visible && id && sheet?.variableSlots) {
      calculateAllVariables(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyboardState.visible, id]) // sheet?.variableSlotsは除外（無限ループ防止）

  if (!sheet) {
    return (
      <div className="p-4">
        <div className="text-gray-600">シートが見つかりません。</div>
      </div>
    )
  }

  if (!sheet.variableSlots) {
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
        <div className="space-y-1">
          {sheet.variableSlots.map(slot => (
            <VariableSlot
              key={slot.slot}
              slot={slot}
              slots={sheet.variableSlots}
              onChange={updates => handleSlotChange(slot.slot, updates)}
              onValidationError={handleValidationError}
            />
          ))}
        </div>

        {/* バリデーションエラーダイアログ */}
        <AlertDialog open={!!validationError} onOpenChange={closeDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>入力エラー</AlertDialogTitle>
              <AlertDialogDescription>{validationError}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={closeDialog}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <CustomKeyboard visible={keyboardState.visible} />
    </>
  )
}
