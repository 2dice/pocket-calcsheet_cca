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
import type { VariableSlot as VariableSlotType } from '@/types/sheet'

export function VariablesTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateVariableSlot, initializeSheet } = useSheetsStore()
  const { keyboardState, hideKeyboard } = useUIStore()
  const [validationError, setValidationError] = useState<string>('')

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.variableSlots) {
      initializeSheet(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, sheet?.variableSlots])

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
        className="p-4 pb-20 h-full overflow-y-auto"
        onClick={e => {
          // input以外をクリックしたらキーボードを隠す
          if ((e.target as HTMLElement).tagName !== 'INPUT') {
            hideKeyboard()
          }
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

      <CustomKeyboard visible={keyboardState.visible} onClose={hideKeyboard} />
    </>
  )
}
