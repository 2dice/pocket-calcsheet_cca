import { create } from 'zustand'
import type { SheetMeta } from '@/types/sheet'

interface SheetsStore {
  sheets: SheetMeta[]
  addSheet: (name: string) => void
  reorderSheets: (activeId: string, overId: string) => void
  reset: () => void
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
  reorderSheets: (activeId: string, overId: string) => {
    if (activeId === overId) return

    const currentSheets = get().sheets
    const activeIndex = currentSheets.findIndex(sheet => sheet.id === activeId)
    const overIndex = currentSheets.findIndex(sheet => sheet.id === overId)

    if (activeIndex === -1 || overIndex === -1) return

    // arrayMove相当の処理でsheets配列を更新
    const newSheets = [...currentSheets]
    const [movedSheet] = newSheets.splice(activeIndex, 1)
    newSheets.splice(overIndex, 0, movedSheet)

    // order プロパティを再計算
    const updatedSheets = newSheets.map((sheet, index) => ({
      ...sheet,
      order: index,
      updatedAt: new Date().toISOString(),
    }))

    set({ sheets: updatedSheets })
  },
  reset: () => set({ sheets: [] }),
}))
