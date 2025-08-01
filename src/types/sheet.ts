import type { FormulaError } from './calculation'

export interface SheetMeta {
  id: string
  name: string
  order: number
  createdAt: string
  updatedAt: string
}

export type ValidatedSheetName = string & { __brand: 'ValidatedSheetName' }

export const validateSheetName = (name: string): ValidatedSheetName | null => {
  const trimmed = name.trim()
  return trimmed ? (trimmed as ValidatedSheetName) : null
}

export type TabType = 'overview' | 'variables' | 'formula'

// 変数スロットの型定義
export interface VariableSlot {
  slot: number // 1〜8
  varName: string // 変数名（空欄可）
  expression: string // 入力式（数値または式）
  value: number | null // 計算結果（本ステップでは未使用）
  error: string | null // エラー内容（本ステップでは未使用）
}

// 数式データの型定義
export interface FormulaData {
  inputExpr: string // ユーザー入力式（改行・空白を含む）
  result: number | null // 計算結果（本ステップでは未使用）
  error: FormulaError | null // エラー内容（本ステップでは未使用）
}

// 概要データの型定義
export interface OverviewData {
  description: string // 自由記述テキスト（複数行）
}
