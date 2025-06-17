import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'

interface UseDragAndDropProps {
  onReorderSheets: (activeId: string, overId: string) => void
}

export function useDragAndDrop({ onReorderSheets }: UseDragAndDropProps) {
  // PointerSensorでdelay: 300設定（長押し対応）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 300,
        tolerance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    onReorderSheets(String(active.id), String(over.id))
  }

  return {
    sensors,
    handleDragEnd,
  }
}
