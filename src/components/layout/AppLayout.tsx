import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'
import type { SheetMeta } from '@/types/sheet'
import type { TabType } from '@/utils/constants/routes'

interface AppLayoutProps {
  sheet: SheetMeta
  onBack: () => void
  onTabChange: (tab: TabType) => void
  children: ReactNode
}

export function AppLayout({
  sheet,
  onBack,
  onTabChange,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header sheet={sheet} onBack={onBack} />

      <main className="flex-1 overflow-auto pb-16">{children}</main>

      <TabBar onTabChange={onTabChange} />
    </div>
  )
}
