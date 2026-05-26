import type { VariableSlot } from '@/types/sheet'
import type { Sheet } from '@/types/storage'

const PRESET_TIMESTAMP = '2026-01-01T00:00:00.000Z'

const createEmptySlots = (): VariableSlot[] =>
  Array.from({ length: 8 }, (_, index) => ({
    slot: index + 1,
    varName: '',
    expression: '',
    value: null,
    error: null,
  }))

const createPresetSheet = (
  id: string,
  name: string,
  order: number,
  description: string,
  variables: Array<{ slot: number; varName: string; expression: string }>,
  formula: string
): Sheet => {
  const variableSlots = createEmptySlots()

  variables.forEach(variable => {
    variableSlots[variable.slot - 1] = {
      ...variableSlots[variable.slot - 1],
      varName: variable.varName,
      expression: variable.expression,
    }
  })

  return {
    id,
    name,
    order,
    createdAt: PRESET_TIMESTAMP,
    updatedAt: PRESET_TIMESTAMP,
    overviewData: { description },
    variableSlots,
    formulaData: {
      inputExpr: formula,
      result: null,
      error: null,
    },
  }
}

export const PRESET_SHEETS: Sheet[] = [
  createPresetSheet(
    '11111111-1111-4111-8111-111111111111',
    'sample1',
    0,
    '自由落下の落下時間から落下距離を算出する。\ng:重力加速度[m/s^2]\nt:落下時間[sec]\nresult:落下距離[m]',
    [
      { slot: 1, varName: 'g', expression: '9.80665' },
      { slot: 2, varName: 't', expression: '5' },
    ],
    '1/2*[g]*[t]^2'
  ),
  createPresetSheet(
    '22222222-2222-4222-8222-222222222222',
    'sample2',
    1,
    '標高と気温から気圧を算出する。\nh:標高[m]\nT:気温[℃]\nP0:海面気圧[hPa]\nresult:気圧[hPa]',
    [
      { slot: 1, varName: 'h', expression: '1000' },
      { slot: 2, varName: 'T', expression: '5' },
      { slot: 3, varName: 'P0', expression: '1013.25' },
    ],
    '[P0]*(1-((0.0065*[h])/([T]+0.0065*[h]+273.15)))^5.257'
  ),
  createPresetSheet(
    '33333333-3333-4333-8333-333333333333',
    'sample3',
    2,
    '二等辺三角形の底辺と高さから底角を算出する。\nh:高さ\na:底辺の長さ\nresult:底角[°]',
    [
      { slot: 1, varName: 'h', expression: '1' },
      { slot: 2, varName: 'a', expression: '2' },
    ],
    'atan(2*[h]/[a])'
  ),
  createPresetSheet(
    '44444444-4444-4444-8444-444444444444',
    'sample4',
    3,
    'インダクタとキャパシタの値からLCローパスフィルタのカットオフ周波数を算出。\nL:インダクタンス[H]\nC:キャパシタンス[F]\nresult:カットオフ周波数[Hz]',
    [
      { slot: 1, varName: 'L', expression: '1*10^(-6)' },
      { slot: 2, varName: 'C', expression: '12*10^(-12)' },
    ],
    '1/(2*pi()*sqrt([L]*[C]))'
  ),
  createPresetSheet(
    '55555555-5555-4555-8555-555555555555',
    'sample5',
    4,
    '距離の変化から音圧の減衰量を算出する。\npointA:音圧が既知である点の音源からの距離[m]\npointB:音圧を算出したい点の音源からの距離[m]\nvolumeA:pointAの音圧[dB]\nresult:pointBの音圧[dB]',
    [
      { slot: 1, varName: 'pointA', expression: '1' },
      { slot: 2, varName: 'pointB', expression: '10' },
      { slot: 3, varName: 'volumeA', expression: '100' },
    ],
    '[volumeA]-20*log([pointB]/[pointA])'
  ),
]
