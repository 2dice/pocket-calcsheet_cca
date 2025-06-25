import type { TabType } from '@/types/sheet'

interface TabConfig {
  id: TabType
  label: string
  icon: string
}

interface TabBarProps {
  currentTab: TabType
  onTabChange: (tab: TabType) => void
}

const tabs: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: '/icons/Overview.png' },
  { id: 'variables', label: 'Variables', icon: '/icons/Variables.png' },
  { id: 'formula', label: 'Formula', icon: '/icons/Formula.png' },
]

export function TabBar({ currentTab, onTabChange }: TabBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex h-16">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-selected={currentTab === tab.id}
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors data-[selected=true]:text-blue-500 data-[selected=false]:text-gray-500 hover:bg-gray-50"
            aria-label={tab.label}
          >
            <img src={tab.icon} alt={tab.label} className="w-6 h-6 mb-1" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
