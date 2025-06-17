import { GripVertical } from 'lucide-react'

interface DragHandleProps {
  isDragging?: boolean
}

export function DragHandle({ isDragging = false }: DragHandleProps) {
  return (
    <div
      data-testid="drag-handle"
      className={`flex items-center justify-center p-2 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50' : 'opacity-70 hover:opacity-100'
      }`}
      style={{ touchAction: 'none' }}
      aria-label="ドラッグして順序を変更"
    >
      <GripVertical className="w-5 h-5 text-gray-400" />
    </div>
  )
}
