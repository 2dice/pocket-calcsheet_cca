import { useUIStore } from '@/store/uiStore'
import { useSheetsStore } from '@/store/sheetsStore'
import { useCallback } from 'react'

export function useCustomKeyboard() {
  const {
    keyboardState,
    keyboardInput,
    showKeyboard,
    hideKeyboard,
    updateKeyboardInput,
  } = useUIStore()
  const { updateVariableSlot } = useSheetsStore()

  const insertText = useCallback(
    (text: string, cursorOffset = 0) => {
      // 実行時に最新の状態を取得
      const state = useUIStore.getState()
      if (!state.keyboardState.target || !state.keyboardInput) return

      const { value: currentValue, cursorPosition } = state.keyboardInput
      const newValue =
        currentValue.slice(0, cursorPosition) +
        text +
        currentValue.slice(cursorPosition)
      const newPosition = cursorPosition + text.length - cursorOffset

      updateKeyboardInput({ value: newValue, cursorPosition: newPosition })

      if (state.keyboardState.target.type === 'variable') {
        updateVariableSlot(
          state.keyboardState.target.sheetId,
          state.keyboardState.target.slot,
          { expression: newValue }
        )
      }
    },
    [updateKeyboardInput, updateVariableSlot]
  )

  const handleBackspace = useCallback(() => {
    const state = useUIStore.getState()
    if (
      !state.keyboardState.target ||
      !state.keyboardInput ||
      state.keyboardInput.cursorPosition === 0
    ) {
      return
    }

    const { value: currentValue, cursorPosition } = state.keyboardInput
    const newValue =
      currentValue.slice(0, cursorPosition - 1) +
      currentValue.slice(cursorPosition)
    const newPosition = cursorPosition - 1

    updateKeyboardInput({ value: newValue, cursorPosition: newPosition })

    if (state.keyboardState.target.type === 'variable') {
      updateVariableSlot(
        state.keyboardState.target.sheetId,
        state.keyboardState.target.slot,
        { expression: newValue }
      )
    }
  }, [updateKeyboardInput, updateVariableSlot])

  const moveCursor = useCallback(
    (direction: 'left' | 'right') => {
      const state = useUIStore.getState()
      if (!state.keyboardInput) return

      const { value, cursorPosition } = state.keyboardInput
      let newPosition = cursorPosition

      if (direction === 'left' && cursorPosition > 0) {
        newPosition -= 1
      } else if (direction === 'right' && cursorPosition < value.length) {
        newPosition += 1
      }

      if (newPosition !== cursorPosition) {
        updateKeyboardInput({ value, cursorPosition: newPosition })
      }
    },
    [updateKeyboardInput]
  )

  const handleEnter = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    hideKeyboard()
  }, [hideKeyboard])

  return {
    isVisible: keyboardState.visible,
    target: keyboardState.target,
    keyboardInput,
    cursorPosition: keyboardInput?.cursorPosition ?? 0,
    show: showKeyboard,
    hide: hideKeyboard,
    insertText,
    handleBackspace,
    moveCursor,
    handleEnter,
  }
}
