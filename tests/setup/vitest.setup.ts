import '@testing-library/jest-dom'
import failOnConsole from 'vitest-fail-on-console'
import { vi } from 'vitest'

// Navigator Storage API のモック
Object.defineProperty(navigator, 'storage', {
  value: {
    persist: vi.fn().mockResolvedValue(true),
    estimate: vi.fn().mockResolvedValue({
      usage: 1024 * 1024, // 1MB
      quota: 100 * 1024 * 1024, // 100MB
    }),
  },
  writable: true,
})

// localStorage のモック
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => {
      return store[key] || null
    },
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
    get length() {
      return Object.keys(store).length
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// vitest-fail-on-consoleの設定
failOnConsole({
  shouldFailOnError: true,
  shouldFailOnWarn: true,
  shouldFailOnLog: false,
  shouldFailOnDebug: false,
})
