import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VariableSlot } from '@/components/calculator/VariableSlot'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'

// useParamsをモック
vi.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'test-sheet-id' }),
}))

// useCustomKeyboardをモック
vi.mock('@/hooks/useCustomKeyboard', () => ({
  useCustomKeyboard: () => ({
    show: vi.fn(),
    hide: vi.fn(),
  }),
}))

// useScrollToInputをモック
vi.mock('@/hooks/useScrollToInput', () => ({
  useScrollToInput: vi.fn(),
}))

describe('VariableSlot', () => {
  const VARIABLE_SLOT_COUNT = 8

  const mockSlot: VariableSlotType = {
    slot: 1,
    varName: '',
    expression: '',
    value: null,
    error: null,
  }

  const mockSlots: VariableSlotType[] = Array.from(
    { length: VARIABLE_SLOT_COUNT },
    (_, i) => ({
      slot: i + 1,
      varName: '',
      expression: '',
      value: null,
      error: null,
    })
  )

  const mockOnChange = vi.fn()
  const mockOnValidationError = vi.fn()

  beforeEach(() => {
    // console.warnをモック（handleValueFocusで警告が出るため）
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it.each([1, 2, 3, 4, 5, 6, 7, 8])('Variable%iのラベルが表示される', i => {
    const slot = { ...mockSlot, slot: i }
    render(
      <VariableSlot
        slot={slot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )
    expect(screen.getByText(`Variable${i}`)).toBeInTheDocument()
  })

  it('変数名と値の入力フィールドが表示される', () => {
    render(
      <VariableSlot
        slot={mockSlot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    expect(screen.getByTestId('variable-name-1')).toBeInTheDocument()
    expect(screen.getByTestId('variable-value-1')).toBeInTheDocument()
  })

  it('変数名入力時にonChangeが呼ばれる', async () => {
    const user = userEvent.setup()
    render(
      <VariableSlot
        slot={mockSlot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const nameInput = screen.getByTestId('variable-name-1')
    await user.type(nameInput, 'test')

    expect(mockOnChange).toHaveBeenCalled()
  })

  it('値入力フィールドでカスタムキーボードが使用される', () => {
    render(
      <VariableSlot
        slot={mockSlot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const valueInput = screen.getByTestId('variable-value-1')
    expect(valueInput).toHaveAttribute('inputMode', 'none')
  })

  it('値入力フィールドに直接onChangeイベントを発火してもonChangeは呼ばれない（カスタムキーボードで状態管理）', () => {
    render(
      <VariableSlot
        slot={mockSlot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const valueInput = screen.getByTestId('variable-value-1')
    fireEvent.change(valueInput, { target: { value: '123' } })

    // カスタムキーボードで状態管理するため、直接のonChangeは呼ばれない
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('無効な変数名でonValidationErrorが呼ばれる', () => {
    const slotWithInvalidName = { ...mockSlot, varName: '変数名' }
    render(
      <VariableSlot
        slot={slotWithInvalidName}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const nameInput = screen.getByTestId('variable-name-1')
    fireEvent.blur(nameInput)

    expect(mockOnValidationError).toHaveBeenCalledWith(
      expect.stringContaining('変数名')
    )
  })

  it('重複した変数名でonValidationErrorが呼ばれる', () => {
    const slotsWithExisting = [
      { ...mockSlot, slot: 1, varName: 'existingVar' },
      ...mockSlots.slice(1),
    ]

    const slotWithDuplicate = { ...mockSlot, slot: 2, varName: 'existingVar' }

    render(
      <VariableSlot
        slot={slotWithDuplicate}
        slots={slotsWithExisting}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const nameInput = screen.getByTestId('variable-name-2')
    fireEvent.blur(nameInput)

    expect(mockOnValidationError).toHaveBeenCalledWith(
      expect.stringContaining('重複')
    )
  })

  it('有効な変数名では onValidationError が呼ばれない', async () => {
    const user = userEvent.setup()
    render(
      <VariableSlot
        slot={mockSlot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const nameInput = screen.getByTestId('variable-name-1')
    await user.type(nameInput, 'validVar')
    fireEvent.blur(nameInput)

    expect(mockOnValidationError).not.toHaveBeenCalled()
  })

  it('初期値が正しく表示される', () => {
    const slotWithValues = {
      ...mockSlot,
      varName: 'testVar',
      expression: '123',
    }

    render(
      <VariableSlot
        slot={slotWithValues}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    expect(screen.getByDisplayValue('testVar')).toBeInTheDocument()
    expect(screen.getByDisplayValue('123')).toBeInTheDocument()
  })
})
