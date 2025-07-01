import { useUIStore } from '@/store/uiStore'
import { useSheetsStore } from '@/store/sheetsStore'

export function useCustomKeyboard() {
  const {
    keyboardState,
    keyboardInput,
    showKeyboard,
    hideKeyboard,
    updateKeyboardInput,
  } = useUIStore()
  const { updateVariableSlot } = useSheetsStore()

  const insertText = (text: string, cursorOffset = 0) => {
    if (!keyboardState.target || !keyboardInput) return

    const { value: currentValue, cursorPosition } = keyboardInput

    const newValue =
      currentValue.slice(0, cursorPosition) +
      text +
      currentValue.slice(cursorPosition)

    // 挿入したテキストの末尾からオフセットを引いて新しいカーソル位置を計算
    const newPosition = cursorPosition + text.length - cursorOffset

    updateKeyboardInput({
      value: newValue,
      cursorPosition: newPosition,
    })

    // 実際の入力フィールドにも反映
    if (keyboardState.target.type === 'variable') {
      updateVariableSlot(
        keyboardState.target.sheetId,
        keyboardState.target.slot,
        { expression: newValue }
      )
    }
  }

  const handleBackspace = () => {
    if (!keyboardState.target || !keyboardInput) return
    const cursorPosition = keyboardInput.cursorPosition
    if (cursorPosition === 0) return

    const newValue =
      keyboardInput.value.slice(0, cursorPosition - 1) +
      keyboardInput.value.slice(cursorPosition)
    const newPosition = cursorPosition - 1

    updateKeyboardInput({
      value: newValue,
      cursorPosition: newPosition,
    })

    // 実際の入力フィールドにも反映
    if (keyboardState.target.type === 'variable') {
      updateVariableSlot(
        keyboardState.target.sheetId,
        keyboardState.target.slot,
        { expression: newValue }
      )
    }
  }

  const moveCursor = (direction: 'left' | 'right') => {
    if (!keyboardInput) return

    const cursorPosition = keyboardInput.cursorPosition
    let newPosition = cursorPosition
    if (direction === 'left' && cursorPosition > 0) {
      newPosition = cursorPosition - 1
    } else if (
      direction === 'right' &&
      cursorPosition < keyboardInput.value.length
    ) {
      newPosition = cursorPosition + 1
    }

    updateKeyboardInput({
      value: keyboardInput.value,
      cursorPosition: newPosition,
    })
  }

  const handleEnter = () => {
    hideKeyboard()
  }

  return {
    isVisible: keyboardState.visible,
    target: keyboardState.target,
    keyboardInput,
    cursorPosition: keyboardInput?.cursorPosition || 0,
    show: showKeyboard,
    hide: hideKeyboard,
    insertText,
    handleBackspace,
    moveCursor,
    handleEnter,
  }
}
