import type { SheetMeta } from './sheet'

/**
 * ルートモデル - アプリ全体データを1つのオブジェクトで管理
 * localStorage JSONで保存される最上位オブジェクト
 */
export interface RootModel {
  /** 保存スキーマの世代番号（マイグレーション用） */
  schemaVersion: number
  /** 最終保存日時（ISO 8601文字列） */
  savedAt: string
  /** シート一覧メタ情報（並び順に配列として格納） */
  sheets: SheetMeta[]
  /** シート実体の辞書（キー=シートID, 値=シートモデル） */
  entities: Record<string, Sheet>
}

/**
 * シートモデル - １つの計算表の中身
 */
export interface Sheet {
  /** メタ情報（シート一覧との同期用） */
  meta: SheetMeta
  /** 概要データ（overviewタブ） */
  overview: OverviewData
  /** 変数スロット（variablesタブ、要素8の配列） */
  variables: VariableSlot[]
  /** 数式データ（formulaタブ） */
  formula: FormulaData
}

/**
 * 概要データ（overviewタブ）
 */
export interface OverviewData {
  /** 自由記述テキスト（複数行） */
  description: string
}

/**
 * 変数スロット（variablesタブの1スロット分）
 */
export interface VariableSlot {
  /** スロット番号（1～8） */
  slot: number
  /** 変数名（空欄可、正規表現 /^[A-Za-z][A-Za-z0-9_]*$/ を満たす） */
  varName: string
  /** 入力式（文字列、数値単体または式） */
  expression: string
  /** 計算結果（数値型、未計算またはエラー時は null） */
  value: number | null
  /** エラー内容（文字列、正常時は null） */
  error: string | null
}

/**
 * 数式データ（formulaタブ）
 */
export interface FormulaData {
  /** ユーザー入力式（改行・空白を含む文字列） */
  inputExpr: string
  /** 計算結果（数値型、未計算またはエラー時は null） */
  result: number | null
  /** エラー内容（文字列、正常時は null） */
  error: string | null
}

/**
 * localStorage容量超過エラー
 */
export class QuotaExceededError extends Error {
  constructor(message: string = 'localStorage容量を超過しました') {
    super(message)
    this.name = 'QuotaExceededError'
  }
}

/**
 * ストレージ操作の設定
 */
export interface StorageConfig {
  /** 保存キーのプレフィックス */
  keyPrefix: string
  /** 現在のスキーマバージョン */
  currentSchemaVersion: number
}

/**
 * マイグレーション関数の型
 */
export type MigrationFunction = (oldData: unknown) => RootModel
