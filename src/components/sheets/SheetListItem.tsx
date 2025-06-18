import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState, useRef, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import type { SheetMeta } from '@/types/sheet'
import { DragHandle } from './DragHandle'
import { Input } from '@/components/ui/input'
import { useScrollToInput } from '@/hooks/useScrollToInput'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface SheetListItemProps {
  sheet: SheetMeta
  isEditMode: boolean
  onSheetClick: (id: string) => void
  onDeleteSheet?: (id: string) => void
  onUpdateSheet?: (id: string, name: string) => void
}

export function SheetListItem({
  sheet,
  isEditMode,
  onSheetClick,
  onDeleteSheet,
  onUpdateSheet,
}: SheetListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(sheet.name)
  const inputRef = useRef<HTMLInputElement>(null)

  // スクロール制御フック
  useScrollToInput(inputRef)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sheet.id,
    disabled: !isEditMode || isEditing, // 編集中はドラッグを無効化
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    WebkitTouchCallout: 'none' as const,
    WebkitUserSelect: 'none' as const,
    userSelect: 'none' as const,
  }

  // 編集開始時にeditValueをリセット
  useEffect(() => {
    if (isEditing && inputRef.current) {
      setEditValue(sheet.name)
      inputRef.current.focus()
    }
  }, [isEditing, sheet.name])

  const handleClick = () => {
    if (!isEditMode) {
      onSheetClick(sheet.id)
    }
  }

  const handleNameClick = () => {
    if (isEditMode && !isEditing) {
      setIsEditing(true)
    }
  }

  const handleEditConfirm = () => {
    if (onUpdateSheet) {
      onUpdateSheet(sheet.id, editValue.trim())
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditValue(sheet.name)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleEditConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleEditCancel()
    }
  }

  const handleBlur = () => {
    handleEditConfirm()
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    onDeleteSheet?.(sheet.id)
    setShowDeleteDialog(false)
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-sortable-item
      className={`border-t border-gray-200 h-12 flex items-center px-4 bg-white ${
        isDragging ? 'opacity-50' : 'hover:bg-gray-50'
      } ${!isEditMode ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
      role={!isEditMode ? 'button' : undefined}
      tabIndex={!isEditMode ? 0 : undefined}
      aria-label={!isEditMode ? `${sheet.name} を開く` : undefined}
      onKeyDown={
        !isEditMode
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick()
              }
            }
          : undefined
      }
    >
      {/* 削除ボタンを左側に配置（編集モード時・編集中でない場合のみ） */}
      {isEditMode && !isEditing && (
        <button
          data-testid="delete-button"
          onClick={handleDeleteClick}
          className="flex items-center justify-center min-h-11 min-w-11 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors mr-2"
          aria-label={`${sheet.name}を削除`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      )}

      {/* シート名を中央に配置 */}
      <div className="flex-1 select-none">
        {isEditing ? (
          <Input
            ref={inputRef}
            data-testid="sheet-name-input"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="text-base border-0 shadow-none p-0 h-auto focus-visible:ring-0"
          />
        ) : (
          <span
            className="text-base text-gray-900 cursor-pointer"
            onClick={handleNameClick}
          >
            {sheet.name}
          </span>
        )}
      </div>

      {/* ドラッグハンドルを右側に配置（編集モード時・編集中でない場合のみ） */}
      {isEditMode && !isEditing && (
        <div {...attributes} {...listeners}>
          <DragHandle isDragging={isDragging} />
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>シートを削除</AlertDialogTitle>
            <AlertDialogDescription>
              "{sheet.name}
              "を削除してもよろしいですか？この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
