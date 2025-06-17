import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'

interface UseDragAndDropProps {
  onReorderSheets: (activeId: string, overId: string) => void
  onDragStart?: (activeId: string) => void
  onDragEnd?: (activeId: string, overId: string) => void
}

export function useDragAndDrop({
  onReorderSheets,
  onDragStart,
  onDragEnd,
}: UseDragAndDropProps) {
  // PointerSensorでdelay: 300設定（長押し対応）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    onDragStart?.(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      onDragEnd?.(String(active.id), '')
      return
    }

    onDragEnd?.(String(active.id), String(over.id))
    onReorderSheets(String(active.id), String(over.id))
  }

  return {
    sensors,
    handleDragStart,
    handleDragEnd,
  }
}
