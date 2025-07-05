import type { SheetMeta, VariableSlot, FormulaData } from './sheet'

// ルートモデルの型定義
export interface RootModel {
  schemaVersion: number
  savedAt: string // ISO 8601
  sheets: SheetMeta[]
  entities: Record<string, Sheet>
}

// Sheet型の拡張
export interface Sheet extends SheetMeta {
  variableSlots: VariableSlot[] // 8要素の配列
  formulaData: FormulaData // 数式データ
}
