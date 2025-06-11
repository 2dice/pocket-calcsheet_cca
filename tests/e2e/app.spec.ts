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
  let monitor: ReturnType<typeof setupConsoleMonitoring>

  test.beforeEach(({ page }) => {
    // 各テストの前にコンソールエラー/警告検知を設定
    monitor = setupConsoleMonitoring(page)
  })

  test('ページが正常にロードされる', async ({ page }) => {
    await page.goto('/')

    // ページタイトルが存在することを確認
    const title = await page.title()
    expect(title).toBeTruthy()

    // Pocket CalcSheetタイトルが表示されることを確認
    await expect(page.locator('h1:has-text("Pocket CalcSheet")')).toBeVisible()

    // shadcn/ui Buttonが表示されることを確認
    await expect(page.locator('button:has-text("Click me")')).toBeVisible()

    // エラーが発生していないことを確認
    expect(monitor.getAllErrors(), 'コンソールエラー検知').toEqual([])
  })

  test('モバイルビューポートが正しく設定されている', async ({ page }) => {
    await page.goto('/')

    const viewport = page.viewportSize()
    expect(viewport).toBeTruthy()

    // 現実的なモバイルサイズの範囲を設定
    expect(viewport!.width).toBeLessThanOrEqual(500)
    expect(viewport!.width).toBeGreaterThan(300)

    // 高さは幅の1.3倍以上（アスペクト比で確認）
    expect(viewport!.height / viewport!.width).toBeGreaterThan(1.3)

    expect(monitor.getAllErrors(), 'コンソールエラー検知').toEqual([])
  })

  test('基本的なユーザーインタラクションが動作する', async ({ page }) => {
    await page.goto('/')

    // shadcn/ui Buttonが存在することを確認してクリック
    const button = page.locator('button:has-text("Click me")')
    await expect(button).toBeVisible()
    await button.click()

    // クリック後も正常に動作することを確認
    await expect(page.locator('h1:has-text("Pocket CalcSheet")')).toBeVisible()

    // エラーが発生していないことを確認
    expect(monitor.getAllErrors(), 'コンソールエラー検知').toEqual([])
  })
})

test.describe('コンソールエラー検知機能テスト', () => {
  let monitor: ReturnType<typeof setupConsoleMonitoring>

  test.beforeEach(({ page }) => {
    // 各テストの前にコンソールエラー/警告検知を設定
    monitor = setupConsoleMonitoring(page)
  })

  test('意図的なコンソールエラーが検知される', async ({ page }) => {
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
