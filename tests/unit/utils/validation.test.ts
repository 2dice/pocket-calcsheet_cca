import { describe, it, expect } from 'vitest'
import {
  isValidVariableName,
  isDuplicateVariableName,
} from '@/utils/validation/variableValidation'
import type { VariableSlot } from '@/types/sheet'

describe('変数名バリデーション', () => {
  describe('isValidVariableName', () => {
    it('英字で始まる有効な変数名を許可する', () => {
      expect(isValidVariableName('validVar')).toBe(true)
      expect(isValidVariableName('a')).toBe(true)
      expect(isValidVariableName('A')).toBe(true)
      expect(isValidVariableName('variable1')).toBe(true)
      expect(isValidVariableName('var_name')).toBe(true)
      expect(isValidVariableName('myVariable123')).toBe(true)
    })

    it('日本語を含む変数名を拒否する', () => {
      expect(isValidVariableName('変数名')).toBe(false)
      expect(isValidVariableName('var変数')).toBe(false)
      expect(isValidVariableName('変数123')).toBe(false)
    })

    it('数字で始まる変数名を拒否する', () => {
      expect(isValidVariableName('1variable')).toBe(false)
      expect(isValidVariableName('123abc')).toBe(false)
      expect(isValidVariableName('9test')).toBe(false)
    })

    it('記号を含む変数名を拒否する（アンダースコア以外）', () => {
      expect(isValidVariableName('var-name')).toBe(false)
      expect(isValidVariableName('var.name')).toBe(false)
      expect(isValidVariableName('var+name')).toBe(false)
      expect(isValidVariableName('var name')).toBe(false)
      expect(isValidVariableName('var@name')).toBe(false)
    })

    it('空文字列を許可する', () => {
      expect(isValidVariableName('')).toBe(true)
    })

    it('アンダースコアのみで始まる変数名を拒否する', () => {
      expect(isValidVariableName('_variable')).toBe(false)
      expect(isValidVariableName('__test')).toBe(false)
    })
  })

  describe('isDuplicateVariableName', () => {
    const mockSlots: VariableSlot[] = [
      {
        slot: 1,
        varName: 'firstVar',
        expression: '10',
        value: 10,
        error: null,
      },
      {
        slot: 2,
        varName: 'secondVar',
        expression: '20',
        value: 20,
        error: null,
      },
      {
        slot: 3,
        varName: '',
        expression: '',
        value: null,
        error: null,
      },
      {
        slot: 4,
        varName: 'fourthVar',
        expression: '40',
        value: 40,
        error: null,
      },
    ]

    it('重複する変数名を検出する', () => {
      expect(isDuplicateVariableName('firstVar', 3, mockSlots)).toBe(true)
      expect(isDuplicateVariableName('secondVar', 4, mockSlots)).toBe(true)
      expect(isDuplicateVariableName('fourthVar', 1, mockSlots)).toBe(true)
    })

    it('同じスロットの名前は重複として扱わない', () => {
      expect(isDuplicateVariableName('firstVar', 1, mockSlots)).toBe(false)
      expect(isDuplicateVariableName('secondVar', 2, mockSlots)).toBe(false)
      expect(isDuplicateVariableName('fourthVar', 4, mockSlots)).toBe(false)
    })

    it('新しい変数名は重複しない', () => {
      expect(isDuplicateVariableName('newVar', 3, mockSlots)).toBe(false)
      expect(isDuplicateVariableName('uniqueName', 1, mockSlots)).toBe(false)
    })

    it('空文字列は重複チェック不要', () => {
      expect(isDuplicateVariableName('', 1, mockSlots)).toBe(false)
      expect(isDuplicateVariableName('', 3, mockSlots)).toBe(false)
    })

    it('大文字小文字を区別する', () => {
      expect(isDuplicateVariableName('FIRSTVAR', 3, mockSlots)).toBe(false)
      expect(isDuplicateVariableName('FirstVar', 3, mockSlots)).toBe(false)
    })
  })
})
