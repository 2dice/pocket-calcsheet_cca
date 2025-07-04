import { useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'
import {
  isValidVariableName,
  isDuplicateVariableName,
} from '@/utils/validation/variableValidation'
import { useCustomKeyboard } from '@/hooks/useCustomKeyboard'
import { useScrollToInput } from '@/hooks/useScrollToInput'
import { useUIStore } from '@/store/uiStore'
import { formatWithSIPrefix } from '@/utils/calculation/numberFormatter'

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
  const {
    show: showKeyboard,
    hide: hideKeyboard,
    target,
    keyboardInput,
  } = useCustomKeyboard()
  const { updateKeyboardInput } = useUIStore()
  const valueInputRef = useRef<HTMLInputElement>(null)

  // スクロール制御を適用
  useScrollToInput(valueInputRef)

  // カーソル位置の表示用（現在は実装せず、将来の実装のためのプレースホルダー）
  const isCurrentTarget =
    target?.type === 'variable' &&
    target.sheetId === id &&
    target.slot === slot.slot

  // キーボード入力の初期化
  useEffect(() => {
    if (isCurrentTarget && keyboardInput === null) {
      updateKeyboardInput({
        value: slot.expression || '',
        cursorPosition: (slot.expression || '').length,
      })
    }
  }, [isCurrentTarget, keyboardInput, slot.expression, updateKeyboardInput])

  // カーソル位置とフォーカスを制御するためのuseEffect
  useEffect(() => {
    if (isCurrentTarget && keyboardInput && valueInputRef.current) {
      const input = valueInputRef.current

      // フォーカスを当てる
      input.focus()

      // DOM更新後に確実にカーソル位置を設定
      setTimeout(() => {
        input.setSelectionRange(
          keyboardInput.cursorPosition,
          keyboardInput.cursorPosition
        )
      }, 0)
    }
  }, [
    isCurrentTarget,
    keyboardInput,
    keyboardInput?.cursorPosition,
    keyboardInput?.value,
  ])

  const handleNameChange = (value: string) => {
    onChange({ varName: value })
  }

  const handleSelectionChange = () => {
    if (isCurrentTarget && valueInputRef.current) {
      const cursorPos = valueInputRef.current.selectionStart || 0
      updateKeyboardInput({
        value: keyboardInput?.value || slot.expression || '',
        cursorPosition: cursorPos,
      })
    }
  }

  const handleValueFocus = () => {
    if (!id) {
      return
    }

    // 初回フォーカス時のみキーボード入力を初期化
    if (!isCurrentTarget) {
      updateKeyboardInput({
        value: slot.expression || '',
        cursorPosition: (slot.expression || '').length,
      })
    }

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
        <div className="text-right text-sm font-mono h-5">
          {slot.error ? (
            <span className="text-red-500">Error</span>
          ) : slot.value !== null ? (
            <span>{formatWithSIPrefix(slot.value)}</span>
          ) : null}
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
          value={
            isCurrentTarget && keyboardInput
              ? keyboardInput.value
              : slot.expression || ''
          }
          onChange={() => {}} // カスタムキーボードで状態管理するため空関数
          onFocus={handleValueFocus}
          onClick={handleSelectionChange}
          inputMode="none"
          className="flex-1 cursor-pointer"
          aria-label={`Variable${slot.slot} の値`}
        />
      </div>
    </div>
  )
}
