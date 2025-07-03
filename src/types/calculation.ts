import type { VariableSlot } from './sheet'

export interface CalculationContext {
  variables: Record<string, number | null>
  variableSlots: VariableSlot[]
}

export interface CalculationResult {
  value: number | null
  error: string | null
  formattedValue?: string
}

export interface SIFormat {
  mantissa: number
  exponent: number
  formatted: string
}
