import { Input } from '@/components/ui/input'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'
import {
  isValidVariableName,
  isDuplicateVariableName,
} from '@/utils/validation/variableValidation'

interface Props {
  slot: VariableSlotType
  slots: VariableSlotType[]
  onChange: (updates: Partial<VariableSlotType>) => void
  onValidationError: (message: string) => void
}

export function VariableSlot({
  slot,
  slots,
  onChange,
  onValidationError,
}: Props) {
  const handleNameChange = (value: string) => {
    onChange({ varName: value })
  }

  const handleValueChange = (value: string) => {
    onChange({ expression: value })
  }

  const handleNameBlur = () => {
    const { varName } = slot

    // バリデーションチェック
    if (varName && !isValidVariableName(varName)) {
      onValidationError(
        '変数名が無効です。英字で始まり、英数字とアンダースコアのみ使用できます。'
      )
      return
    }

    if (isDuplicateVariableName(varName, slot.slot, slots)) {
      onValidationError(
        '重複した変数名です。他の変数と同じ名前は使用できません。'
      )
      return
    }
  }

  return (
    <div className="mb-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Variable{slot.slot}
      </div>
      <div className="space-y-2">
        <Input
          data-testid={`variable-name-${slot.slot}`}
          placeholder="変数名"
          value={slot.varName}
          onChange={e => handleNameChange(e.target.value)}
          onBlur={handleNameBlur}
          className="w-full"
        />
        <Input
          data-testid={`variable-value-${slot.slot}`}
          placeholder="値"
          value={slot.expression}
          onChange={e => handleValueChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}
