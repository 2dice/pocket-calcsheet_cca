import { create } from 'zustand'
import type { TabType } from '@/types/sheet'

interface UIStore {
  isEditMode: boolean
  toggleEditMode: () => void
  currentSheetId: string | null
  setCurrentSheetId: (id: string | null) => void
  currentTab: TabType
  setCurrentTab: (tab: TabType) => void
}

export const useUIStore = create<UIStore>(set => ({
  isEditMode: false,
  toggleEditMode: () => set(state => ({ isEditMode: !state.isEditMode })),
  currentSheetId: null,
  setCurrentSheetId: (id: string | null) => set({ currentSheetId: id }),
  currentTab: 'overview',
  setCurrentTab: (tab: TabType) => set({ currentTab: tab }),
}))
