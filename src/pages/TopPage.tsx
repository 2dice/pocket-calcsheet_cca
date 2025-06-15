import { Button } from '@/components/ui/button'
import { SheetList } from '@/components/sheets/SheetList'
import type { SheetMeta } from '@/types/sheet'

export function TopPage() {
  // 現時点では空配列を渡す（次のステップで状態管理を追加）
  const sheets: SheetMeta[] = []

  return (
    <div data-testid="top-page" className="min-h-svh bg-gray-50">
      {/* ヘッダー */}
      <div className="px-4 py-3 flex items-center justify-between bg-ios-gray-50">
        <div className="flex-1" />
        <h1 className="text-xl font-semibold text-gray-900">ぽけっと計算表</h1>
        <div className="flex-1 flex justify-end">
          <Button
            data-testid="edit-button"
            variant="outline"
            size="sm"
            className="text-ios-blue border-ios-blue hover:bg-ios-blue/10"
            onClick={() => {
              // 編集機能は次のステップで実装
              console.log('編集ボタンがクリックされました')
            }}
          >
            編集
          </Button>
        </div>
      </div>

      {/* リスト部分 */}
      <div className="p-4">
        <SheetList sheets={sheets} />
      </div>
    </div>
  )
}
