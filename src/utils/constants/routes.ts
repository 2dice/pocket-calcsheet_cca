import type { TabType } from '@/types/sheet'

export const ROUTES = {
  TOP: '/',
  SHEET_DETAIL: '/:id/:tab',
} as const

export const TABS = {
  OVERVIEW: 'overview',
  VARIABLES: 'variables',
  FORMULA: 'formula',
} as const

export const VALID_TABS: TabType[] = ['overview', 'variables', 'formula']

/**
 * URLパラメータからタブタイプを検証し、有効なタブタイプを返す
 * 無効な場合はoverviewを返す
 */
export const validateTabParam = (tab: string | undefined): TabType => {
  if (tab && VALID_TABS.includes(tab as TabType)) {
    return tab as TabType
  }
  return 'overview'
}

// Re-export TabType for convenience
export type { TabType }
