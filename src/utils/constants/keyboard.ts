import type { KeyboardKey } from '@/types/keyboard'

export const KEYBOARD_LAYOUT: KeyboardKey[][] = [
  // 1行目
  [
    { id: 'percent', label: '%', type: 'operator' },
    { id: 'power', label: '^', type: 'operator' },
    { id: '7', label: '7', type: 'number' },
    { id: '8', label: '8', type: 'number' },
    { id: '9', label: '9', type: 'number' },
  ],
  // 2行目
  [
    { id: 'plus', label: '+', type: 'operator' },
    { id: 'minus', label: '-', type: 'operator' },
    { id: '4', label: '4', type: 'number' },
    { id: '5', label: '5', type: 'number' },
    { id: '6', label: '6', type: 'number' },
  ],
  // 3行目
  [
    { id: 'multiply', label: '*', type: 'operator' },
    { id: 'divide', label: '/', type: 'operator' },
    { id: '1', label: '1', type: 'number' },
    { id: '2', label: '2', type: 'number' },
    { id: '3', label: '3', type: 'number' },
  ],
  // 4行目
  [
    { id: 'left-paren', label: '(', type: 'operator' },
    { id: 'right-paren', label: ')', type: 'operator' },
    { id: '0', label: '0', type: 'number' },
    { id: 'dot', label: '.', type: 'number' },
  ],
]

export const CURSOR_KEYS: KeyboardKey[] = [
  { id: 'left-arrow', label: '←', type: 'special' },
  { id: 'right-arrow', label: '→', type: 'special' },
]

export const SPECIAL_KEYS: KeyboardKey[] = [
  { id: 'backspace', label: 'BS', type: 'special' },
  { id: 'function', label: 'f(x)', type: 'special' },
  { id: 'variable', label: 'var', type: 'special' },
  { id: 'enter', label: '↵', type: 'special' },
]
