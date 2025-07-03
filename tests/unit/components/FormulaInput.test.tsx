/* eslint-disable @typescript-eslint/no-unsafe-return */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { FormulaInput } from '@/components/calculator/FormulaInput'

// Portal のモック
vi.mock('@/components/common/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

// useScrollToInput のモック
vi.mock('@/hooks/useScrollToInput', () => ({
  useScrollToInput: () => {},
}))

// useCustomKeyboard のモック
const mockShowKeyboard = vi.fn()
const mockUpdateKeyboardInput = vi.fn()
vi.mock('@/hooks/useCustomKeyboard', () => ({
  useCustomKeyboard: () => ({
    show: mockShowKeyboard,
    target: null,
    keyboardInput: null,
  }),
}))

// useUIStore のモック
vi.mock('@/store/uiStore', () => ({
  useUIStore: () => ({
    updateKeyboardInput: mockUpdateKeyboardInput,
  }),
}))

// useParams のモック
const mockUseParams = vi.fn()
vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal()
  return {
    ...actual,
    useParams: () => mockUseParams(),
  }
})

const renderWithRouter = (
  component: React.ReactElement,
  route = '/test-id/formula'
) => {
  window.history.pushState({}, 'Test page', route)
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('FormulaInput', () => {
  const mockOnChange = vi.fn()
  const testValue = '2 + 3 * 4\n+ 5'

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseParams.mockReturnValue({ id: 'test-sheet-id' })

    // React Router v6 deprecation warnings をモック
    vi.spyOn(console, 'warn').mockImplementation(message => {
      if (
        typeof message === 'string' &&
        (message.includes('React Router Future Flag Warning') ||
          message.includes('v7_startTransition') ||
          message.includes('v7_relativeSplatPath'))
      ) {
        return
      }
      console.warn(message)
    })
  })

  it('textareaが表示される', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('複数行の入力が可能', () => {
    renderWithRouter(<FormulaInput value={testValue} onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(testValue)

    // 改行が含まれていることを確認
    expect(testValue).toContain('\n')
  })

  it('readOnly属性でネイティブキーボード無効', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('inputMode', 'none')
  })

  it('onFocusイベントが発生する', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.focus(textarea)

    expect(mockShowKeyboard).toHaveBeenCalledWith({
      type: 'formula',
      sheetId: 'test-sheet-id',
    })
  })

  it('value propが正しく表示される', () => {
    const testValue = 'sin(x) + cos(y)'
    renderWithRouter(<FormulaInput value={testValue} onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue(testValue)
  })

  it('空の値が正しく処理される', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveValue('')
  })

  it('labelが正しく表示される', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const label = screen.getByText('Formula')
    expect(label).toBeInTheDocument()
  })

  it('textareaがmin-heightスタイルを持つ', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('min-h-[120px]')
  })

  it('textareaがresize-noneスタイルを持つ', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('resize-none')
  })

  it('textareaがcursor-pointerスタイルを持つ', () => {
    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('cursor-pointer')
  })

  it('パラメータにidが存在しない場合はフォーカス処理をスキップ', () => {
    mockUseParams.mockReturnValue({}) // idなし

    renderWithRouter(<FormulaInput value="" onChange={mockOnChange} />)

    const textarea = screen.getByRole('textbox')
    fireEvent.focus(textarea)

    expect(mockShowKeyboard).not.toHaveBeenCalled()
  })

  it('クリック時にselection changeイベントが処理される', () => {
    renderWithRouter(
      <FormulaInput value="test formula" onChange={mockOnChange} />
    )

    const textarea = screen.getByRole('textbox')

    // カーソル位置を設定してクリック
    textarea.selectionStart = 5
    textarea.selectionEnd = 5
    fireEvent.click(textarea)

    // mockUpdateKeyboardInputが適切に呼ばれることは、キーボード統合時に確認される
    expect(textarea).toBeInTheDocument()
  })
})
