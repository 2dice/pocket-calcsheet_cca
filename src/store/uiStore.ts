import { create } from 'zustand'
import type { KeyboardState } from '@/types/keyboard'

interface KeyboardInput {
  value: string
  cursorPosition: number
}

interface UIStore {
  isEditMode: boolean
  toggleEditMode: () => void
  keyboardState: KeyboardState
  keyboardInput: KeyboardInput | null
  showKeyboard: (target: KeyboardState['target']) => void
  hideKeyboard: () => void
  updateKeyboardInput: (input: KeyboardInput) => void
}

export const useUIStore = create<UIStore>(set => ({
  isEditMode: false,
  toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
  keyboardState: {
    visible: false,
    target: null,
  },
  keyboardInput: null,
  showKeyboard: target => {
    set({
      keyboardState: {
        visible: true,
        target,
      },
    })
  },
  hideKeyboard: () =>
    set({
      keyboardState: {
        visible: false,
        target: null,
      },
      keyboardInput: null,
    }),
  updateKeyboardInput: input =>
    set({
      keyboardInput: input,
    }),
}))
