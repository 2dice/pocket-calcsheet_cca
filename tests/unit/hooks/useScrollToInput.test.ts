import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import React from 'react'
import { useScrollToInput } from '@/hooks/useScrollToInput'

// グローバルオブジェクトのモック
const mockScrollTo = vi.fn()
const mockScrollIntoView = vi.fn()

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

    // scrollIntoViewのモック
    Element.prototype.scrollIntoView = mockScrollIntoView

    // visualViewportのモック
    Object.defineProperty(window, 'visualViewport', {
      value: {
        height: 812, // iPhone X size
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
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
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 700,
      left: 0,
      right: 375,
      bottom: 800, // viewportHeight(812) - 20(マージン) = 792 を超える
      width: 375,
      height: 50,
      x: 0,
      y: 700,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // スクロール処理が呼ばれることを確認
    expect(mockScrollIntoView).toHaveBeenCalled()
  })

  it('refがnullの場合でもエラーにならない', () => {
    const mockRef = {
      current: null,
    } as React.RefObject<HTMLInputElement | null>

    expect(() => {
      renderHook(() => useScrollToInput(mockRef))
    }).not.toThrow()
  })

  it('visualViewportがサポートされていない環境でも動作する', async () => {
    // visualViewportを削除
    Object.defineProperty(window, 'visualViewport', {
      value: undefined,
      writable: true,
    })

    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // requestAnimationFrameを待機
    await new Promise(resolve => requestAnimationFrame(resolve))

    // scrollIntoViewが呼ばれることを確認（フォールバック）
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    })
  })

  it('キーボード表示時にvisualViewport高さを考慮してスクロールする', async () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // visualViewportの高さを変更（キーボード表示状態）
    Object.defineProperty(window, 'visualViewport', {
      value: {
        height: 400, // キーボード表示で高さが減る
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
    })

    // 要素がキーボードに隠れる位置にあることをシミュレート
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 350,
      left: 0,
      right: 375,
      bottom: 400, // viewportHeight(400) - 20(マージン) = 380 を超える
      width: 375,
      height: 50,
      x: 0,
      y: 350,
      toJSON: () => {},
    }))

    renderHook(() => useScrollToInput(mockRef))

    // フォーカスイベントをシミュレート
    const focusEvent = new Event('focus')
    mockElement.dispatchEvent(focusEvent)

    // requestAnimationFrameを待機
    await new Promise(resolve => requestAnimationFrame(resolve))

    // スクロール処理が呼ばれることを確認
    expect(mockScrollIntoView).toHaveBeenCalled()
  })

  it('要素の位置がキーボードに隠れる場合にスクロールが実行される', () => {
    const mockElement = document.createElement('input')
    const mockRef = { current: mockElement }

    // 要素が下の方に配置されている場合のBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 750, // 画面下部
      left: 0,
      right: 375,
      bottom: 800, // viewportHeight(812) - 20(マージン) = 792 を超える
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

    // すぐに確認できる
    expect(mockScrollIntoView).toHaveBeenCalled()
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
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      top: 750,
      left: 0,
      right: 375,
      bottom: 800, // viewportHeight(812) - 20(マージン) = 792 を超える
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

    // すぐに確認できる
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    })
  })
})
