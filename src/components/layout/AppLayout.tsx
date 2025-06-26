import type { ReactNode } from 'react'
import { Header } from './Header'
import { TabBar } from './TabBar'
import type { SheetMeta, TabType } from '@/types/sheet'

interface AppLayoutProps {
  sheet: SheetMeta
  currentTab: TabType
  onBack: () => void
  onTabChange: (tab: TabType) => void
  children: ReactNode
}

export function AppLayout({
  sheet,
  currentTab,
  onBack,
  onTabChange,
  children,
}: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header sheet={sheet} onBack={onBack} />

      <main className="flex-1 overflow-auto pb-16">{children}</main>

      <TabBar currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  )
}
