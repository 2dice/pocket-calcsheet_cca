import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { useSheetsStore } from '@/store'

export function OverviewTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateOverviewData, initializeSheet } = useSheetsStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sheet = entities[id || '']

  useEffect(() => {
    if (id && sheet && !sheet.overviewData) {
      initializeSheet(id)
    }
  }, [id, sheet, initializeSheet])

  const handleBlur = () => {
    if (id && textareaRef.current) {
      updateOverviewData(id, { description: textareaRef.current.value })
    }
  }

  if (!sheet) {
    return (
      <div className="p-4">
        <div className="text-gray-600">シートが見つかりません。</div>
      </div>
    )
  }

  if (!sheet.overviewData) {
    return (
      <div className="p-4">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="p-4 pb-safe h-full overflow-y-auto">
      <div>
        <label className="text-sm font-medium">Overview</label>
        <Textarea
          ref={textareaRef}
          defaultValue={sheet.overviewData.description}
          onBlur={handleBlur}
          className="mt-1 min-h-[200px] resize-none"
          placeholder="数式の用途や変数の説明など、このシートの概要を記入してください..."
        />
      </div>
    </div>
  )
}
