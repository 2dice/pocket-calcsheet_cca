import type { SheetMeta } from './sheet'

// ルートモデルの型定義
export interface RootModel {
  schemaVersion: number
  savedAt: string // ISO 8601
  sheets: SheetMeta[]
  entities: Record<string, Sheet> // 将来実装用、現在は空
}

// Sheet型は将来実装（現在はanyまたは最小限の型）
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Sheet extends SheetMeta {
  // 将来、概要データ、変数スロット、数式データを追加
}
