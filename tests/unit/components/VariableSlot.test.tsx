import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VariableSlot } from '@/components/calculator/VariableSlot'
import type { VariableSlot as VariableSlotType } from '@/types/sheet'

describe('VariableSlot', () => {
  const mockSlot: VariableSlotType = {
    slot: 1,
    varName: '',
    expression: '',
    value: null,
    error: null,
  }

  const mockSlots: VariableSlotType[] = Array.from({ length: 8 }, (_, i) => ({
    slot: i + 1,
    varName: '',
    expression: '',
    value: null,
    error: null,
  }))

  const mockOnChange = vi.fn()
  const mockOnValidationError = vi.fn()

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('Variable1〜8のラベルが表示される', () => {
    for (let i = 1; i <= 8; i++) {
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
    }
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

  it('値入力時にonChangeが呼ばれる', async () => {
    const user = userEvent.setup()
    render(
      <VariableSlot
        slot={mockSlot}
        slots={mockSlots}
        onChange={mockOnChange}
        onValidationError={mockOnValidationError}
      />
    )

    const valueInput = screen.getByTestId('variable-value-1')
    await user.type(valueInput, '123')

    expect(mockOnChange).toHaveBeenCalled()
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
