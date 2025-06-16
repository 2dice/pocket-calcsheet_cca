import { create } from 'zustand'

interface UIStore {
  isEditMode: boolean
  toggleEditMode: () => void
}

export const useUIStore = create<UIStore>(set => ({
  isEditMode: false,
  toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
}))
