import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FUNCTIONS } from '@/utils/constants/functions'

interface Props {
  open: boolean
  onSelect: (template: string, cursorOffset: number) => void
  onClose: () => void
}

export function FunctionPicker({ open, onSelect, onClose }: Props) {
  const handleSelect = (functionId: string) => {
    if (functionId === 'random') {
      onSelect('random(,)', 2) // カンマの手前にカーソル
    } else if (functionId === 'pi' || functionId === 'e') {
      onSelect(`${functionId}()`, 0) // 括弧の後ろにカーソル
    } else {
      onSelect(`${functionId}()`, 1) // 括弧の内側にカーソル
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto" data-testid="function-picker">
        <DialogHeader>
          <DialogTitle>関数を選択</DialogTitle>
          <DialogDescription>
            使用する関数を一覧から選択してください
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {FUNCTIONS.map(func => (
            <Button
              key={func.id}
              variant="outline"
              className="w-full justify-start text-left h-auto py-3"
              onClick={() => handleSelect(func.id)}
            >
              <div>
                <div className="font-medium">
                  {func.label} - {func.description}
                </div>
              </div>
            </Button>
          ))}
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
