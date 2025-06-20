import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import type { SheetMeta, ValidatedSheetName } from '@/types/sheet'
import { defaultMigrationManager } from '@/utils/storage/migrationManager'

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
      name: 'pocket-calcsheet-store',
      storage: createJSONStorage(() => ({
        getItem: () => {
          try {
            const rootModel = defaultMigrationManager.loadWithMigration()
            if (!rootModel) return null
            // Zustand用にsheets配列のみを返す
            return JSON.stringify({ sheets: rootModel.sheets })
          } catch (error) {
            // テスト環境ではconsole出力を避ける
            if (process.env.NODE_ENV !== 'test') {
              console.error('Failed to load sheets from storage:', error)
            }
            return null
          }
        },
        setItem: (_, value: string) => {
          try {
            const storeData = JSON.parse(value) as { sheets: SheetMeta[] }
            // 既存のRootModelを読み込むか新規作成
            const rootModel =
              defaultMigrationManager.loadWithMigration() ||
              defaultMigrationManager.createInitialData()
            // sheetsを更新して保存
            rootModel.sheets = storeData.sheets
            rootModel.savedAt = new Date().toISOString()
            defaultMigrationManager.storageManager.save(rootModel)
          } catch (error) {
            // テスト環境ではconsole出力を避ける
            if (process.env.NODE_ENV !== 'test') {
              console.error('Failed to save sheets to storage:', error)
            }
            if (error instanceof Error && error.name === 'QuotaExceededError') {
              throw error
            }
          }
        },
        removeItem: () => {
          try {
            defaultMigrationManager.storageManager.clear()
          } catch (error) {
            // テスト環境ではconsole出力を避ける
            if (process.env.NODE_ENV !== 'test') {
              console.error('Failed to remove sheets from storage:', error)
            }
          }
        },
      })),
      version: 1,
      migrate: (persistedState: unknown): SheetsStore => {
        // 必要に応じて将来のマイグレーション処理を追加
        return persistedState as SheetsStore
      },
      onRehydrateStorage: () => state => {
        if (state) {
          console.log('Sheets store rehydrated successfully')
        }
      },
    }
  )
)
