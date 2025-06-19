import { useEffect } from 'react'
import { TopPage } from '@/pages/TopPage'
import { defaultStorageManager } from '@/utils/storage/storageManager'

function App() {
  useEffect(() => {
    // アプリ起動時に永続化ストレージの許可を要求
    const initializeStorage = async () => {
      try {
        const persistent = await defaultStorageManager.requestPersistentStorage()
        if (persistent) {
          console.log('Persistent storage granted')
        } else {
          console.warn('Persistent storage denied - data may be cleared by browser')
        }

        // ストレージ使用量をログ出力（デバッグ用）
        const estimate = await defaultStorageManager.getStorageEstimate()
        if (estimate) {
          console.log(
            `Storage usage: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB / ${(
              estimate.quota / 1024 / 1024
            ).toFixed(2)} MB (${estimate.usagePercentage.toFixed(1)}%)`
          )
        }
      } catch (error) {
        console.error('Failed to initialize storage:', error)
      }
    }

    void initializeStorage()
  }, [])

  return <TopPage />
}

export default App
