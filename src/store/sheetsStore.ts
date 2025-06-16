import { create } from 'zustand'
import type { SheetMeta } from '@/types/sheet'

interface SheetsStore {
  sheets: SheetMeta[]
  addSheet: (name: string) => void
  reset: () => void // オプショナルを削除
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // フォールバック: timestamp + random
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export const useSheetsStore = create<SheetsStore>((set, get) => ({
  sheets: [],
  addSheet: (name: string) => {
    const currentSheets = get().sheets
    const newSheet: SheetMeta = {
      id: generateId(),
      name,
      order: currentSheets.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set(state => ({
      sheets: [...state.sheets, newSheet],
    }))
  },
  reset: () => set({ sheets: [] }),
}))
