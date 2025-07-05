import { useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { useCustomKeyboard } from '@/hooks/useCustomKeyboard'
import { useScrollToInput } from '@/hooks/useScrollToInput'
import { useUIStore } from '@/store/uiStore'

interface Props {
  value: string
}

export function FormulaInput({ value }: Props) {
  const { id } = useParams<{ id: string }>()
  const { show: showKeyboard, target, keyboardInput } = useCustomKeyboard()
  const { updateKeyboardInput } = useUIStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // スクロール制御を適用
  useScrollToInput(textareaRef)

  // 現在のターゲットかどうかを判定
  const isCurrentTarget = target?.type === 'formula' && target.sheetId === id

  // キーボード入力の初期化
  useEffect(() => {
    if (isCurrentTarget && keyboardInput === null) {
      updateKeyboardInput({
        value: value || '',
        cursorPosition: (value || '').length,
      })
    }
  }, [isCurrentTarget, keyboardInput, value, updateKeyboardInput])

  // カーソル位置とフォーカスを制御
  useEffect(() => {
    if (isCurrentTarget && keyboardInput && textareaRef.current) {
      const textarea = textareaRef.current

      // フォーカスを当てる
      textarea.focus()

      // DOM更新後に確実にカーソル位置を設定
      setTimeout(() => {
        textarea.setSelectionRange(
          keyboardInput.cursorPosition,
          keyboardInput.cursorPosition
        )
      }, 0)
    }
  }, [isCurrentTarget, keyboardInput])

  const handleFocus = () => {
    if (!id) return

    // 初回フォーカス時のみキーボード入力を初期化
    if (!isCurrentTarget) {
      updateKeyboardInput({
        value: value || '',
        cursorPosition: (value || '').length,
      })
    }

    showKeyboard({
      type: 'formula',
      sheetId: id,
    })
  }

  const handleSelectionChange = () => {
    if (isCurrentTarget && textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart || 0
      updateKeyboardInput({
        value: keyboardInput?.value || value || '',
        cursorPosition: cursorPos,
      })
    }
  }

  // 値の変更はカスタムキーボード側で制御され、
  // キーボードが非表示になった時にonChangeが呼ばれる

  return (
    <div>
      <label className="text-sm font-medium">Formula</label>
      <Textarea
        ref={textareaRef}
        value={
          isCurrentTarget && keyboardInput ? keyboardInput.value : value || ''
        }
        onChange={() => {}} // カスタムキーボードで制御するため空関数
        onFocus={handleFocus}
        onClick={handleSelectionChange}
        inputMode="none"
        className="mt-1 min-h-[120px] resize-none cursor-pointer"
      />
    </div>
  )
}
