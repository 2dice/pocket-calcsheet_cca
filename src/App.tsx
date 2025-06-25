import { useEffect } from 'react'
import { TopPage } from '@/pages/TopPage'
import { StorageManager } from '@/utils/storage/storageManager'
import { useSheetsStore } from '@/store/sheetsStore'

function App() {
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

  return <TopPage />
}

export default App
