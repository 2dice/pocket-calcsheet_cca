import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { SheetMeta } from '@/types/sheet'
import { DragHandle } from './DragHandle'
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
}

export function SheetListItem({
  sheet,
  isEditMode,
  onSheetClick,
  onDeleteSheet,
}: SheetListItemProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sheet.id,
    disabled: !isEditMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    WebkitTouchCallout: 'none' as const,
    WebkitUserSelect: 'none' as const,
    userSelect: 'none' as const,
  }

  const handleClick = () => {
    if (!isEditMode) {
      onSheetClick(sheet.id)
    }
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
      {/* 削除ボタンを左側に配置（編集モード時のみ） */}
      {isEditMode && (
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
        <span className="text-base text-gray-900">{sheet.name}</span>
      </div>

      {/* ドラッグハンドルを右側に配置（編集モード時のみ） */}
      {isEditMode && (
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
