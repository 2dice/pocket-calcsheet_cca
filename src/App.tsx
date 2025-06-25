import { useEffect } from 'react'
import { TopPage } from '@/pages/TopPage'
import { StorageManager } from '@/utils/storage/storageManager'
import { useSheetsStore } from '@/store/sheetsStore'

function App() {
  const { setPersistenceError } = useSheetsStore()

  useEffect(() => {
    // 永続化ストレージをリクエスト
    const requestPersistentStorage = async () => {
      try {
        const isPersisted = await StorageManager.requestPersistentStorage()

        // 永続化に失敗した場合はエラーダイアログを表示
        if (!isPersisted) {
          setPersistenceError(true)
        }
      } catch (error) {
        console.error('Failed to request persistent storage:', error)
        setPersistenceError(true)
      }
    }

    void requestPersistentStorage()
  }, [setPersistenceError])

  return <TopPage />
}

export default App
