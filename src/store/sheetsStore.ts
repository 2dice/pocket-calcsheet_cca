import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { arrayMove } from '@dnd-kit/sortable'
import type {
  SheetMeta,
  ValidatedSheetName,
  VariableSlot,
  FormulaData,
} from '@/types/sheet'
import type { RootModel, Sheet } from '@/types/storage'
import { StorageManager } from '@/utils/storage/storageManager'
import { MigrationManager } from '@/utils/storage/migrationManager'

interface SheetsStore extends RootModel {
  schemaVersion: number
  savedAt: string
  sheets: SheetMeta[]
  entities: Record<string, Sheet>
  storageError: boolean
  persistenceError: boolean
  setStorageError: (error: boolean) => void
  setPersistenceError: (error: boolean) => void
  addSheet: (name: string) => void
  removeSheet: (id: string) => void
  reorderSheets: (activeId: string, overId: string) => void
  updateSheet: (id: string, name: ValidatedSheetName) => void
  updateVariableSlot: (
    sheetId: string,
    slotNumber: number,
    updates: Partial<VariableSlot>
  ) => void
  updateFormulaData: (
    sheetId: string,
    formulaData: Partial<FormulaData>
  ) => void
  initializeSheet: (sheetId: string) => void
  reset: () => void
}

const VARIABLE_SLOT_COUNT = 8

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // フォールバック: timestamp + random
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

const createInitialVariableSlots = (): VariableSlot[] => {
  return Array.from({ length: VARIABLE_SLOT_COUNT }, (_, i) => ({
    slot: i + 1,
    varName: '',
    expression: '',
    value: null,
    error: null,
  }))
}

const createInitialFormulaData = (): FormulaData => ({
  inputExpr: '',
  result: null,
  error: null,
})

const getInitialState = (): Omit<
  SheetsStore,
  | 'addSheet'
  | 'removeSheet'
  | 'reorderSheets'
  | 'updateSheet'
  | 'updateVariableSlot'
  | 'updateFormulaData'
  | 'initializeSheet'
  | 'reset'
  | 'setStorageError'
  | 'setPersistenceError'
> => ({
  schemaVersion: MigrationManager.LATEST_SCHEMA_VERSION,
  savedAt: new Date().toISOString(),
  sheets: [],
  entities: {},
  storageError: false,
  persistenceError: false,
})

export const useSheetsStore = create<SheetsStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),
      setStorageError: (error: boolean) => set({ storageError: error }),
      setPersistenceError: (error: boolean) => set({ persistenceError: error }),
      addSheet: (name: string) => {
        // 新規シートとエンティティを一度だけ作成
        const newSheet: SheetMeta = {
          id: generateId(),
          name,
          order: get().sheets.length,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const sheetEntity: Sheet = {
          ...newSheet,
          variableSlots: createInitialVariableSlots(),
          formulaData: createInitialFormulaData(),
        }

        // 容量チェック用のnewState作成
        const newState = {
          sheets: [...get().sheets, newSheet],
          entities: {
            ...get().entities,
            [newSheet.id]: sheetEntity,
          },
          savedAt: new Date().toISOString(),
        }

        // 容量チェック付きで保存可能かテスト
        if (
          !StorageManager.checkStorageQuota(StorageManager.getKey(1), newState)
        ) {
          set({ storageError: true })
          return
        }

        // state更新（sheetEntityを再利用）
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
        // 更新後の状態を仮作成
        const updatedState = {
          ...get(),
          sheets: get().sheets.map(s =>
            s.id === id
              ? { ...s, name, updatedAt: new Date().toISOString() }
              : s
          ),
          entities: {
            ...get().entities,
            [id]: {
              ...get().entities[id],
              name,
              updatedAt: new Date().toISOString(),
            },
          },
          savedAt: new Date().toISOString(),
        }

        // 容量チェック
        if (
          !StorageManager.checkStorageQuota(
            StorageManager.getKey(1),
            updatedState
          )
        ) {
          set({ storageError: true })
          return
        }

        // 実際の更新処理
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
      updateVariableSlot: (sheetId, slotNumber, updates) =>
        set(state => {
          const sheet = state.entities[sheetId]
          if (!sheet || !sheet.variableSlots) return state

          const updatedSlots = sheet.variableSlots.map(slot =>
            slot.slot === slotNumber ? { ...slot, ...updates } : slot
          )

          return {
            ...state,
            entities: {
              ...state.entities,
              [sheetId]: {
                ...sheet,
                variableSlots: updatedSlots,
                updatedAt: new Date().toISOString(),
              },
            },
            savedAt: new Date().toISOString(),
          }
        }),
      updateFormulaData: (sheetId, formulaData) =>
        set(state => {
          const sheet = state.entities[sheetId]
          if (!sheet) return state

          return {
            ...state,
            entities: {
              ...state.entities,
              [sheetId]: {
                ...sheet,
                formulaData: {
                  ...sheet.formulaData,
                  ...formulaData,
                },
                updatedAt: new Date().toISOString(),
              },
            },
            savedAt: new Date().toISOString(),
          }
        }),
      initializeSheet: sheetId =>
        set(state => {
          const sheet = state.entities[sheetId]
          if (!sheet) return state

          const needsVariableSlots = !sheet.variableSlots
          const needsFormulaData = !sheet.formulaData

          if (!needsVariableSlots && !needsFormulaData) return state

          const updatedSheet: Sheet = {
            ...sheet,
            updatedAt: new Date().toISOString(),
          }

          if (needsVariableSlots) {
            updatedSheet.variableSlots = createInitialVariableSlots()
          }

          if (needsFormulaData) {
            updatedSheet.formulaData = createInitialFormulaData()
          }

          return {
            ...state,
            entities: {
              ...state.entities,
              [sheetId]: updatedSheet,
            },
            savedAt: new Date().toISOString(),
          }
        }),
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
          try {
            StorageManager.save(name, JSON.parse(value))
          } catch (error) {
            if (StorageManager.isQuotaExceededError(error)) {
              // タイムアウトを使用して次のイベントループでエラー状態を設定
              setTimeout(() => {
                useSheetsStore.getState().setStorageError(true)
              }, 0)
            }
            throw error
          }
        },
        removeItem: name => StorageManager.remove(name),
      })),
      partialize: state => ({
        schemaVersion: state.schemaVersion,
        savedAt: state.savedAt,
        sheets: state.sheets,
        entities: state.entities,
        // storageErrorとpersistenceErrorは永続化しない
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Failed to rehydrate storage:', error)
          useSheetsStore.getState().setStorageError(true)
        }
      },
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
