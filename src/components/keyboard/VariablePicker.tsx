import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSheetsStore } from '@/store/sheetsStore'

interface Props {
  open: boolean
  onSelect: (variableText: string) => void
  onClose: () => void
  sheetId: string
}

export function VariablePicker({ open, onSelect, onClose, sheetId }: Props) {
  const { entities } = useSheetsStore()
  const sheet = entities[sheetId]

  const handleSelect = (slot: number, varName: string) => {
    // 変数名がある場合はその名前を、ない場合はVariable番号を使用
    const displayName = varName || `Variable${slot}`
    onSelect(`[${displayName}]`)
    onClose()
  }

  if (!sheet) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto" data-testid="variable-picker">
        <DialogHeader>
          <DialogTitle>変数を選択</DialogTitle>
          <DialogDescription>
            参照する変数を一覧から選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {sheet.variableSlots.map(slot => {
            const displayName = slot.varName || `Variable${slot.slot}`
            return (
              <Button
                key={slot.slot}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSelect(slot.slot, slot.varName)}
              >
                <div>
                  <div className="font-medium">{displayName}</div>
                  {slot.varName && (
                    <div className="text-sm text-gray-500">
                      Variable{slot.slot}
                    </div>
                  )}
                </div>
              </Button>
            )
          })}
        </div>
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
