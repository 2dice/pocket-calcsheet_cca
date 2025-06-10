import { test, expect, type Page } from '@playwright/test'

/**
 * E2Eテスト - アプリケーション基本動作確認
 * iPhone 15 Safari と Galaxy S9+ Chrome で並列実行
 */

/**
 * コンソールエラー・警告検知の設定
 * page.on('console')でerror/warningタイプを検知
 * page.on('pageerror')で実行時例外を検知
 */
const setupConsoleMonitoring = (page: Page) => {
  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []
  const pageErrors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`Console Error: ${msg.text()}`)
    }
    if (msg.type() === 'warning') {
      consoleWarnings.push(`Console Warning: ${msg.text()}`)
    }
  })

  page.on('pageerror', error => {
    pageErrors.push(`Page Error: ${error.message}`)
  })

  return {
    getConsoleErrors: () => consoleErrors,
    getConsoleWarnings: () => consoleWarnings,
    getPageErrors: () => pageErrors,
    getAllErrors: () => [...consoleErrors, ...consoleWarnings, ...pageErrors],
  }
}

test.describe('アプリケーション基本動作確認', () => {
  test.beforeEach(({ page }) => {
    // 各テストの前にコンソールエラー/警告検知を設定
    const monitor = setupConsoleMonitoring(page)

    // ページ読み込み後にエラーをチェック
    page.on('load', () => {
      const errors = monitor.getAllErrors()
      if (errors.length > 0) {
        console.error('Console errors/warnings detected:', errors)
      }
    })
  })

  test('ページが正常にロードされる', async ({ page }) => {
    const monitor = setupConsoleMonitoring(page)

    await page.goto('/')

    // ページタイトルが存在することを確認
    const title = await page.title()
    expect(title).toBeTruthy()

    // 基本的なReactアプリケーションの要素が存在することを確認
    await expect(page.locator('h1')).toBeVisible()

    // エラーが発生していないことを確認
    const errors = monitor.getAllErrors()
    if (errors.length > 0) {
      console.error('Test failed - Console errors detected:', errors)
      throw new Error(`Console errors/warnings detected: ${errors.join(', ')}`)
    }
  })

  test('モバイルビューポートが正しく設定されている', async ({ page }) => {
    const monitor = setupConsoleMonitoring(page)

    await page.goto('/')

    // ビューポートサイズを取得
    const viewport = page.viewportSize()
    expect(viewport).toBeTruthy()

    // モバイルサイズであることを確認（幅が500px以下、高さが700px以上）
    expect(viewport!.width).toBeLessThanOrEqual(500)
    expect(viewport!.height).toBeGreaterThanOrEqual(700)

    // ポートレートモード（縦長）であることを確認
    expect(viewport!.height).toBeGreaterThan(viewport!.width)

    // エラーが発生していないことを確認
    const errors = monitor.getAllErrors()
    if (errors.length > 0) {
      console.error('Test failed - Console errors detected:', errors)
      throw new Error(`Console errors/warnings detected: ${errors.join(', ')}`)
    }
  })

  test('基本的なユーザーインタラクションが動作する', async ({ page }) => {
    const monitor = setupConsoleMonitoring(page)

    await page.goto('/')

    // ボタンが存在する場合はクリックしてみる
    const button = page.locator('button').first()
    if (await button.isVisible()) {
      await button.click()

      // クリック後も正常に動作することを確認
      await expect(page.locator('h1')).toBeVisible()
    }

    // エラーが発生していないことを確認
    const errors = monitor.getAllErrors()
    if (errors.length > 0) {
      console.error('Test failed - Console errors detected:', errors)
      throw new Error(`Console errors/warnings detected: ${errors.join(', ')}`)
    }
  })
})

test.describe('コンソールエラー検知機能テスト', () => {
  test('意図的なコンソールエラーが検知される', async ({ page }) => {
    const monitor = setupConsoleMonitoring(page)

    await page.goto('/')

    // 意図的にコンソールエラーを発生させる
    await page.evaluate(() => {
      console.error('This is a test error for Playwright console monitoring')
    })

    // エラーが検知されることを確認
    const errors = monitor.getConsoleErrors()
    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0]).toContain(
      'This is a test error for Playwright console monitoring'
    )
  })

  test('意図的なコンソール警告が検知される', async ({ page }) => {
    const monitor = setupConsoleMonitoring(page)

    await page.goto('/')

    // 意図的にコンソール警告を発生させる
    await page.evaluate(() => {
      console.warn('This is a test warning for Playwright console monitoring')
    })

    // 警告が検知されることを確認
    const warnings = monitor.getConsoleWarnings()
    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toContain(
      'This is a test warning for Playwright console monitoring'
    )
  })
})
