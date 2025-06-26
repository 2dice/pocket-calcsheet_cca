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
