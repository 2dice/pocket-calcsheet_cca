import { useParams } from 'react-router-dom'
import type { TabType } from '@/utils/constants/routes'
import { validateTabParam } from '@/utils/constants/routes'

interface TabConfig {
  id: TabType
  label: string
  icon: string
}

interface TabBarProps {
  onTabChange: (tab: TabType) => void
}

const tabs: TabConfig[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: `${import.meta.env.BASE_URL}icons/Overview.png`,
  },
  {
    id: 'variables',
    label: 'Variables',
    icon: `${import.meta.env.BASE_URL}icons/Variables.png`,
  },
  {
    id: 'formula',
    label: 'Formula',
    icon: `${import.meta.env.BASE_URL}icons/Formula.png`,
  },
]

export function TabBar({ onTabChange }: TabBarProps) {
  const { tab } = useParams<{ id: string; tab: string }>()
  const currentTab = validateTabParam(tab)
  return (
    <div className="fixed left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom-fixed">
      <div className="flex h-16">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            data-testid={`tab-${tab.id}`}
            data-selected={currentTab === tab.id}
            aria-selected={currentTab === tab.id}
            role="tab"
            className="flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors data-[selected=true]:text-blue-500 data-[selected=true]:bg-blue-50 data-[selected=false]:text-gray-500 hover:bg-gray-50"
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
