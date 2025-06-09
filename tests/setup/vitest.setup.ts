import '@testing-library/jest-dom'

// vitest-fail-on-consoleの設定をカスタマイズ
import { beforeEach, afterEach } from 'vitest'

let originalError: typeof console.error
let originalWarn: typeof console.warn

beforeEach(() => {
  originalError = console.error
  originalWarn = console.warn

  console.error = (...args: unknown[]) => {
    originalError(...args)
    throw new Error(`Console error was called: ${args.join(' ')}`)
  }

  console.warn = (...args: unknown[]) => {
    originalWarn(...args)
    throw new Error(`Console warning was called: ${args.join(' ')}`)
  }
})

afterEach(() => {
  console.error = originalError
  console.warn = originalWarn
})
