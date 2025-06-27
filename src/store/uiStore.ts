import { create } from 'zustand'
import type { KeyboardState } from '@/types/keyboard'

interface UIStore {
  isEditMode: boolean
  toggleEditMode: () => void
  keyboardState: KeyboardState
  showKeyboard: (target: KeyboardState['target']) => void
  hideKeyboard: () => void
}

export const useUIStore = create<UIStore>(set => ({
  isEditMode: false,
  toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
  keyboardState: {
    visible: false,
    target: null,
  },
  showKeyboard: target =>
    set({
      keyboardState: {
        visible: true,
        target,
      },
    }),
  hideKeyboard: () =>
    set({
      keyboardState: {
        visible: false,
        target: null,
      },
    }),
}))
