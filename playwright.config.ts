import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright設定ファイル - モバイルブラウザE2Eテスト用
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:5173/pocket-calcsheet_cca/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'iPhone 15 Safari',
      use: {
        ...devices['iPhone 15'],
      },
    },
    {
      name: 'Galaxy S9+ Chrome',
      use: {
        ...devices['Galaxy S9+'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/pocket-calcsheet_cca/',
    reuseExistingServer: !process.env['CI'],
    timeout: 120 * 1000,
  },
})
