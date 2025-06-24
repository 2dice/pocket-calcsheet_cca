import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import type { SheetMeta, ValidatedSheetName } from '@/types/sheet'
import type { RootModel, Sheet } from '@/types/storage'
import { StorageManager } from '@/utils/storage/storageManager'
import { MigrationManager } from '@/utils/storage/migrationManager'

interface SheetsStore extends RootModel {
  schemaVersion: number
  savedAt: string
  sheets: SheetMeta[]
  entities: Record<string, Sheet>
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
  schemaVersion: MigrationManager.LATEST_SCHEMA_VERSION,
  savedAt: new Date().toISOString(),
  sheets: [],
  entities: {},
})

export const useSheetsStore = create<SheetsStore>()(
  persist(
    (set, get) => ({
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

        set(state => {
          const sheetEntity: Sheet = { ...newSheet }
          return {
            sheets: [...state.sheets, newSheet],
            entities: {
              ...state.entities,
              [newSheet.id]: sheetEntity,
            },
            savedAt: new Date().toISOString(),
          }
        })
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

        set(state => ({
          sheets: updatedSheets,
          entities: {
            ...state.entities,
            ...updatedSheets.reduce(
              (acc, sheet) => ({
                ...acc,
                [sheet.id]: state.entities[sheet.id]
                  ? { ...state.entities[sheet.id], order: sheet.order }
                  : state.entities[sheet.id],
              }),
              {} as Record<string, Sheet>
            ),
          },
          savedAt: new Date().toISOString(),
        }))
      },
      updateSheet: (id: string, name: ValidatedSheetName) => {
        set(state => {
          const updatedAt = new Date().toISOString()
          const updatedSheet = state.sheets.find(s => s.id === id)

          return {
            sheets: state.sheets.map(sheet =>
              sheet.id === id ? { ...sheet, name, updatedAt } : sheet
            ),
            entities: updatedSheet
              ? {
                  ...state.entities,
                  [id]: {
                    ...(state.entities[id] || updatedSheet),
                    name,
                    updatedAt,
                  } as Sheet,
                }
              : state.entities,
            savedAt: new Date().toISOString(),
          }
        })
      },
      reset: () => set(getInitialState()),
    }),
    {
      name: StorageManager.getKey(1),
      storage: createJSONStorage(() => ({
        getItem: name => {
          const data = StorageManager.load(name)
          return data ? JSON.stringify(data) : null
        },
        setItem: (name, value) => {
          StorageManager.save(name, JSON.parse(value))
        },
        removeItem: name => StorageManager.remove(name),
      })),
      partialize: state => ({
        schemaVersion: state.schemaVersion,
        savedAt: state.savedAt,
        sheets: state.sheets,
        entities: state.entities,
      }),
      migrate: (persistedState: unknown): RootModel => {
        // マイグレーションが必要かチェック
        if (MigrationManager.needsMigration(persistedState)) {
          try {
            // 現在のバージョンは1
            const currentVersion = MigrationManager.LATEST_SCHEMA_VERSION
            const rootModel = persistedState as Partial<RootModel>
            const fromVersion = rootModel.schemaVersion ?? 0

            // マイグレーション実行
            return MigrationManager.migrate(
              persistedState,
              fromVersion,
              currentVersion
            )
          } catch (error) {
            console.error('Migration failed:', error)
            // エラー時は初期状態を返す
            return getInitialState()
          }
        }

        // マイグレーション不要な場合はそのまま返す
        return persistedState as SheetsStore
      },
      version: 1, // persistミドルウェアのバージョン（schemaVersionとは別管理）
    }
  )
)
