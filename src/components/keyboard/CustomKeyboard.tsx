import { useState, useRef } from 'react'
import { Portal } from '@/components/common/Portal'
import { FunctionPicker } from './FunctionPicker'
import { VariablePicker } from './VariablePicker'
import { useCustomKeyboard } from '@/hooks/useCustomKeyboard'
import { cn } from '@/lib/utils'

interface Props {
  visible: boolean
}

export function CustomKeyboard({ visible }: Props) {
  const { insertText, handleBackspace, moveCursor, handleEnter, target } =
    useCustomKeyboard()
  const [showFunctionPicker, setShowFunctionPicker] = useState(false)
  const [showVariablePicker, setShowVariablePicker] = useState(false)

  // タッチイベント処理済みフラグ
  const touchProcessedRef = useRef(false)
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
            <button
              type="button"
              className="h-9 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onTouchStart={e => {
                e.preventDefault()
                touchProcessedRef.current = true
                moveCursor('left')
              }}
              onMouseDown={e => {
                e.preventDefault()
                if (touchProcessedRef.current) {
                  touchProcessedRef.current = false
                  return
                }
                moveCursor('left')
              }}
            >
              ←
            </button>
            <button
              type="button"
              className="h-9 rounded bg-white text-center shadow-sm active:bg-gray-200"
              onTouchStart={e => {
                e.preventDefault()
                touchProcessedRef.current = true
                moveCursor('right')
              }}
              onMouseDown={e => {
                e.preventDefault()
                if (touchProcessedRef.current) {
                  touchProcessedRef.current = false
                  return
                }
                moveCursor('right')
              }}
            >
              →
            </button>
          </div>

          {/* メインキーボード: フレックスボックスで左右分割 */}
          <div className="flex gap-1">
            {/* 左側: 数字・演算子キー (8列グリッド) */}
            <div className="flex-1 grid grid-cols-8 gap-1">
              {/* 1行目 */}
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('%')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('%')
                }}
              >
                %
              </button>
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('^')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('^')
                }}
              >
                ^
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('7')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('7')
                }}
              >
                7
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('8')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('8')
                }}
              >
                8
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('9')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('9')
                }}
              >
                9
              </button>

              {/* 2行目 */}
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('+')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('+')
                }}
              >
                +
              </button>
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('-')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('-')
                }}
              >
                -
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('4')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('4')
                }}
              >
                4
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('5')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('5')
                }}
              >
                5
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('6')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('6')
                }}
              >
                6
              </button>

              {/* 3行目 */}
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('*')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('*')
                }}
              >
                *
              </button>
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('/')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('/')
                }}
              >
                /
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('1')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('1')
                }}
              >
                1
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('2')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('2')
                }}
              >
                2
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('3')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('3')
                }}
              >
                3
              </button>

              {/* 4行目 */}
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('(')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('(')
                }}
              >
                (
              </button>
              <button
                type="button"
                className="h-12 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText(')')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText(')')
                }}
              >
                )
              </button>
              <button
                type="button"
                className="col-span-4 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('0')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('0')
                }}
              >
                0
              </button>
              <button
                type="button"
                className="col-span-2 h-12 rounded bg-white text-center shadow-sm active:bg-gray-200"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  insertText('.')
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  insertText('.')
                }}
              >
                .
              </button>
            </div>

            {/* 右側: 特殊キー (固定幅) */}
            <div className="w-[20%] flex flex-col gap-1">
              <button
                type="button"
                className="h-9 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  handleBackspace()
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  handleBackspace()
                }}
              >
                BS
              </button>
              <button
                type="button"
                className="h-9 rounded-xl bg-purple-300 text-center shadow-sm active:bg-purple-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  setShowFunctionPicker(true)
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  setShowFunctionPicker(true)
                }}
              >
                f(x)
              </button>
              <button
                type="button"
                className="h-9 rounded-xl bg-purple-300 text-center shadow-sm active:bg-purple-400"
                onTouchStart={e => {
                  e.preventDefault()
                  touchProcessedRef.current = true
                  setShowVariablePicker(true)
                }}
                onMouseDown={e => {
                  e.preventDefault()
                  if (touchProcessedRef.current) {
                    touchProcessedRef.current = false
                    return
                  }
                  setShowVariablePicker(true)
                }}
              >
                var
              </button>
              <button
                type="button"
                className="flex-1 rounded bg-gray-300 text-center shadow-sm active:bg-gray-400"
                onMouseDown={e => {
                  e.preventDefault()
                  handleEnter()
                }}
              >
                ↵
              </button>
            </div>
          </div>
        </div>

        {/* Function Picker Dialog */}
        <FunctionPicker
          open={showFunctionPicker}
          onSelect={(template, cursorOffset) => {
            insertText(template, cursorOffset)
            setShowFunctionPicker(false)
          }}
          onClose={() => setShowFunctionPicker(false)}
        />

        {/* Variable Picker Dialog */}
        {target && (
          <VariablePicker
            open={showVariablePicker}
            onSelect={variableText => {
              insertText(variableText)
              setShowVariablePicker(false)
            }}
            onClose={() => setShowVariablePicker(false)}
            sheetId={target.sheetId}
          />
        )}
      </div>
    </Portal>
  )
}
