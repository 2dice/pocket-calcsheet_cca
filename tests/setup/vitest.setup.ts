import '@testing-library/jest-dom'
import failOnConsole from 'vitest-fail-on-console'

// vitest-fail-on-consoleの設定
failOnConsole({
  shouldFailOnError: true,
  shouldFailOnWarn: true,
  shouldFailOnLog: false,
  shouldFailOnDebug: false,
})
