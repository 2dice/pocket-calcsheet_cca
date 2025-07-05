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

  test('Variables機能統合テスト @step4', async ({ page }) => {
    await page.goto('/')

    // シート作成（共通セットアップ）
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('変数テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=変数テスト').click()
    await page.locator('[data-testid="tab-variables"]').click()

    // 8スロット確認
    await expect(page.locator('text=Variable8')).toBeVisible()

    // 各スロットに変数名と値の入力フィールドが存在することを確認
    for (let i = 1; i <= 8; i++) {
      await expect(
        page.locator(`[data-testid="variable-name-${i}"]`)
      ).toBeVisible()
      await expect(
        page.locator(`[data-testid="variable-value-${i}"]`)
      ).toBeVisible()
    }

    // バリデーション（日本語）
    const nameInput1 = page.locator('[data-testid="variable-name-1"]')
    await nameInput1.fill('変数')
    await nameInput1.blur()
    await expect(page.locator('[role="alertdialog"]')).toBeVisible()
    await page.locator('button:has-text("OK")').click()

    // 有効な変数名設定
    await nameInput1.fill('x')
    await nameInput1.blur()

    // キーボード表示→入力→計算
    const valueInput1 = page.locator('[data-testid="variable-value-1"]')
    await valueInput1.click()
    await expect(page.locator('[data-testid="custom-keyboard"]')).toBeVisible()

    // 主要なキーが表示されることを確認
    await expect(page.locator('button:has-text("1")')).toBeVisible()
    await expect(page.locator('button:has-text("+")')).toBeVisible()
    await expect(page.locator('button:has-text("BS")')).toBeVisible()
    await expect(page.locator('button:has-text("f(x)")')).toBeVisible()
    await expect(
      page.locator('[data-testid="custom-keyboard"] button:has-text("var")')
    ).toBeVisible()

    // 100を入力
    await page.locator('button:has-text("1")').click()
    await page.locator('button:has-text("0")').click()
    await page.locator('button:has-text("0")').click()
    await page.locator('button:has-text("↵")').click()

    // 計算結果確認
    await expect(page.locator('text=100.00')).toBeVisible()

    // キーボード非表示確認
    const keyboard = page.locator('[data-testid="custom-keyboard"]')
    await expect(keyboard).toHaveClass(/translate-y-full/)
    await expect(keyboard).toHaveAttribute('aria-hidden', 'true')

    // 変数参照計算テスト
    const valueInput2 = page.locator('[data-testid="variable-value-2"]')
    await valueInput2.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    await page.locator('[role="dialog"] >> text=x').click() // 変数選択
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("*")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("2")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("↵")')
      .click()

    // Variable2の計算結果確認
    await expect(page.locator('text=200.00')).toBeVisible()

    // 三角関数計算テスト
    const valueInput3 = page.locator('[data-testid="variable-value-3"]')
    await valueInput3.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("f(x)")')
      .click()
    await page.locator('text=sin - サイン(度)').click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("9")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("0")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("↵")')
      .click()

    // sin(90)=1.00の結果確認
    await expect(page.locator('text=1.00')).toBeVisible()

    // SI接頭語フォーマット確認
    const valueInput4 = page.locator('[data-testid="variable-value-4"]')
    await valueInput4.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("0")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text(".")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("0")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("0")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("0")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("3")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("↵")')
      .click()

    // SI接頭語フォーマット結果確認
    await expect(page.locator('text=300.00×10^-6')).toBeVisible()

    // エラーハンドリング確認
    const valueInput5 = page.locator('[data-testid="variable-value-5"]')
    await valueInput5.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("1")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("/")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("0")')
      .click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("↵")')
      .click()

    // エラー表示確認
    await expect(page.locator('text=Error')).toBeVisible()
  })

  test('Formulaタブで数式入力ができる @step5-1', async ({ page }) => {
    await page.goto('/')

    // シート作成（共通セットアップ）
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('数式テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=数式テスト').click()

    // Formulaタブへ遷移
    await page.locator('[data-testid="tab-formula"]').click()

    // textareaが表示される
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()

    // Formulaラベルが表示される
    await expect(page.locator('label:has-text("Formula")')).toBeVisible()

    // フォーカスでカスタムキーボード表示
    await textarea.click()
    await expect(page.locator('[data-testid="custom-keyboard"]')).toBeVisible()

    // NOTE: アプリ側でdocumentにイベントリスナを登録する際のレースコンディションを
    // 回避するため、意図的に短い待機を入れる
    await page.waitForTimeout(50)

    // 数式入力
    await page.locator('button:has-text("2")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("3")').click()
    await page.locator('button:has-text("*")').click()
    await page.locator('button:has-text("4")').click()

    // Enterで改行
    await page.locator('button:has-text("↵")').click() // Formula用のEnterは改行
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("5")').click()

    // textareaの内容確認（改行を含む）
    const textareaValue = await textarea.inputValue()
    expect(textareaValue).toContain('2+3*4')
    expect(textareaValue).toContain('\n')
    expect(textareaValue).toContain('+5')

    // 別エリアクリックで確定（FormulaInput外の余白エリアをクリック）
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // キーボード非表示確認
    const keyboard = page.locator('[data-testid="custom-keyboard"]')
    await expect(keyboard).toHaveClass(/translate-y-full/)
    await expect(keyboard).toHaveAttribute('aria-hidden', 'true')
  })

  test('Formula+Variables同時保存が動作する @step5-1', async ({ page }) => {
    await page.goto('/')

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('統合テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=統合テスト').click()

    // Variable入力
    await page.locator('[data-testid="tab-variables"]').click()
    const nameInput = page.locator('[data-testid="variable-name-1"]')
    await nameInput.fill('x')
    await nameInput.blur()

    const valueInput = page.locator('[data-testid="variable-value-1"]')
    await valueInput.click()
    await page.locator('button:has-text("1")').click()
    await page.locator('button:has-text("0")').click()
    await page.locator('button:has-text("↵")').click()

    // Formula入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()

    // NOTE: アプリ側でdocumentにイベントリスナを登録する際のレースコンディションを
    // 回避するため、意図的に短い待機を入れる
    await page.waitForTimeout(50)

    // 変数参照を含む数式を入力
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    await page.locator('[role="dialog"] >> text=x').click() // 変数選択
    await page.locator('button:has-text("*")').click()
    await page.locator('button:has-text("2")').click()
    await page.locator('button:has-text("↵")').click() // 改行
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("5")').click()

    // 別エリアクリックで確定（FormulaInput外の余白エリアをクリック）
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // ページリロード
    await page.reload()

    // Variables データが復元される
    await page.locator('[data-testid="tab-variables"]').click()
    await expect(page.locator('[data-testid="variable-name-1"]')).toHaveValue(
      'x'
    )
    await expect(page.locator('text=10.00')).toBeVisible()

    // Formula データが復元される
    await page.locator('[data-testid="tab-formula"]').click()
    const restoredTextarea = page.locator('textarea')
    const restoredValue = await restoredTextarea.inputValue()
    expect(restoredValue).toContain('[x]*2')
    expect(restoredValue).toContain('\n')
    expect(restoredValue).toContain('+5')
  })
})
