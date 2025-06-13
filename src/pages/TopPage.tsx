import { Button } from '@/components/ui/button'
import { SheetList } from '@/components/sheets/SheetList'

export function TopPage() {
  // 現時点では空配列を渡す（次のステップで状態管理を追加）
  const sheets: Array<{
    id: string
    name: string
    order: number
    createdAt: string
    updatedAt: string
  }> = []

  return (
    <div data-testid="top-page" className="min-h-svh bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">ぽけっと計算表</h1>
        <Button
          data-testid="edit-button"
          variant="outline"
          size="sm"
          onClick={() => {
            // 編集機能は次のステップで実装
            console.log('編集ボタンがクリックされました')
          }}
        >
          編集
        </Button>
      </div>

      {/* リスト部分 */}
      <div className="p-4">
        <SheetList sheets={sheets} />
      </div>
    </div>
  )
}
