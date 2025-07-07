import { useEffect, useRef, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Textarea } from '@/components/ui/textarea'
import { ExpressionRenderer } from '@/components/calculator/ExpressionRenderer'
import { useSheetsStore } from '@/store'

export function OverviewTab() {
  const { id } = useParams<{ id: string }>()
  const { entities, updateOverviewData, initializeSheet } = useSheetsStore()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const sheet = useMemo(() => entities[id || ''], [entities, id])

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
          data-testid="overview-textarea"
          aria-label="この計算表の説明を入力してください"
          defaultValue={sheet.overviewData.description}
          onBlur={handleBlur}
          className="mt-1 min-h-[200px] resize-none"
          placeholder="この計算表の説明を入力してください..."
        />
      </div>

      {/* Formula表示エリア */}
      {sheet.formulaData?.inputExpr && (
        <div className="mt-6">
          <label className="text-sm font-medium">Formula</label>
          <div
            data-testid="formula-display"
            className="mt-1 p-3 bg-gray-50 rounded-md border"
          >
            <ExpressionRenderer expression={sheet.formulaData.inputExpr} />
          </div>
        </div>
      )}
    </div>
  )
}
