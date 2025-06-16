import { create } from 'zustand'
import type { SheetMeta } from '@/types/sheet'

interface SheetsStore {
  sheets: SheetMeta[]
  addSheet: (name: string) => void
  reset?: () => void
}

export const useSheetsStore = create<SheetsStore>((set, get) => ({
  sheets: [],
  addSheet: (name: string) => {
    const currentSheets = get().sheets
    const newSheet: SheetMeta = {
      id: crypto.randomUUID(),
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
