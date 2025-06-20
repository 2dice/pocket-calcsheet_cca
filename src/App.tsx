import { useEffect } from 'react'
import { TopPage } from '@/pages/TopPage'
import { defaultStorageManager } from '@/utils/storage/storageManager'

function App() {
  useEffect(() => {
    // アプリ起動時に永続化ストレージの許可を要求
    const initializeStorage = async () => {
      try {
        const persistent =
          await defaultStorageManager.requestPersistentStorage()
        if (persistent) {
          console.log('Persistent storage granted')
        } else {
          // テスト環境では警告を出さない
          if (process.env.NODE_ENV !== 'test') {
            console.warn(
              'Persistent storage denied - data may be cleared by browser'
            )
          }
        }

        // ストレージ使用量をチェック
        const estimate = await defaultStorageManager.getStorageEstimate()
        if (estimate) {
          console.log(
            `Storage usage: ${(estimate.usage / 1024 / 1024).toFixed(2)} MB / ${(
              estimate.quota /
              1024 /
              1024
            ).toFixed(2)} MB (${estimate.usagePercentage.toFixed(1)}%)`
          )

          // 90%以上使用している場合は警告
          if (estimate.usagePercentage > 90) {
            console.warn(
              'Storage usage is high:',
              estimate.usagePercentage.toFixed(1) + '%'
            )
          }
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
