import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import type { SheetMeta, ValidatedSheetName } from '@/types/sheet'

interface SheetsStore {
  sheets: SheetMeta[]
  addSheet: (name: string) => void
  removeSheet: (id: string) => void
  reorderSheets: (activeId: string, overId: string) => void
  updateSheet: (id: string, name: ValidatedSheetName) => void
  reset: () => void
}

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // フォールバック: timestamp + random
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export const useSheetsStore = create<SheetsStore>()(
  persist<SheetsStore>(
    (set, get) => ({
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
      removeSheet: (id: string) => {
        set(state => ({
          sheets: state.sheets.filter(sheet => sheet.id !== id),
        }))
      },
      reorderSheets: (activeId: string, overId: string) => {
        if (activeId === overId) return

        const currentSheets = get().sheets
        const activeIndex = currentSheets.findIndex(
          sheet => sheet.id === activeId
        )
        const overIndex = currentSheets.findIndex(sheet => sheet.id === overId)

        if (activeIndex === -1 || overIndex === -1) return

        // arrayMoveを使用してsheets配列を更新
        const newSheets = arrayMove(currentSheets, activeIndex, overIndex)

        // order プロパティを再計算（変更があったシートのみupdatedAt更新）
        const updatedSheets = newSheets.map((sheet, index) => {
          if (sheet.order !== index || sheet.id === activeId) {
            return {
              ...sheet,
              order: index,
              updatedAt: new Date().toISOString(),
            }
          }
          return { ...sheet, order: index }
        })

        set({ sheets: updatedSheets })
      },
      updateSheet: (id: string, name: ValidatedSheetName) => {
        set(state => ({
          sheets: state.sheets.map(sheet =>
            sheet.id === id
              ? {
                  ...sheet,
                  name,
                  updatedAt: new Date().toISOString(),
                }
              : sheet
          ),
        }))
      },
      reset: () => set({ sheets: [] }),
    }),
    {
      name: 'pocket-calcsheet/1', // StorageManagerと同じキーを使用
      storage: createJSONStorage(() => localStorage),
      // カスタムストレージ実装を削除し、標準のpersist機能を使用
      version: 1,
      onRehydrateStorage: () => state => {
        if (state) {
          console.log('Sheets store rehydrated successfully')
        }
      },
    }
  )
)
