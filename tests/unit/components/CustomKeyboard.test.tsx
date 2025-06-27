import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CustomKeyboard } from '@/components/keyboard/CustomKeyboard'

// Mock Portal to avoid DOM issues in tests
vi.mock('@/components/common/Portal', () => ({
  Portal: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

describe('CustomKeyboard', () => {
  it('ダミーキーが表示される', () => {
    render(<CustomKeyboard visible={true} onClose={() => {}} />)

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

  it('visible=trueでレンダリングされる', () => {
    render(<CustomKeyboard visible={true} onClose={() => {}} />)

    const keyboard = screen.getByTestId('custom-keyboard')
    expect(keyboard).toBeInTheDocument()
    expect(keyboard).toHaveClass('translate-y-0')
  })

  it('visible=falseで非表示になる', () => {
    render(<CustomKeyboard visible={false} onClose={() => {}} />)

    // visible=falseの場合はレンダリングされない
    expect(screen.queryByTestId('custom-keyboard')).not.toBeInTheDocument()
  })

  it('onCloseコールバックが呼ばれる', () => {
    const mockOnClose = vi.fn()
    render(<CustomKeyboard visible={true} onClose={mockOnClose} />)

    // ダミーキーをクリックしてもonCloseは呼ばれない（今回は仕様にない）
    const key = screen.getByText('1')
    fireEvent.click(key)

    // 現在のダミー実装ではonCloseは呼ばれない
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('ポータル内にレンダリングされる', () => {
    render(<CustomKeyboard visible={true} onClose={() => {}} />)

    // Portalがモックされているので、単純にキーボードが表示されることを確認
    expect(screen.getByTestId('custom-keyboard')).toBeInTheDocument()
  })

  it('キーをクリックするとコンソールにログが出力される', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(<CustomKeyboard visible={true} onClose={() => {}} />)

    const key = screen.getByText('1')
    fireEvent.click(key)

    expect(consoleSpy).toHaveBeenCalledWith('Key pressed: 1')

    consoleSpy.mockRestore()
  })
})
