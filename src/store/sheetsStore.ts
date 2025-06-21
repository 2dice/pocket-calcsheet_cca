import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import type { SheetMeta, ValidatedSheetName } from '@/types/sheet'
import type { RootModel, Sheet } from '@/types/storage'

interface SheetsStore extends RootModel {
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

const getInitialState = (): Omit<
  SheetsStore,
  'addSheet' | 'removeSheet' | 'reorderSheets' | 'updateSheet' | 'reset'
> => ({
  schemaVersion: 1,
  savedAt: new Date().toISOString(),
  sheets: [],
  entities: {},
})

export const useSheetsStore = create<SheetsStore>((set, get) => ({
  ...getInitialState(),
  addSheet: (name: string) => {
    const currentSheets = get().sheets
    const newSheet: SheetMeta = {
      id: generateId(),
      name,
      order: currentSheets.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const sheetEntity: Sheet = { ...newSheet }

    set(state => ({
      sheets: [...state.sheets, newSheet],
      entities: {
        ...state.entities,
        [newSheet.id]: sheetEntity,
      },
      savedAt: new Date().toISOString(),
    }))
  },
  removeSheet: (id: string) => {
    set(state => {
      const remainingEntities = { ...state.entities }
      delete remainingEntities[id]
      return {
        sheets: state.sheets.filter(sheet => sheet.id !== id),
        entities: remainingEntities,
        savedAt: new Date().toISOString(),
      }
    })
  },
  reorderSheets: (activeId: string, overId: string) => {
    if (activeId === overId) return

    const currentSheets = get().sheets
    const activeIndex = currentSheets.findIndex(sheet => sheet.id === activeId)
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

    set({
      sheets: updatedSheets,
      savedAt: new Date().toISOString(),
    })
  },
  updateSheet: (id: string, name: ValidatedSheetName) => {
    set(state => {
      const updatedAt = new Date().toISOString()
      return {
        sheets: state.sheets.map(sheet =>
          sheet.id === id
            ? {
                ...sheet,
                name,
                updatedAt,
              }
            : sheet
        ),
        entities: {
          ...state.entities,
          [id]: state.entities[id]
            ? {
                ...state.entities[id],
                name,
                updatedAt,
              }
            : state.entities[id],
        },
        savedAt: new Date().toISOString(),
      }
    })
  },
  reset: () => set(getInitialState()),
}))
