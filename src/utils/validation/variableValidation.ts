import type { VariableSlot } from '@/types/sheet'

// 変数名の正規表現
const VARIABLE_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/

export const isValidVariableName = (name: string): boolean => {
  if (!name) return true // 空欄は許可
  return VARIABLE_NAME_PATTERN.test(name)
}

export const isDuplicateVariableName = (
  name: string,
  currentSlot: number,
  slots: VariableSlot[]
): boolean => {
  if (!name) return false // 空欄は重複チェック不要
  return slots.some(slot => slot.slot !== currentSlot && slot.varName === name)
}
