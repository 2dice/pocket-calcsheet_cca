import { useEffect } from 'react'
import { TopPage } from '@/pages/TopPage'

function App() {
  useEffect(() => {
    // 永続化ストレージをリクエスト
    const requestPersistentStorage = async () => {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        try {
          const isPersisted = await navigator.storage.persist()
          console.log(isPersisted ? 'Storage persisted' : 'Storage not persisted')
        } catch (error) {
          console.error('Failed to request persistent storage:', error)
        }
      }
    }

    requestPersistentStorage()
  }, [])

  return <TopPage />
}

export default App
