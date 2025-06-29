import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { useScrollToInput } from '@/hooks/useScrollToInput'

// グローバルオブジェクトのモック
const mockScrollTo = vi.fn()
const mockScrollIntoView = vi.fn()
const mockScrollBy = vi.fn()

describe('useScrollToInput hook', () => {
  beforeEach(() => {
    // requestAnimationFrameを同期的に実行するモック
    global.requestAnimationFrame = vi.fn((cb: (time: number) => void) => {
      cb(0)
      return 0
    })

    // windowオブジェクトのモック
    Object.defineProperty(window, 'scrollTo', {
      value: mockScrollTo,
      writable: true,
    })

    // scrollByのモック（新しい実装で使用）
    Object.defineProperty(window, 'scrollBy', {
      value: mockScrollBy,
      writable: true,
    })

    // scrollIntoViewのモック（フォールバック用）
    Element.prototype.scrollIntoView = mockScrollIntoView

    // window.innerHeightのモック
    Object.defineProperty(window, 'innerHeight', {
      value: 812, // iPhone X size
      writable: true,
    })

    // getBoundingClientRectのモック
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 200,
      left: 0,
      right: 375,
      bottom: 250,
      width: 375,
      height: 50,
      x: 0,
      y: 200,
      toJSON: () => {},
    }))

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('フックが正常に初期化される', () => {
    const mockRef = {
      current: null,
    } as React.RefObject<HTMLInputElement | null>
    const { result } = renderHook(() => useScrollToInput(mockRef))

    expect(result.current).toBeUndefined()
  })

  it('refが設定されている場合、フォーカス時にスクロール処理が実行される', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // 要素がキーボードに隠れる位置にあることをシミュレート
    // keyboardTop = 812(innerHeight) - 280(KEYBOARD_HEIGHT) = 532
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 500,
      left: 0,
      right: 375,
      bottom: 550, // 532より大きい値なのでスクロールが必要
      width: 375,
      height: 50,
      x: 0,
      y: 500,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // window.scrollByが呼ばれることを確認
    expect(mockScrollBy).toHaveBeenCalledWith({
      top: 38, // 550 - 532 + 20 = 38
      behavior: 'smooth',
    })
  })

  it('refがnullの場合でもエラーにならない', () => {
    const mockRef = {
      current: null,
    } as React.RefObject<HTMLInputElement | null>

    expect(() => {
      renderHook(() => useScrollToInput(mockRef))
    }).not.toThrow()
  })

  it('要素がキーボードに隠れない場合はスクロールしない', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // 要素がキーボードに隠れない位置にあることをシミュレート
    // keyboardTop = 812(innerHeight) - 280(KEYBOARD_HEIGHT) = 532
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 200,
      left: 0,
      right: 375,
      bottom: 250, // 532より小さい値なのでスクロール不要
      width: 375,
      height: 50,
      x: 0,
      y: 200,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // スクロール処理が呼ばれないことを確認
    expect(mockScrollBy).not.toHaveBeenCalled()
  })

  it('カスタムキーボードの高さ（280px）を考慮してスクロールする', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // 要素がカスタムキーボードに隠れる位置にあることをシミュレート
    // keyboardTop = 812(innerHeight) - 280(KEYBOARD_HEIGHT) = 532
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 600,
      left: 0,
      right: 375,
      bottom: 650, // 532より大きい値なのでスクロールが必要
      width: 375,
      height: 50,
      x: 0,
      y: 600,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // window.scrollByが呼ばれることを確認
    expect(mockScrollBy).toHaveBeenCalledWith({
      top: 138, // 650 - 532 + 20 = 138
      behavior: 'smooth',
    })
  })

  it('要素の位置がキーボードに隠れる場合にスクロールが実行される', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // 要素が下の方に配置されている場合のBoundingClientRect
    // keyboardTop = 812(innerHeight) - 280(KEYBOARD_HEIGHT) = 532
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 750, // 画面下部
      left: 0,
      right: 375,
      bottom: 800, // 532より大きい値なのでスクロールが必要
      width: 375,
      height: 50,
      x: 0,
      y: 750,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // window.scrollByが呼ばれることを確認
    expect(mockScrollBy).toHaveBeenCalledWith({
      top: 288, // 800 - 532 + 20 = 288
      behavior: 'smooth',
    })
  })

  it('コンポーネントがアンマウントされた時にイベントリスナーが削除される', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    const removeEventListenerSpy = vi.spyOn(mockElement, 'removeEventListener')

    const { unmount } = renderHook(() => useScrollToInput(mockRef))

    // アンマウント
    unmount()

    // removeEventListenerが呼ばれることを確認
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'focus',
      expect.any(Function)
    )
  })

  it('refが変更された時にイベントリスナーが適切に管理される', () => {
    const mockElement1 = document.createElement('input')
    const mockElement2 = document.createElement('input')
    const mockRef1 = { current: mockElement1 }
    const mockRef2 = { current: mockElement2 }

    const addEventListenerSpy1 = vi.spyOn(mockElement1, 'addEventListener')
    const removeEventListenerSpy1 = vi.spyOn(
      mockElement1,
      'removeEventListener'
    )
    const addEventListenerSpy2 = vi.spyOn(mockElement2, 'addEventListener')

    let currentRef = mockRef1
    const { rerender } = renderHook(() => useScrollToInput(currentRef))

    // 最初の要素にイベントリスナーが追加される
    expect(addEventListenerSpy1).toHaveBeenCalledWith(
      'focus',
      expect.any(Function)
    )

    // refオブジェクト自体を変更
    currentRef = mockRef2
    rerender()

    // 古い要素からイベントリスナーが削除されることを確認
    expect(removeEventListenerSpy1).toHaveBeenCalledWith(
      'focus',
      expect.any(Function)
    )

    // 新しい要素にイベントリスナーが追加される
    expect(addEventListenerSpy2).toHaveBeenCalledWith(
      'focus',
      expect.any(Function)
    )
  })

  it('smoothスクロールオプションが正しく設定される', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // 要素がキーボードに隠れる位置にあることをシミュレート
    // keyboardTop = 812(innerHeight) - 280(KEYBOARD_HEIGHT) = 532
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 750,
      left: 0,
      right: 375,
      bottom: 800, // 532より大きい値なのでスクロールが必要
      width: 375,
      height: 50,
      x: 0,
      y: 750,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // window.scrollByがsmoothオプションで呼ばれることを確認
    expect(mockScrollBy).toHaveBeenCalledWith({
      top: 288, // 800 - 532 + 20 = 288
      behavior: 'smooth',
    })
  })
})
