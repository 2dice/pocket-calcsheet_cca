import React, { useEffect } from 'react'
import { Portal } from '@/components/common/Portal'
import { cn } from '@/lib/utils'

interface Props {
  visible: boolean
  onClose: () => void // ESCキーやオーバーレイクリックで使用予定
}

export const CustomKeyboard = React.memo(function CustomKeyboard({
  visible,
  onClose,
}: Props) {
  console.log('CustomKeyboard render, visible:', visible) // デバッグログ

  // ESCキー対応を追加
  useEffect(() => {
    if (!visible) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [visible, onClose])

  if (!visible) return null

  return (
    <Portal containerId="keyboard-portal">
      <div
        data-testid="custom-keyboard"
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-gray-100',
          'transform transition-transform duration-300 will-change-transform',
          'safe-area-bottom',
          visible ? 'translate-y-0' : 'translate-y-full'
        )}
        role="toolbar"
      >
        <div className="p-2">
          {/* 最上段: カーソル移動キー */}
          <div className="grid grid-cols-2 gap-1 mb-1">
            <button
              className="h-9 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: ←')}
            >
              ←
            </button>
            <button
              className="h-9 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: →')}
            >
              →
            </button>
          </div>

          {/* メインキーボード: 6列グリッド */}
          <div className="grid grid-cols-12 gap-1">
            {/* 1行目 */}
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: %')}
            >
              %
            </button>
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: ^')}
            >
              ^
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 7')}
            >
              7
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 8')}
            >
              8
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 9')}
            >
              9
            </button>
            <button
              className="col-span-4 h-9 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: BS')}
            >
              BS
            </button>

            {/* 2行目 */}
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: +')}
            >
              +
            </button>
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: -')}
            >
              -
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 4')}
            >
              4
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 5')}
            >
              5
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 6')}
            >
              6
            </button>
            <button
              className="col-span-4 h-9 rounded-xl bg-purple-300 text-center shadow-sm active:bg-purple-400"
              onClick={() => console.log('Key pressed: f(x)')}
            >
              f(x)
            </button>

            {/* 3行目 */}
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: *')}
            >
              *
            </button>
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: /')}
            >
              /
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 1')}
            >
              1
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 2')}
            >
              2
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 3')}
            >
              3
            </button>
            <button
              className="col-span-4 h-9 rounded-xl bg-purple-300 text-center shadow-sm active:bg-purple-400"
              onClick={() => console.log('Key pressed: var')}
            >
              var
            </button>

            {/* 4行目 - 特殊レイアウト */}
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: (')}
            >
              (
            </button>
            <button
              className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: )')}
            >
              )
            </button>
            <button
              className="col-span-4 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: 0')}
            >
              0
            </button>
            <button
              className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onClick={() => console.log('Key pressed: .')}
            >
              .
            </button>
            <button
              className="col-span-4 row-span-2 h-21 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
              onClick={() => console.log('Key pressed: ↵')}
            >
              ↵
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
})
