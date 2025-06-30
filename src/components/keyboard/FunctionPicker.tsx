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
  onSelect: (functionText: string) => void
  onClose: () => void
}

export function FunctionPicker({ open, onSelect, onClose }: Props) {
  const handleSelect = (functionId: string) => {
    // 関数名に括弧を付けて返す
    onSelect(`${functionId}()`)
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
