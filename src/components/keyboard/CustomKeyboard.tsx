import { Portal } from '@/components/common/Portal'
import { cn } from '@/lib/utils'

interface Props {
  visible: boolean
  onClose: () => void
}

export function CustomKeyboard({ visible }: Props) {
  if (!visible) return null

  // ダミーキーレイアウト（画像を参考）
  const dummyKeys = [
    // 1行目
    ['%', '^', '7', '8', '9', 'BS'],
    // 2行目
    ['+', '-', '4', '5', '6', 'f(x)'],
    // 3行目
    ['*', '/', '1', '2', '3', 'var'],
    // 4行目
    ['(', ')', '0', '.', '←', '↵'],
  ]

  return (
    <Portal containerId="keyboard-portal">
      <div
        data-testid="custom-keyboard"
        className={cn(
          'fixed bottom-0 left-0 right-0 bg-gray-100',
          'transform transition-transform duration-300',
          'safe-area-bottom', // SafeArea対応
          visible ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        <div className="grid grid-cols-6 gap-1 p-2">
          {dummyKeys.flat().map(key => (
            <button
              key={key}
              className={cn(
                'h-12 rounded bg-white text-center',
                'shadow-sm active:bg-gray-200'
              )}
              onClick={() => console.log(`Key pressed: ${key}`)}
            >
              {key}
            </button>
          ))}
        </div>
      </div>
    </Portal>
  )
}
