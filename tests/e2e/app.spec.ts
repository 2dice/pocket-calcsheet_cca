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

  test.afterEach(() => {
    // 各テスト後に共通でエラーチェック
    const errors = monitor.getAllErrors()
    if (errors.length > 0) {
      throw new Error(
        `コンソールエラー・警告が検出されました: ${errors.join(', ')}`
      )
    }
  })

  test('ページが正常にロードされる', async ({ page }) => {
    await page.goto('/')

    // ページタイトルが存在することを確認
    const title = await page.title()
    expect(title).toBeTruthy()

    // アプリ名「ぽけっと計算表」が表示されることを確認
    await expect(page.locator('h1:has-text("ぽけっと計算表")')).toBeVisible()

    // 編集ボタンが表示されることを確認
    await expect(page.locator('button:has-text("編集")')).toBeVisible()
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
  })

  test('基本的なユーザーインタラクションが動作する', async ({ page }) => {
    await page.goto('/')

    // 編集ボタンが存在することを確認してクリック
    const editButton = page.locator('button:has-text("編集")')
    await expect(editButton).toBeVisible()
    await editButton.click()

    // クリック後も正常に動作することを確認
    await expect(page.locator('h1:has-text("ぽけっと計算表")')).toBeVisible()
  })

  test('編集モードの切り替えが動作する', async ({ page }) => {
    await page.goto('/')

    // 初期状態では編集ボタンが表示される
    const editButton = page.locator('button:has-text("編集")')
    await expect(editButton).toBeVisible()

    // 編集ボタンをクリック
    await editButton.click()

    // 編集モードに切り替わり、完了ボタンが表示される
    const completeButton = page.locator('button:has-text("完了")')
    await expect(completeButton).toBeVisible()

    // 編集モードでは+ボタンが表示される
    const addButton = page.locator('button:has-text("+")')
    await expect(addButton).toBeVisible()

    // 完了ボタンをクリックして編集モードを終了
    await completeButton.click()

    // 編集ボタンが再び表示される
    await expect(editButton).toBeVisible()

    // +ボタンは非表示になる
    await expect(addButton).not.toBeVisible()
  })

  test('シート追加とインライン編集の動作', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    // +ボタンをクリック
    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    // 入力フィールドが表示され、フォーカスが当たる
    const input = page.locator('[data-testid="new-sheet-input"]')
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()

    // 名前を入力
    await input.fill('新しい計算シート')

    // Enterキーで確定
    await input.press('Enter')

    // 入力フィールドが非表示になる
    await expect(input).not.toBeVisible()

    // 新しいシートがリストに表示される
    await expect(page.locator('text=新しい計算シート')).toBeVisible()
  })

  test('空欄確定時のAlertDialog表示', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    // +ボタンをクリック
    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    // 入力フィールドが表示される
    const input = page.locator('[data-testid="new-sheet-input"]')
    await expect(input).toBeVisible()

    // 空欄のままEnterキーで確定を試行
    await input.press('Enter')

    // AlertDialogが表示される
    const alertDialog = page.locator('[role="alertdialog"]')
    await expect(alertDialog).toBeVisible()

    // AlertDialogのタイトルを確認
    await expect(
      page.getByRole('heading', { name: '名前を入力してください' })
    ).toBeVisible()

    // OKボタンをクリックしてダイアログを閉じる
    const okButton = page.locator('button:has-text("OK")')
    await okButton.click()

    // AlertDialogが非表示になる
    await expect(alertDialog).not.toBeVisible()

    // 入力フィールドが再び表示され、フォーカスが当たる
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
  })
})
