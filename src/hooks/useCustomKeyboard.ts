import { useUIStore } from '@/store/uiStore'

export function useCustomKeyboard() {
  const { keyboardState, showKeyboard, hideKeyboard } = useUIStore()

  return {
    isVisible: keyboardState.visible,
    target: keyboardState.target,
    show: showKeyboard,
    hide: hideKeyboard,
  }
}
