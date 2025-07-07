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
    await expect(page.locator('text=300.00 × 10^-6')).toBeVisible()

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

  test('Formula計算が自動実行される @step5-2', async ({ page }) => {
    await page.goto('/')

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('計算テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=計算テスト').click()

    // Variable1に"100"を入力
    await page.locator('[data-testid="tab-variables"]').click()
    const nameInput = page.locator('[data-testid="variable-name-1"]')
    await nameInput.fill('var1')
    await nameInput.blur()

    const valueInput = page.locator('[data-testid="variable-value-1"]')
    await valueInput.click()
    await page.locator('button:has-text("1")').click()
    await page.locator('button:has-text("0")').click()
    await page.locator('button:has-text("0")').click()
    await page.locator('button:has-text("↵")').click()

    // Formulaタブへ遷移
    await page.locator('[data-testid="tab-formula"]').click()

    // "[var1]*2"を入力
    const textarea = page.locator('textarea')
    await textarea.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    await page.locator('[role="dialog"] >> text=var1').click()
    await page.locator('button:has-text("*")').click()
    await page.locator('button:has-text("2")').click()

    // 別エリアクリックで確定
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // 計算結果"200.000000000000000"が表示される
    await expect(page.locator('text=Result')).toBeVisible()
    await expect(page.locator('text=200.000000000000000')).toBeVisible()
  })

  test('計算エラーが表示される @step5-2', async ({ page }) => {
    await page.goto('/')

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('エラーテスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=エラーテスト').click()

    // Formulaタブで"1/0"を入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()
    await page.locator('button:has-text("1")').click()
    await page.locator('button:has-text("/")').click()
    await page.locator('button:has-text("0")').click()

    // 別エリアクリックで確定
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // "Division by Zero"が表示される
    await expect(page.locator('text=Result')).toBeVisible()
    await expect(page.locator('text=Division by Zero')).toBeVisible()
  })

  test('未定義変数使用時にエラーが表示される @step5-2', async ({ page }) => {
    await page.goto('/')

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page
      .locator('[data-testid="new-sheet-input"]')
      .fill('未定義変数テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=未定義変数テスト').click()

    // Formulaタブで未定義変数を参照
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    // 未入力のVariable1を選択
    await page.locator('[role="dialog"] >> text=Variable1').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("1")').click()

    // 別エリアクリックで確定
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // "Undefined Variable"が表示される
    await expect(page.locator('text=Result')).toBeVisible()
    await expect(page.locator('text=Undefined Variable')).toBeVisible()
  })

  test('タブ切り替え時の自動計算確認 @step5-2', async ({ page }) => {
    await page.goto('/')

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('自動計算テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=自動計算テスト').click()

    // 変数を入力
    await page.locator('[data-testid="tab-variables"]').click()
    const nameInput = page.locator('[data-testid="variable-name-1"]')
    await nameInput.fill('pi')
    await nameInput.blur()

    const valueInput = page.locator('[data-testid="variable-value-1"]')
    await valueInput.click()
    await page.locator('button:has-text("3")').click()
    await page.locator('button:has-text(".")').click()
    await page.locator('button:has-text("1")').click()
    await page.locator('button:has-text("4")').click()
    await page.locator('button:has-text("↵")').click()

    // 数式を入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    await page.locator('[role="dialog"] >> text=pi').click()
    await page.locator('button:has-text("*")').click()
    await page.locator('button:has-text("2")').click()

    // 別エリアクリックで確定
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // 計算結果確認（6.28で始まることを確認）
    await expect(
      page.locator('text=Result').locator('..').locator('text=/6\\.28/')
    ).toBeVisible()

    // 他のタブに移動してからFormulaタブに戻る
    await page.locator('[data-testid="tab-variables"]').click()
    await page.locator('[data-testid="tab-formula"]').click()

    // 計算結果が維持されている
    await expect(page.locator('text=Result')).toBeVisible()
    await expect(
      page.locator('text=Result').locator('..').locator('text=/6\\.28/')
    ).toBeVisible()
  })

  test('Overviewタブでテキスト入力ができる @step6-1', async ({ page }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('概要テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=概要テスト').click()

    // Overviewタブへ遷移
    await page.locator('[data-testid="tab-overview"]').click()

    // Overviewラベルが表示される（label要素を特定）
    await expect(page.locator('label:has-text("Overview")')).toBeVisible()

    // textareaが表示される
    const textarea = page.locator('textarea')
    await expect(textarea).toBeVisible()

    // 複数行テキストを入力
    const testText = '計算シートの概要です\nこれは複数行の\n説明文です'
    await textarea.click()
    await textarea.fill(testText)

    // 内容が正しく入力されている
    expect(await textarea.inputValue()).toBe(testText)

    // 別の場所をクリック（onBlur発火）
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // 入力内容が保持される
    expect(await textarea.inputValue()).toBe(testText)

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })

  test('Overview保存と復元が動作する @step6-1', async ({ page }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('保存テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=保存テスト').click()

    // Overviewタブで説明を入力
    await page.locator('[data-testid="tab-overview"]').click()
    const textarea = page.locator('textarea')
    const testDescription =
      'このシートは\n保存と復元を\nテストするためのものです'
    await textarea.click()
    await textarea.fill(testDescription)

    // onBlurで保存実行
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // ページリロード
    await page.reload()

    // 同じシートのOverviewタブに遷移
    await page.locator('text=保存テスト').click()
    await page.locator('[data-testid="tab-overview"]').click()

    // データが復元される
    const restoredTextarea = page.locator('textarea')
    await expect(restoredTextarea).toHaveValue(testDescription)

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })

  test('Overviewタブのプレースホルダー表示確認 @step6-1', async ({ page }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page
      .locator('[data-testid="new-sheet-input"]')
      .fill('プレースホルダーテスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=プレースホルダーテスト').click()

    // Overviewタブへ遷移
    await page.locator('[data-testid="tab-overview"]').click()

    // textareaにプレースホルダーが設定されている
    const textarea = page.locator('textarea')
    await expect(textarea).toHaveAttribute('placeholder')

    // 初期値は空
    expect(await textarea.inputValue()).toBe('')

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })

  test('Formula表示エリアが基本動作する @step6-2', async ({ page }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('数式表示テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=数式表示テスト').click()

    // Formulaタブで数式を入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()
    await page.locator('button:has-text("2")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("3")').click()
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // Overviewタブに遷移
    await page.locator('[data-testid="tab-overview"]').click()

    // Formula表示エリアが表示される
    await expect(
      page
        .locator('[data-testid="formula-display"]')
        .locator('..')
        .locator('label:has-text("Formula")')
    ).toBeVisible()

    // 元の式が表示される（最初のdivで確認）
    await expect(
      page.locator(
        '[data-testid="formula-display"] div.font-mono:has-text("2+3")'
      )
    ).toBeVisible()

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })

  test('関数を含む数式のLaTeX変換表示 @step6-2', async ({ page }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('LaTeXテスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=LaTeXテスト').click()

    // Variablesタブで変数を設定
    await page.locator('[data-testid="tab-variables"]').click()
    const nameInput1 = page.locator('[data-testid="variable-name-1"]')
    await nameInput1.fill('var1')
    await nameInput1.blur()
    const valueInput1 = page.locator('[data-testid="variable-value-1"]')
    await valueInput1.click()
    await page.locator('button:has-text("2")').click()
    await page.locator('button:has-text("↵")').click()

    const nameInput2 = page.locator('[data-testid="variable-name-2"]')
    await nameInput2.fill('var2')
    await nameInput2.blur()
    const valueInput2 = page.locator('[data-testid="variable-value-2"]')
    await valueInput2.click()
    await page.locator('button:has-text("3")').click()
    await page.locator('button:has-text("↵")').click()

    // Formulaタブで関数を含む数式を入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()

    // atan(2*[var1]/[var2])を入力
    await page.locator('button:has-text("f(x)")').click()
    await page.locator('text=atan - アークタンジェント(度)').click()
    await page.locator('button:has-text("2")').click()
    await page.locator('button:has-text("*")').click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    await page.locator('[role="dialog"] >> text=var1').click()
    await page.locator('button:has-text("/")').click()
    await page
      .locator('[data-testid="custom-keyboard"] button:has-text("var")')
      .click()
    await page.locator('[role="dialog"] >> text=var2').click()
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // Overviewタブに遷移してLaTeX表示を確認
    await page.locator('[data-testid="tab-overview"]').click()

    // Formula表示エリアが表示される
    await expect(
      page
        .locator('[data-testid="formula-display"]')
        .locator('..')
        .locator('label:has-text("Formula")')
    ).toBeVisible()

    // 1行目：元の式
    await expect(
      page.locator(
        '[data-testid="formula-display"] div.font-mono:has-text("atan(2*[var1]/[var2])")'
      )
    ).toBeVisible()

    // 3行のLaTeX表示が確認できる（関数を含むため）
    const formulaSection = page.locator('[data-testid="formula-display"]')
    if (await formulaSection.isVisible()) {
      // KaTeX が正常にレンダリングされることを確認
      // math要素（KaTeXが生成）または.katexクラスが存在することを確認
      const mathElements = formulaSection.locator('.katex, math')
      await expect(mathElements.first()).toBeVisible()
    }

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })

  test('関数なしの数式のLaTeX表示（2行目スキップ） @step6-2', async ({
    page,
  }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('関数なしテスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=関数なしテスト').click()

    // Formulaタブで関数を含まない数式を入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()
    await page.locator('button:has-text("2")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("3")').click()
    await page.locator('button:has-text("*")').click()
    await page.locator('button:has-text("4")').click()
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // データの保存を待つ
    await page.waitForTimeout(100)

    // Overviewタブに遷移
    await page.locator('[data-testid="tab-overview"]').click()

    // Formula表示エリアが表示される
    await expect(
      page
        .locator('[data-testid="formula-display"]')
        .locator('..')
        .locator('label:has-text("Formula")')
    ).toBeVisible()

    // 1行目：元の式
    await expect(
      page.locator(
        '[data-testid="formula-display"] div.font-mono:has-text("2+3*4")'
      )
    ).toBeVisible()

    // 関数がないため2行目はスキップされ、2行のみの表示になる
    const formulaSection = page.locator('[data-testid="formula-display"]')
    if (await formulaSection.isVisible()) {
      // ExpressionRendererの子要素（1行目と3行目）をチェック
      const displayLines = formulaSection.locator('> div > div')
      await expect(displayLines).toHaveCount(2) // 1行目と3行目のみ
    }

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })

  test('数式変更時のLaTeX表示更新 @step6-2', async ({ page }) => {
    await page.goto('/')
    const monitor = setupConsoleMonitoring(page)

    // シート作成
    await page.locator('button:has-text("編集")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('[data-testid="new-sheet-input"]').fill('更新テスト')
    await page.locator('[data-testid="new-sheet-input"]').press('Enter')
    await page.locator('button:has-text("完了")').click()
    await page.locator('text=更新テスト').click()

    // 最初は関数なしの数式を入力
    await page.locator('[data-testid="tab-formula"]').click()
    const textarea = page.locator('textarea')
    await textarea.click()
    await page.locator('button:has-text("1")').click()
    await page.locator('button:has-text("+")').click()
    await page.locator('button:has-text("2")').click()
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // Overviewタブで表示確認
    await page.locator('[data-testid="tab-overview"]').click()
    await expect(
      page.locator(
        '[data-testid="formula-display"] div.font-mono:has-text("1+2")'
      )
    ).toBeVisible()

    // 数式を関数ありに変更
    await page.locator('[data-testid="tab-formula"]').click()
    await textarea.click()
    await textarea.fill('') // クリア
    await page.locator('button:has-text("f(x)")').click()
    await page.locator('text=sin - サイン(度)').click()
    await page.locator('button:has-text("3")').click()
    await page.locator('button:has-text("0")').click()
    await page.locator('body').click({ position: { x: 50, y: 50 } })

    // Overviewタブで更新確認
    await page.locator('[data-testid="tab-overview"]').click()
    await expect(
      page.locator(
        '[data-testid="formula-display"] div.font-mono:has-text("sin(30)")'
      )
    ).toBeVisible()

    // LaTeX表示も更新される（関数ありなので3行表示）
    const formulaSection = page.locator('[data-testid="formula-display"]')
    if (await formulaSection.isVisible()) {
      const mathElements = formulaSection.locator('.katex, math')
      await expect(mathElements.first()).toBeVisible()
    }

    // コンソールエラーがないことを確認
    const errors = monitor.getAllErrors()
    expect(errors).toEqual([])
  })
})
