import { useRef, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import type { SheetMeta } from '@/types/sheet'

interface SheetListProps {
  sheets: SheetMeta[]
  isEditMode?: boolean
  editingNewItem?: boolean
  onSheetClick?: (id: string) => void
  onNewItemConfirm?: (value: string) => void
  onNewItemCancel?: () => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SheetList({
  sheets,
  isEditMode = false,
  editingNewItem = false,
  onSheetClick,
  onNewItemConfirm,
  onNewItemCancel,
  inputRef: externalInputRef,
}: SheetListProps) {
  const [inputValue, setInputValue] = useState('')
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef || internalInputRef

  // 編集モードでfocusを当てる
  useEffect(() => {
    if (editingNewItem && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingNewItem, inputRef])

  // 編集開始時に入力値をリセット
  useEffect(() => {
    if (editingNewItem) {
      setInputValue('')
    }
  }, [editingNewItem])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onNewItemConfirm?.(inputValue)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onNewItemCancel?.()
    }
  }

  const handleBlur = () => {
    onNewItemConfirm?.(inputValue)
  }

  const handleSheetClick = (sheetId: string) => {
    if (!isEditMode) {
      onSheetClick?.(sheetId)
    }
  }

  return (
    <div data-testid="sheet-list" className="w-full">
      {sheets.length === 0 && !editingNewItem ? (
        <div data-testid="empty-list-indicator" className="space-y-0">
          {/* 空のリスト状態でも横線を表示してリストであることを示す */}
          <div className="border-t border-gray-200 h-12 flex items-center px-4 bg-white">
            <span className="text-gray-500 text-sm">
              計算シートがありません
            </span>
          </div>
          <div className="border-t border-gray-200 h-12 bg-white" />
          <div className="border-t border-gray-200 h-12 bg-white" />
          <div className="border-t border-gray-200 h-12 bg-white" />
          <div className="border-t border-b border-gray-200 h-12 bg-white" />
        </div>
      ) : (
        <div className="space-y-0">
          {sheets.map(sheet => (
            <div
              key={sheet.id}
              className="border-t border-gray-200 h-12 flex items-center px-4 bg-white hover:bg-gray-50 cursor-pointer"
              onClick={() => handleSheetClick(sheet.id)}
              role="button"
              tabIndex={0}
              aria-label={`${sheet.name} を開く`}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSheetClick(sheet.id)
                }
              }}
            >
              <span className="text-base text-gray-900">{sheet.name}</span>
            </div>
          ))}

          {/* 編集中の新規アイテム */}
          {editingNewItem && (
            <div className="border-t border-gray-200 h-12 flex items-center px-4 bg-white">
              <Input
                ref={inputRef}
                data-testid="new-sheet-input"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                className="text-base border-0 shadow-none p-0 h-auto focus-visible:ring-0"
                placeholder="シート名を入力"
              />
            </div>
          )}

          <div className="border-t border-b border-gray-200 h-0" />
        </div>
      )}
    </div>
  )
}
