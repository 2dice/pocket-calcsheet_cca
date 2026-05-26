import { describe, expect, it } from 'vitest'
import { PRESET_SHEETS } from '@/utils/storage/presetData'

describe('presetData', () => {
  it('sample1〜5 が5件定義されている', () => {
    expect(PRESET_SHEETS).toHaveLength(5)
  })

  it('各プリセットが必須フィールドを持つ', () => {
    PRESET_SHEETS.forEach(sheet => {
      expect(sheet.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
      )
      expect(sheet.name).toBeTruthy()
      expect(sheet.variableSlots).toHaveLength(8)
      expect(sheet.formulaData).toBeDefined()
      expect(sheet.overviewData).toBeDefined()
    })
  })

  it('variableSlots の slot 番号が 1〜8 の連番である', () => {
    PRESET_SHEETS.forEach(sheet => {
      expect(sheet.variableSlots.map(slot => slot.slot)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8,
      ])
    })
  })
})
