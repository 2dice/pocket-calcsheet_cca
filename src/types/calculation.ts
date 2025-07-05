import type { VariableSlot } from './sheet'

export type FormulaError =
  | 'Undefined variable'
  | 'Division by zero'
  | 'Syntax error'
  | 'Error'

export interface CalculationContext {
  variables: Record<string, number | null>
  variableSlots: VariableSlot[]
}

export interface CalculationResult {
  value: number | null
  error: FormulaError | null
  formattedValue?: string
}

export interface SIFormat {
  mantissa: number
  exponent: number
  formatted: string
}
