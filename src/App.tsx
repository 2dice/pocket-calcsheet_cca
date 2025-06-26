import { useEffect } from 'react'
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useParams,
  useNavigate,
} from 'react-router-dom'
import { TopPage } from '@/pages/TopPage'
import { OverviewTab } from '@/pages/OverviewTab'
import { VariablesTab } from '@/pages/VariablesTab'
import { FormulaTab } from '@/pages/FormulaTab'
import { AppLayout } from '@/components/layout/AppLayout'
import { StorageManager } from '@/utils/storage/storageManager'
import { useSheetsStore } from '@/store/sheetsStore'
import { validateTabParam, VALID_TABS } from '@/utils/constants/routes'
import type { TabType } from '@/utils/constants/routes'

// シート詳細ページコンポーネント
function SheetDetailPage() {
  const { id, tab } = useParams<{ id: string; tab: string }>()
  const { sheets } = useSheetsStore()
  const navigate = useNavigate()

  const sheet = sheets.find(s => s.id === id)
  const validatedTab = validateTabParam(tab)

  // バリデーションとリダイレクト
  useEffect(() => {
    if (!sheet) {
      // 存在しないシートIDの場合はトップページにリダイレクト
      navigate('/', { replace: true })
      return
    }

    if (!VALID_TABS.includes(tab as TabType)) {
      // 不正なタブ名の場合はoverviewにリダイレクト
      navigate(`/${id}/overview`, { replace: true })
      return
    }
  }, [sheet, tab, id, navigate])

  if (!sheet) {
    return null
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleTabChange = (newTab: TabType) => {
    navigate(`/${id}/${newTab}`)
  }

  return (
    <AppLayout sheet={sheet} onBack={handleBack} onTabChange={handleTabChange}>
      {validatedTab === 'overview' && <OverviewTab />}
      {validatedTab === 'variables' && <VariablesTab />}
      {validatedTab === 'formula' && <FormulaTab />}
    </AppLayout>
  )
}

// 永続化ストレージリクエスト用のフック
function usePersistentStorage() {
  const { setPersistenceError } = useSheetsStore()

  useEffect(() => {
    const requestPersistentStorage = async () => {
      // 既に表示済みの場合はスキップ
      if (sessionStorage.getItem('persistenceErrorShown')) {
        return
      }

      try {
        const isPersisted = await StorageManager.requestPersistentStorage()

        // 本番環境のみダイアログを表示（開発・CI環境では非表示）
        if (!isPersisted && import.meta.env.PROD) {
          setPersistenceError(true)
          sessionStorage.setItem('persistenceErrorShown', 'true')
        }
      } catch (error) {
        console.log('Failed to request persistent storage:', error)
        // 本番環境のみダイアログを表示
        if (import.meta.env.PROD) {
          setPersistenceError(true)
          sessionStorage.setItem('persistenceErrorShown', 'true')
        }
      }
    }

    void requestPersistentStorage()
  }, [setPersistenceError])
}

// アプリのルートコンポーネント
function AppRoutes() {
  // 永続化ストレージのリクエスト
  usePersistentStorage()

  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="/:id/:tab" element={<SheetDetailPage />} />
      <Route path="/:id" element={<Navigate to="/:id/overview" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppRoutes />
    </HashRouter>
  )
}

export default App
