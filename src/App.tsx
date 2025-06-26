import { useEffect } from 'react'
import { TopPage } from '@/pages/TopPage'
import { OverviewTab } from '@/pages/OverviewTab'
import { VariablesTab } from '@/pages/VariablesTab'
import { FormulaTab } from '@/pages/FormulaTab'
import { AppLayout } from '@/components/layout/AppLayout'
import { StorageManager } from '@/utils/storage/storageManager'
import { useSheetsStore } from '@/store/sheetsStore'
import { useUIStore } from '@/store/uiStore'

function App() {
  const { setPersistenceError, sheets } = useSheetsStore()
  const { currentSheetId, currentTab, setCurrentSheetId, setCurrentTab } =
    useUIStore()

  // 指定されたシートが存在しない場合はトップページに戻る
  const currentSheet = sheets.find(sheet => sheet.id === currentSheetId)

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
    // クリーンアップ関数は不要（副作用がないため）
  }, [setPersistenceError])

  useEffect(() => {
    // マウント状態を追跡
    let isMounted = true

    if (currentSheetId && !currentSheet && isMounted) {
      setCurrentSheetId(null)
    }

    return () => {
      isMounted = false
    }
  }, [currentSheetId, currentSheet, setCurrentSheetId])

  // エラーハンドリングの明示化
  if (currentSheetId && !currentSheet) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <p className="text-gray-600">シートが見つかりません</p>
      </div>
    )
  }

  // トップページ表示の場合
  if (!currentSheetId || !currentSheet) {
    return <TopPage />
  }

  const handleBack = () => {
    setCurrentSheetId(null)
    setCurrentTab('overview') // タブをリセット
  }

  const handleTabChange = (tab: typeof currentTab) => {
    setCurrentTab(tab)
  }

  return (
    <AppLayout
      sheet={currentSheet}
      currentTab={currentTab}
      onBack={handleBack}
      onTabChange={handleTabChange}
    >
      {currentTab === 'overview' && <OverviewTab />}
      {currentTab === 'variables' && <VariablesTab />}
      {currentTab === 'formula' && <FormulaTab />}
    </AppLayout>
  )
}

export default App
