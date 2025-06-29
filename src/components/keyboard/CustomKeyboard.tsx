import { useEffect, useState, useRef } from 'react'
import { Portal } from '@/components/common/Portal'
import { cn } from '@/lib/utils'

interface Props {
  visible: boolean
}

export function CustomKeyboard({ visible }: Props) {
  console.log('CustomKeyboard render, visible:', visible)

  // マウント状態を追跡
  const [isMounted, setIsMounted] = useState(false)
  const portalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // コンポーネントマウント時
    setIsMounted(true)

    // Portal要素の存在確認
    const checkPortal = () => {
      const portalEl = document.getElementById('keyboard-portal')
      console.log(
        'Portal check - exists:',
        !!portalEl,
        'mounted:',
        isMounted,
        'visible:',
        visible
      )
    }

    // 少し遅延させてチェック
    const timer = setTimeout(checkPortal, 100)

    return () => {
      clearTimeout(timer)
      setIsMounted(false)
    }
  }, [visible, isMounted])

  // visibleがtrueでもマウントされていない場合は一旦nullを返す
  if (!visible) return null

  return (
    <Portal containerId="keyboard-portal">
      <div
        ref={portalRef}
        data-testid="custom-keyboard"
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-gray-100',
          'transform transition-transform duration-300 will-change-transform',
          'safe-area-bottom',
          // 初回表示時のアニメーションを制御
          visible && isMounted ? 'translate-y-0' : 'translate-y-full'
        )}
        role="toolbar"
        style={{
          // 初期状態を明示的に設定
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: isMounted ? 'transform 0.3s' : 'none',
        }}
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
}
