import { ChevronLeft } from 'lucide-react'
import type { SheetMeta } from '@/types/sheet'

interface HeaderProps {
  sheet: SheetMeta
  onBack: () => void
}

export function Header({ sheet, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 safe-area-top">
      <div className="flex items-center px-4 h-12">
        <button
          onClick={onBack}
          className="absolute left-4 flex items-center justify-center min-h-11 min-w-11 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
          aria-label="戻る"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="flex-1 text-lg font-medium text-gray-900 text-center">
          {sheet.name}
        </h1>
      </div>
    </header>
  )
}
