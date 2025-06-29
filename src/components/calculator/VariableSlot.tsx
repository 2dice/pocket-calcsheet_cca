import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'
import {
  isValidVariableName,
  isDuplicateVariableName,
} from '@/utils/validation/variableValidation'
import { useCustomKeyboard } from '@/hooks/useCustomKeyboard'
import { useScrollToInput } from '@/hooks/useScrollToInput'

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
  const { id } = useParams<{ id: string }>()
  const { show: showKeyboard, hide: hideKeyboard } = useCustomKeyboard()
  const valueInputRef = useRef<HTMLInputElement>(null)

  // スクロール制御を適用
  useScrollToInput(valueInputRef)

  const handleNameChange = (value: string) => {
    onChange({ varName: value })
  }

  const handleValueChange = (value: string) => {
    onChange({ expression: value })
  }

  const handleValueFocus = () => {
    if (!id) {
      return
    }

    // setTimeoutとconsole.logを削除し、同期的に実行
    showKeyboard({
      type: 'variable',
      sheetId: id,
      slot: slot.slot,
    })
  }

  const handleNameFocus = () => {
    // カスタムキーボードを非表示にする
    hideKeyboard()
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
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">
          Variable{slot.slot}
        </div>
        <div className="text-sm text-gray-600 h-5">
          {/* 計算値表示用スペース（後のステップで実装） */}
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          data-testid={`variable-name-${slot.slot}`}
          placeholder="変数名"
          value={slot.varName}
          onChange={e => handleNameChange(e.target.value)}
          onFocus={handleNameFocus}
          onBlur={handleNameBlur}
          inputMode="url"
          className="flex-1"
          aria-label={`Variable${slot.slot} の名前`}
          aria-invalid={!!slot.error}
        />
        <Input
          ref={valueInputRef}
          data-testid={`variable-value-${slot.slot}`}
          placeholder="値"
          value={slot.expression}
          onChange={e => handleValueChange(e.target.value)}
          onFocus={handleValueFocus}
          inputMode="none"
          readOnly
          className="flex-1 cursor-pointer"
          aria-label={`Variable${slot.slot} の値`}
        />
      </div>
    </div>
  )
}
