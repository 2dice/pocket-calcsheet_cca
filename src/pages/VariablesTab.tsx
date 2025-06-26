import { useState, useEffect } from 'react'
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
import { useSheetsStore } from '@/store'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'

export function VariablesTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateVariableSlot, initializeSheet } = useSheetsStore()
  const [validationError, setValidationError] = useState<string>('')

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.variableSlots) {
      initializeSheet(id)
    }
  }, [id, sheet, initializeSheet])

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
    <div className="p-4 pb-20 h-full overflow-y-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Variables</h2>
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
      <AlertDialog
        open={!!validationError}
        onOpenChange={() => setValidationError('')}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>入力エラー</AlertDialogTitle>
            <AlertDialogDescription>{validationError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setValidationError('')}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
