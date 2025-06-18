import { useRef, useEffect, useState, useMemo } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Input } from '@/components/ui/input'
import type { SheetMeta } from '@/types/sheet'
import { SheetListItem } from './SheetListItem'
import { useDragAndDrop } from '@/hooks/useDragAndDrop'

interface SheetListProps {
  sheets: SheetMeta[]
  isEditMode?: boolean
  editingNewItem?: boolean
  onSheetClick?: (id: string) => void
  onDeleteSheet?: (id: string) => void
  onNewItemConfirm?: (value: string) => void
  onNewItemCancel?: () => void
  onReorderSheets?: (activeId: string, overId: string) => void
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function SheetList({
  sheets,
  isEditMode = false,
  editingNewItem = false,
  onSheetClick,
  onDeleteSheet,
  onNewItemConfirm,
  onNewItemCancel,
  onReorderSheets,
  inputRef: externalInputRef,
}: SheetListProps) {
  const [inputValue, setInputValue] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef || internalInputRef

  // ドラッグ&ドロップフック
  const { sensors, handleDragEnd } = useDragAndDrop({
    onReorderSheets: onReorderSheets || (() => {}),
    onDragStart: (id: string) => setActiveId(id),
    onDragEnd: () => {
      setActiveId(null)
      // onReorderSheets呼び出しは削除（useDragAndDrop内で処理）
    },
  })

  // sensorsのメモ化
  const memoizedSensors = useMemo(() => sensors, [sensors])

  const activeSheet = sheets.find(sheet => sheet.id === activeId)

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
    onSheetClick?.(sheetId)
  }

  return (
    <DndContext
      sensors={memoizedSensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      data-dnd-context
    >
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
          <SortableContext
            items={sheets.map(sheet => sheet.id)}
            strategy={verticalListSortingStrategy}
            data-sortable-context
          >
            <div className="space-y-0">
              {sheets.map(sheet => (
                <SheetListItem
                  key={sheet.id}
                  sheet={sheet}
                  isEditMode={isEditMode}
                  onSheetClick={handleSheetClick}
                  onDeleteSheet={onDeleteSheet}
                />
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
          </SortableContext>
        )}
      </div>
      <DragOverlay>
        {activeSheet && (
          <div className="border border-gray-200 bg-white shadow-lg">
            <SheetListItem
              sheet={activeSheet}
              isEditMode={isEditMode}
              onSheetClick={() => {}}
              onDeleteSheet={onDeleteSheet}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
