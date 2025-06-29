import { render, screen } from '@testing-library/react'
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
})
