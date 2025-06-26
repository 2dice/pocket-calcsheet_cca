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
const KNOWN_WARNINGS: string[] = [
  // 許容する既知の警告を追加予定
  // React Router v7の警告はfuture flagsで解消されるため追加しない
]

const setupConsoleMonitoring = (page: Page) => {
  const consoleErrors: string[] = []
  const consoleWarnings: string[] = []
  const pageErrors: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`Console Error: ${msg.text()}`)
    }
    if (msg.type() === 'warning') {
      const text = msg.text()
      const isKnownWarning = KNOWN_WARNINGS.some(pattern =>
        text.includes(pattern)
      )
      if (!isKnownWarning) {
        consoleWarnings.push(`Console Warning: ${text}`)
      }
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

  test('シート編集機能の包括的な動作確認', async ({ page }) => {
    await page.goto('/')

    // 編集モード開始
    await page.locator('button:has-text("編集")').click()

    // 1. シート追加とインライン編集
    await page.locator('button:has-text("+")').click()
    const input = page.locator('[data-testid="new-sheet-input"]')
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
    await input.fill('テストシート')
    await input.press('Enter')
    await expect(page.locator('text=テストシート')).toBeVisible()

    // 2. 既存シート名の編集
    await page.locator('text=テストシート').click()
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await expect(editInput).toBeVisible()
    await expect(editInput).toBeFocused()
    await editInput.fill('編集後の名前')
    await editInput.press('Enter')
    await expect(page.locator('text=編集後の名前')).toBeVisible()

    // 3. 削除実行
    await page.locator('[data-testid="delete-button"]').click()
    await page.locator('button:has-text("削除")').click()
    await expect(page.locator('text=編集後の名前')).not.toBeVisible()
  })

  test('削除機能の動作確認', async ({ page }) => {
    await page.goto('/')

    // シート追加の準備
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('削除テストシート')
    await input.press('Enter')

    // 削除ダイアログ表示確認
    await page.locator('[data-testid="delete-button"]').click()
    const alertDialog = page.locator('[role="alertdialog"]')
    await expect(alertDialog).toBeVisible()
    await expect(
      page.getByRole('heading', { name: 'シートを削除' })
    ).toBeVisible()

    // 削除実行
    await page.locator('button:has-text("削除")').click()
    await expect(alertDialog).not.toBeVisible()
    await expect(page.locator('text=削除テストシート')).not.toBeVisible()
  })

  test('シート追加後のリロードでデータが維持される @step2-6-2', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('永続化テストシート')
    await input.press('Enter')

    // 編集モードを終了
    const completeButton = page.locator('button:has-text("完了")')
    await completeButton.click()

    // シートが表示されることを確認
    await expect(page.locator('text=永続化テストシート')).toBeVisible()

    // ページをリロード
    await page.reload()

    // リロード後もシートが表示されることを確認
    await expect(page.locator('text=永続化テストシート')).toBeVisible()

    // 編集ボタンが表示されることを確認（ページが正常にロードされている）
    await expect(page.locator('button:has-text("編集")')).toBeVisible()
  })

  test('旧データからのマイグレーション動作 @step2-6-4', async ({ page }) => {
    // 旧形式データをlocalStorageに設定（schemaVersionなし）
    await page.addInitScript(() => {
      const oldData = {
        state: {
          savedAt: '2023-01-01T00:00:00.000Z',
          sheets: [
            {
              id: 'migration-e2e-id',
              name: 'E2Eマイグレーションテスト',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          ],
          entities: {
            'migration-e2e-id': {
              id: 'migration-e2e-id',
              name: 'E2Eマイグレーションテスト',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(oldData))
    })

    // ページをロード（マイグレーション実行）
    await page.goto('/')

    // データが最新形式になっていることを確認
    // マイグレーションされたシートが表示される
    await expect(page.locator('text=E2Eマイグレーションテスト')).toBeVisible()

    // 編集機能が正常動作することを確認
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    // 編集モードで削除ボタンが表示される
    const deleteButton = page.locator('[data-testid="delete-button"]')
    await expect(deleteButton).toBeVisible()

    // 新しいシートを追加できる
    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('新しいシート')
    await input.press('Enter')

    // 新しいシートが追加される
    await expect(page.locator('text=新しいシート')).toBeVisible()

    // 編集モードを終了
    const completeButton = page.locator('button:has-text("完了")')
    await completeButton.click()

    // 両方のシートが表示される
    await expect(page.locator('text=E2Eマイグレーションテスト')).toBeVisible()
    await expect(page.locator('text=新しいシート')).toBeVisible()
  })

  test('Variables タブで8つの変数スロットが表示される @step4-1', async ({
    page,
  }) => {
    await page.goto('/')

    // テスト用のシートを追加
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('変数テストシート')
    await input.press('Enter')
    await page.locator('button:has-text("完了")').click()

    // シートをクリックして詳細画面に遷移
    await page.locator('text=変数テストシート').click()

    // Variablesタブが表示されることを確認
    await expect(page.locator('[data-testid="tab-variables"]')).toBeVisible()

    // Variablesタブをクリック
    await page.locator('[data-testid="tab-variables"]').click()

    // Variable1〜8のラベルが表示されることを確認
    for (let i = 1; i <= 8; i++) {
      await expect(page.locator(`text=Variable${i}`)).toBeVisible()
    }

    // 各スロットに変数名と値の入力フィールドが存在することを確認
    for (let i = 1; i <= 8; i++) {
      await expect(
        page.locator(`[data-testid="variable-name-${i}"]`)
      ).toBeVisible()
      await expect(
        page.locator(`[data-testid="variable-value-${i}"]`)
      ).toBeVisible()
    }
  })

  test('変数名バリデーションが動作する @step4-1', async ({ page }) => {
    await page.goto('/')

    // テスト用のシートを追加
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('バリデーションテストシート')
    await input.press('Enter')
    await page.locator('button:has-text("完了")').click()

    // シートをクリックして詳細画面に遷移
    await page.locator('text=バリデーションテストシート').click()

    // Variablesタブをクリック
    await page.locator('[data-testid="tab-variables"]').click()

    // 1. 日本語の変数名を入力（不正）
    const nameInput1 = page.locator(`[data-testid="variable-name-1"]`)
    await nameInput1.fill('変数名')
    await nameInput1.blur()

    // AlertDialogが表示されることを確認
    await expect(page.locator('[role="alertdialog"]')).toBeVisible()
    await expect(page.getByText('変数名が無効です')).toBeVisible()
    await page.locator('button:has-text("OK")').click()

    // 2. 数字で始まる変数名を入力（不正）
    await nameInput1.fill('1variable')
    await nameInput1.blur()

    // AlertDialogが表示されることを確認
    await expect(page.locator('[role="alertdialog"]')).toBeVisible()
    await page.locator('button:has-text("OK")').click()

    // 3. 有効な変数名を入力
    await nameInput1.fill('validVar')
    await nameInput1.blur()

    // 4. 同じ変数名を別のスロットに入力（重複）
    const nameInput2 = page.locator(`[data-testid="variable-name-2"]`)
    await nameInput2.fill('validVar')
    await nameInput2.blur()

    // 重複エラーのAlertDialogが表示されることを確認
    await expect(page.locator('[role="alertdialog"]')).toBeVisible()
    await expect(page.getByText('重複した変数名です')).toBeVisible()
    await page.locator('button:has-text("OK")').click()
  })
})
