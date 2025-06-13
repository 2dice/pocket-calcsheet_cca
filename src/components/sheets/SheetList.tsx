interface SheetMeta {
  id: string
  name: string
  order: number
  createdAt: string
  updatedAt: string
}

interface SheetListProps {
  sheets: SheetMeta[]
}

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
          <div className="border-t border-gray-200 h-12 bg-white" />
          <div className="border-t border-gray-200 h-12 bg-white" />
          <div className="border-t border-gray-200 h-12 bg-white" />
          <div className="border-t border-b border-gray-200 h-12 bg-white" />
        </div>
      ) : (
        <div className="space-y-0">
          {sheets.map(sheet => (
            <div
              key={sheet.id}
              className="border-t border-gray-200 h-12 flex items-center px-4 bg-white hover:bg-gray-50"
            >
              <span className="text-base text-gray-900">{sheet.name}</span>
            </div>
          ))}
          <div className="border-t border-b border-gray-200 h-0" />
        </div>
      )}
    </div>
  )
}
