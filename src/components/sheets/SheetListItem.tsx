import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { SheetMeta } from '@/types/sheet'
import { DragHandle } from './DragHandle'

interface SheetListItemProps {
  sheet: SheetMeta
  isEditMode: boolean
  onSheetClick: (id: string) => void
}

export function SheetListItem({
  sheet,
  isEditMode,
  onSheetClick,
}: SheetListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sheet.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleClick = () => {
    if (!isEditMode) {
      onSheetClick(sheet.id)
    }
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
      <div className="flex-1">
        <span className="text-base text-gray-900">{sheet.name}</span>
      </div>
      {isEditMode && (
        <div {...attributes} {...listeners}>
          <DragHandle isDragging={isDragging} />
        </div>
      )}
    </div>
  )
}
