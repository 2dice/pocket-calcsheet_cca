import { Portal } from '@/components/common/Portal'
import { cn } from '@/lib/utils'

interface Props {
  visible: boolean
}

export function CustomKeyboard({ visible }: Props) {
  return (
    <Portal containerId="keyboard-portal">
      <div
        data-testid="custom-keyboard"
        role="toolbar"
        aria-hidden={!visible}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 bg-gray-100',
          'transform-gpu transition-all duration-300 ease-in-out will-change-transform',
          'safe-area-bottom',
          {
            'translate-y-0 opacity-100': visible,
            'translate-y-full opacity-0 pointer-events-none': !visible,
          }
        )}
      >
        <div className="p-2">
          {/* 最上段: カーソル移動キー */}
          <div className="grid grid-cols-2 gap-1 mb-1">
            <button className="h-9 rounded bg-white text-center shadow-sm active:bg-gray-200">
              ←
            </button>
            <button className="h-9 rounded bg-white text-center shadow-sm active:bg-gray-200">
              →
            </button>
          </div>

          {/* メインキーボード: 10列グリッド */}
          <div className="grid grid-cols-10 gap-1">
            {/* 1行目 */}
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              %
            </button>
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              ^
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              7
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              8
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              9
            </button>
            <button className="col-span-2 h-9 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              BS
            </button>

            {/* 2行目 */}
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              +
            </button>
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              -
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              4
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              5
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              6
            </button>
            <button className="col-span-2 h-9 rounded-xl bg-purple-300 text-center shadow-sm active:bg-purple-400">
              f(x)
            </button>

            {/* 3行目 */}
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              *
            </button>
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              /
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              1
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              2
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              3
            </button>
            <button className="col-span-2 h-9 rounded-xl bg-purple-300 text-center shadow-sm active:bg-purple-400">
              var
            </button>

            {/* 4行目 */}
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              (
            </button>
            <button className="col-span-1 h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              )
            </button>
            <button className="col-span-4 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              0
            </button>
            <button className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200">
              .
            </button>
            <button className="col-span-2 h-21 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400">
              ↵
            </button>
          </div>
        </div>
      </div>
    </Portal>
  )
}
