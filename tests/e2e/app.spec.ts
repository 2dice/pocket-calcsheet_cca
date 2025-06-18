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

    // 入力フィールドが再び表示される
    await expect(input).toBeVisible()
    // Note: フォーカス動作はsetTimeout削除により変更されたため、E2Eテストでは確認しない
  })

  test('編集モード時にドラッグハンドルが表示される', async ({ page }) => {
    await page.goto('/')

    // シートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('テスト用シート')
    await input.press('Enter')

    // ドラッグハンドルが表示されることを確認
    const dragHandle = page.locator('[data-testid="drag-handle"]')
    await expect(dragHandle).toBeVisible()

    // 完了ボタンをクリックして編集モードを終了
    const completeButton = page.locator('button:has-text("完了")')
    await completeButton.click()

    // 通常モードではドラッグハンドルが表示されない
    await expect(dragHandle).not.toBeVisible()
  })

  test('複数シートでのドラッグハンドル表示', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    // 複数のシートを追加
    const addButton = page.locator('button:has-text("+")')

    // 1つ目のシート
    await addButton.click()
    let input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('シート1')
    await input.press('Enter')

    // 2つ目のシート
    await addButton.click()
    input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('シート2')
    await input.press('Enter')

    // すべてのシートにドラッグハンドルが表示される
    const dragHandles = page.locator('[data-testid="drag-handle"]')
    await expect(dragHandles).toHaveCount(2)

    // 各ドラッグハンドルが表示されている
    await expect(dragHandles.nth(0)).toBeVisible()
    await expect(dragHandles.nth(1)).toBeVisible()
  })

  test('編集モード時に削除ボタンが表示される', async ({ page }) => {
    await page.goto('/')

    // シートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('削除テスト用シート')
    await input.press('Enter')

    // 削除ボタンが表示されることを確認
    const deleteButton = page.locator('[data-testid="delete-button"]')
    await expect(deleteButton).toBeVisible()

    // 完了ボタンをクリックして編集モードを終了
    const completeButton = page.locator('button:has-text("完了")')
    await completeButton.click()

    // 通常モードでは削除ボタンが表示されない
    await expect(deleteButton).not.toBeVisible()
  })

  test('削除ボタンクリックでAlertDialogが表示される', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('削除対象シート')
    await input.press('Enter')

    // 削除ボタンをクリック
    const deleteButton = page.locator('[data-testid="delete-button"]')
    await deleteButton.click()

    // AlertDialogが表示される
    const alertDialog = page.locator('[role="alertdialog"]')
    await expect(alertDialog).toBeVisible()

    // AlertDialogのタイトルを確認
    await expect(
      page.getByRole('heading', { name: 'シートを削除' })
    ).toBeVisible()

    // 説明文を確認
    await expect(
      page.getByText(
        '"削除対象シート"を削除してもよろしいですか？この操作は取り消せません。'
      )
    ).toBeVisible()
  })

  test('削除ダイアログでキャンセルを選択すると削除されない', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('キャンセルテストシート')
    await input.press('Enter')

    // 削除ボタンをクリック
    const deleteButton = page.locator('[data-testid="delete-button"]')
    await deleteButton.click()

    // キャンセルボタンをクリック
    const cancelButton = page.locator('button:has-text("キャンセル")')
    await cancelButton.click()

    // AlertDialogが非表示になる
    const alertDialog = page.locator('[role="alertdialog"]')
    await expect(alertDialog).not.toBeVisible()

    // シートがまだ存在することを確認
    await expect(page.locator('text=キャンセルテストシート')).toBeVisible()
  })

  test('削除ダイアログで削除を選択するとシートが削除される', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('削除実行テストシート')
    await input.press('Enter')

    // 削除ボタンをクリック
    const deleteButton = page.locator('[data-testid="delete-button"]')
    await deleteButton.click()

    // 削除ボタンをクリック
    const confirmButton = page.locator('button:has-text("削除")')
    await confirmButton.click()

    // AlertDialogが非表示になる
    const alertDialog = page.locator('[role="alertdialog"]')
    await expect(alertDialog).not.toBeVisible()

    // シートが削除されて存在しないことを確認
    await expect(page.locator('text=削除実行テストシート')).not.toBeVisible()
  })

  test('複数シートがある場合の削除動作', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')

    // 3つのシートを追加
    for (let i = 1; i <= 3; i++) {
      await addButton.click()
      const input = page.locator('[data-testid="new-sheet-input"]')
      await input.fill(`シート${i}`)
      await input.press('Enter')
    }

    // すべてのシートが表示されることを確認
    await expect(page.locator('text=シート1')).toBeVisible()
    await expect(page.locator('text=シート2')).toBeVisible()
    await expect(page.locator('text=シート3')).toBeVisible()

    // 2番目のシートを削除
    const deleteButtons = page.locator('[data-testid="delete-button"]')
    await deleteButtons.nth(1).click()

    const confirmButton = page.locator('button:has-text("削除")')
    await confirmButton.click()

    // 2番目のシートが削除され、1番目と3番目が残る
    await expect(page.locator('text=シート1')).toBeVisible()
    await expect(page.locator('text=シート2')).not.toBeVisible()
    await expect(page.locator('text=シート3')).toBeVisible()

    // 削除後も残りのシートに削除ボタンが表示される
    const remainingDeleteButtons = page.locator('[data-testid="delete-button"]')
    await expect(remainingDeleteButtons).toHaveCount(2)
  })
})
