import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomKeyboard } from '@/components/keyboard/CustomKeyboard'
import { FunctionPicker } from '@/components/keyboard/FunctionPicker'
import { VariablePicker } from '@/components/keyboard/VariablePicker'

// Mock Portal to avoid DOM issues in tests
vi.mock('@/components/common/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// Mock the hooks
const mockInsertText = vi.fn()
const mockHandleBackspace = vi.fn()
const mockMoveCursor = vi.fn()
const mockHandleEnter = vi.fn()

vi.mock('@/hooks/useCustomKeyboard', () => ({
  useCustomKeyboard: () => ({
    isVisible: true,
    target: { type: 'variable', sheetId: 'test-id', slot: 1 },
    keyboardInput: { value: 'test', cursorPosition: 4 },
    cursorPosition: 4,
    show: vi.fn(),
    hide: vi.fn(),
    insertText: mockInsertText,
    handleBackspace: mockHandleBackspace,
    moveCursor: mockMoveCursor,
    handleEnter: mockHandleEnter,
  }),
}))

// Mock store for VariablePicker
const mockVariableSlots = [
  { slot: 1, varName: 'testVar1', expression: '1+2', value: null, error: null },
  { slot: 2, varName: '', expression: '', value: null, error: null },
  { slot: 3, varName: 'var3', expression: '5*6', value: null, error: null },
  { slot: 4, varName: '', expression: '', value: null, error: null },
  { slot: 5, varName: '', expression: '', value: null, error: null },
  { slot: 6, varName: '', expression: '', value: null, error: null },
  { slot: 7, varName: '', expression: '', value: null, error: null },
  { slot: 8, varName: '', expression: '', value: null, error: null },
]

vi.mock('@/store/sheetsStore', () => ({
  useSheetsStore: () => ({
    entities: {
      'test-id': {
        variableSlots: mockVariableSlots,
      },
    },
  }),
}))

describe('CustomKeyboard', () => {
  it('ダミーキーが表示される', () => {
    render(<CustomKeyboard visible={true} />)

    // 各キーが表示されることを確認
    expect(screen.getByText('%')).toBeInTheDocument()
    expect(screen.getByText('^')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument()
    expect(screen.getByText('BS')).toBeInTheDocument()

    expect(screen.getByText('+')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
    expect(screen.getByText('f(x)')).toBeInTheDocument()

    expect(screen.getByText('*')).toBeInTheDocument()
    expect(screen.getByText('/')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('var')).toBeInTheDocument()

    expect(screen.getByText('(')).toBeInTheDocument()
    expect(screen.getByText(')')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('.')).toBeInTheDocument()
    expect(screen.getByText('←')).toBeInTheDocument()
    expect(screen.getByText('↵')).toBeInTheDocument()
  })

  it('visible=trueでレンダリングされ、表示される', () => {
    render(<CustomKeyboard visible={true} />)
    const keyboard = screen.getByTestId('custom-keyboard')
    expect(keyboard).toBeInTheDocument()
    expect(keyboard).toHaveClass('translate-y-0')
    expect(keyboard).not.toHaveClass('pointer-events-none')
  })

  it('visible=falseでもDOMに存在するが、非表示になる', () => {
    render(<CustomKeyboard visible={false} />)
    const keyboard = screen.getByTestId('custom-keyboard')
    expect(keyboard).toBeInTheDocument()
    expect(keyboard).toHaveClass('translate-y-full', 'pointer-events-none')
    expect(keyboard).toHaveAttribute('aria-hidden', 'true')
  })

  it('ポータル内にレンダリングされる', () => {
    render(<CustomKeyboard visible={true} />)

    // Portalがモックされているので、単純にキーボードが表示されることを確認
    expect(screen.getByTestId('custom-keyboard')).toBeInTheDocument()
  })

  describe('キー入力機能', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('数字キークリックで数字が入力される', () => {
      render(<CustomKeyboard visible={true} />)

      const key7 = screen.getByText('7')
      fireEvent.mouseDown(key7)

      expect(mockInsertText).toHaveBeenCalledWith('7')
    })

    it('演算子キークリックで演算子が入力される', () => {
      render(<CustomKeyboard visible={true} />)

      const plusKey = screen.getByText('+')
      fireEvent.mouseDown(plusKey)

      expect(mockInsertText).toHaveBeenCalledWith('+')
    })

    it('BSキークリックで文字が削除される', () => {
      render(<CustomKeyboard visible={true} />)

      const backspaceKey = screen.getByText('BS')
      fireEvent.mouseDown(backspaceKey)

      expect(mockHandleBackspace).toHaveBeenCalled()
    })

    it('カーソル移動キーでカーソル位置が変わる', () => {
      render(<CustomKeyboard visible={true} />)

      const leftArrow = screen.getByText('←')
      const rightArrow = screen.getByText('→')

      fireEvent.mouseDown(leftArrow)
      expect(mockMoveCursor).toHaveBeenCalledWith('left')

      fireEvent.mouseDown(rightArrow)
      expect(mockMoveCursor).toHaveBeenCalledWith('right')
    })

    it('Enterキーで入力が確定される', () => {
      render(<CustomKeyboard visible={true} />)

      const enterKey = screen.getByText('↵')
      fireEvent.mouseDown(enterKey)

      expect(mockHandleEnter).toHaveBeenCalled()
    })
  })
})

describe('FunctionPicker', () => {
  const mockOnSelect = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('関数一覧が表示される', () => {
    render(
      <FunctionPicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    // 各関数が表示されることを確認
    expect(screen.getByText('sqrt - 平方根')).toBeInTheDocument()
    expect(screen.getByText('sin - サイン(度)')).toBeInTheDocument()
    expect(screen.getByText('cos - コサイン(度)')).toBeInTheDocument()
    expect(screen.getByText('log - 常用対数(底10)')).toBeInTheDocument()
  })

  it('関数選択でonSelectコールバックが呼ばれる', () => {
    render(
      <FunctionPicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const sqrtFunction = screen.getByText('sqrt - 平方根')
    fireEvent.click(sqrtFunction)

    expect(mockOnSelect).toHaveBeenCalledWith('sqrt()', 1)
  })

  it('閉じるボタンでダイアログが閉じられる', () => {
    render(
      <FunctionPicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByText('キャンセル')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})

describe('VariablePicker', () => {
  const mockOnSelect = vi.fn()
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('変数一覧（Variable1〜8）が表示される', () => {
    render(
      <VariablePicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        sheetId="test-id"
      />
    )

    // テストデータに基づく実際の表示名を確認
    expect(screen.getByText('testVar1')).toBeInTheDocument() // slot 1 - custom name
    expect(screen.getByText('Variable2')).toBeInTheDocument() // slot 2 - default name
    expect(screen.getByText('var3')).toBeInTheDocument() // slot 3 - custom name
    for (let i = 4; i <= 8; i++) {
      expect(screen.getByText(`Variable${i}`)).toBeInTheDocument() // slots 4-8 - default names
    }
  })

  it('変数名がある場合は変数名が表示される', () => {
    render(
      <VariablePicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        sheetId="test-id"
      />
    )

    // testVar1が表示されることを確認
    expect(screen.getByText('testVar1')).toBeInTheDocument()
    expect(screen.getByText('var3')).toBeInTheDocument()
  })

  it('変数選択でonSelectコールバックが呼ばれる', () => {
    render(
      <VariablePicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        sheetId="test-id"
      />
    )

    const var1Button = screen.getByText('testVar1')
    fireEvent.click(var1Button)

    expect(mockOnSelect).toHaveBeenCalledWith('[testVar1]')
  })

  it('空の変数選択時はVariable番号形式で返される', () => {
    render(
      <VariablePicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        sheetId="test-id"
      />
    )

    const var2Button = screen.getByText('Variable2')
    fireEvent.click(var2Button)

    expect(mockOnSelect).toHaveBeenCalledWith('[Variable2]')
  })

  it('閉じるボタンでダイアログが閉じられる', () => {
    render(
      <VariablePicker
        open={true}
        onSelect={mockOnSelect}
        onClose={mockOnClose}
        sheetId="test-id"
      />
    )

    const closeButton = screen.getByText('キャンセル')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
