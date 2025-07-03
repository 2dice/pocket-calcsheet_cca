export interface KeyboardState {
  visible: boolean
  target:
    | {
        type: 'variable'
        sheetId: string
        slot: number
      }
    | {
        type: 'formula'
        sheetId: string
      }
    | null
}

export interface KeyboardKey {
  id: string
  label: string
  type: 'number' | 'operator' | 'function' | 'variable' | 'special'
  action?: string
}
