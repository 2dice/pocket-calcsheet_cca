import type { SheetMeta } from '@/types/sheet'
import { ChevronRight } from 'lucide-react'

interface SheetListProps {
  sheets: SheetMeta[]
}

// iOS風のセパレーターコンポーネント
const IOSSeparator = () => (
  <div className="flex">
    <div className="w-4 bg-gray-50" />
    <div className="flex-1 border-t border-gray-200" />
  </div>
)

export function SheetList({ sheets }: SheetListProps) {
  return (
    <div data-testid="sheet-list" className="w-full max-w-md mx-auto">
      {sheets.length === 0 ? (
        <div data-testid="empty-list-indicator" className="space-y-0">
          {/* 空のリスト状態でも横線を表示してリストであることを示す */}
          <div className="border-t border-gray-200 h-12 flex items-center px-4 bg-white">
            <span className="text-gray-500 text-sm">
              計算シートがありません
            </span>
          </div>
          {/* レスポンシブ対応の空リスト罫線 */}
          {Array.from({ length: 4 }).map((_, index) => (
            <IOSSeparator key={index} />
          ))}
          <div className="h-12 bg-white" />
        </div>
      ) : (
        <div className="space-y-0">
          {sheets.map((sheet, index) => (
            <div key={sheet.id}>
              <div className="border-t border-gray-200 h-12 flex items-center px-4 bg-white hover:bg-gray-50">
                <div className="flex items-center justify-between w-full">
                  <span className="text-base text-gray-900">{sheet.name}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {/* 最後の要素以外にセパレーターを追加 */}
              {index < sheets.length - 1 && <IOSSeparator />}
            </div>
          ))}
          <div className="border-b border-gray-200 h-0" />
        </div>
      )}
    </div>
  )
}
