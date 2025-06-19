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

  test('編集モードでシート名をタップするとインライン編集が開始される', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('編集テストシート')
    await input.press('Enter')

    // 追加されたシート名をタップ
    const sheetName = page.locator('text=編集テストシート')
    await sheetName.click()

    // インライン編集が開始される
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await expect(editInput).toBeVisible()
    await expect(editInput).toBeFocused()
    await expect(editInput).toHaveValue('編集テストシート')
  })

  test('Enterキーでシート名編集が完了する', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('Enterテストシート')
    await input.press('Enter')

    // シート名をタップして編集開始
    const sheetName = page.locator('text=Enterテストシート')
    await sheetName.click()

    // 名前を変更してEnterで確定
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await editInput.fill('更新されたシート名')
    await editInput.press('Enter')

    // 編集が完了し、新しい名前が表示される
    await expect(editInput).not.toBeVisible()
    await expect(page.locator('text=更新されたシート名')).toBeVisible()
    await expect(page.locator('text=Enterテストシート')).not.toBeVisible()
  })

  test('別エリアタップでシート名編集が完了する', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('ブラーテストシート')
    await input.press('Enter')

    // シート名をタップして編集開始
    const sheetName = page.locator('text=ブラーテストシート')
    await sheetName.click()

    // 名前を変更
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await editInput.fill('ブラーで更新された名前')

    // 別のエリア（ヘッダー）をタップ
    const header = page.locator('h1:has-text("ぽけっと計算表")')
    await header.click()

    // 編集が完了し、新しい名前が表示される
    await expect(editInput).not.toBeVisible()
    await expect(page.locator('text=ブラーで更新された名前')).toBeVisible()
    await expect(page.locator('text=ブラーテストシート')).not.toBeVisible()
  })

  test('空欄確定時にAlertDialogが表示される', async ({ page }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('空欄テストシート')
    await input.press('Enter')

    // シート名をタップして編集開始
    const sheetName = page.locator('text=空欄テストシート')
    await sheetName.click()

    // 名前を空欄にしてEnterで確定
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await editInput.fill('')
    await editInput.press('Enter')

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

    // 元の名前が復元される
    await expect(page.locator('text=空欄テストシート')).toBeVisible()
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
})

test.describe('localStorage永続化E2Eテスト @step2-6', () => {
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

  test('シート追加後にページリロードしてもデータが保持される', async ({
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

    // シートが追加されたことを確認
    await expect(page.locator('text=永続化テストシート')).toBeVisible()

    // ページをリロード
    await page.reload()

    // リロード後もシートが存在することを確認
    await expect(page.locator('text=永続化テストシート')).toBeVisible()
  })

  test('複数シートの追加・編集・削除がページリロード後も反映される', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')

    // 3つのシートを追加
    for (let i = 1; i <= 3; i++) {
      await addButton.click()
      const input = page.locator('[data-testid="new-sheet-input"]')
      await input.fill(`永続化シート${i}`)
      await input.press('Enter')
    }

    // 2番目のシート名を編集
    const secondSheet = page.locator('text=永続化シート2')
    await secondSheet.click()
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await editInput.fill('編集されたシート2')
    await editInput.press('Enter')

    // 3番目のシートを削除
    const deleteButtons = page.locator('[data-testid="delete-button"]')
    await deleteButtons.nth(2).click() // 3番目のシート
    const confirmButton = page.locator('button:has-text("削除")')
    await confirmButton.click()

    // 現在の状態を確認
    await expect(page.locator('text=永続化シート1')).toBeVisible()
    await expect(page.locator('text=編集されたシート2')).toBeVisible()
    await expect(page.locator('text=永続化シート3')).not.toBeVisible()

    // ページをリロード
    await page.reload()

    // リロード後も変更が保持されていることを確認
    await expect(page.locator('text=永続化シート1')).toBeVisible()
    await expect(page.locator('text=編集されたシート2')).toBeVisible()
    await expect(page.locator('text=永続化シート3')).not.toBeVisible()
  })

  test('シートの順序変更がページリロード後も保持される', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入って複数シートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')

    // 3つのシートを順番に追加
    for (let i = 1; i <= 3; i++) {
      await addButton.click()
      const input = page.locator('[data-testid="new-sheet-input"]')
      await input.fill(`順序テストシート${i}`)
      await input.press('Enter')
    }

    // 初期順序を確認
    const sheetItems = page.locator('[data-testid="sheet-item"]')
    await expect(sheetItems.nth(0)).toContainText('順序テストシート1')
    await expect(sheetItems.nth(1)).toContainText('順序テストシート2')
    await expect(sheetItems.nth(2)).toContainText('順序テストシート3')

    // ドラッグ&ドロップで順序を変更（1番目を3番目の位置に移動）
    const dragHandles = page.locator('[data-testid="drag-handle"]')
    const firstDragHandle = dragHandles.nth(0)
    const thirdSheetItem = sheetItems.nth(2)

    // 長押しでドラッグを開始（delay: 300msを考慮）
    await firstDragHandle.hover()
    await page.mouse.down()
    await page.waitForTimeout(350) // delay + α

    // 3番目の位置にドロップ
    await thirdSheetItem.hover()
    await page.mouse.up()

    // 順序が変更されたことを確認
    await expect(sheetItems.nth(0)).toContainText('順序テストシート2')
    await expect(sheetItems.nth(1)).toContainText('順序テストシート3')
    await expect(sheetItems.nth(2)).toContainText('順序テストシート1')

    // ページをリロード
    await page.reload()

    // リロード後も順序変更が保持されていることを確認
    const reloadedSheetItems = page.locator('[data-testid="sheet-item"]')
    await expect(reloadedSheetItems.nth(0)).toContainText('順序テストシート2')
    await expect(reloadedSheetItems.nth(1)).toContainText('順序テストシート3')
    await expect(reloadedSheetItems.nth(2)).toContainText('順序テストシート1')
  })

  test('ブラウザの戻る/進むボタンでもデータが保持される', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('ナビゲーションテストシート')
    await input.press('Enter')

    // シートが追加されたことを確認
    await expect(page.locator('text=ナビゲーションテストシート')).toBeVisible()

    // 別のページに移動（例：about:blank）
    await page.goto('about:blank')

    // 戻るボタンでアプリに戻る
    await page.goBack()

    // データが保持されていることを確認
    await expect(page.locator('text=ナビゲーションテストシート')).toBeVisible()
  })

  test('新しいタブで開いても同じデータが読み込まれる', async ({
    page,
    context,
  }) => {
    await page.goto('/')

    // 編集モードに入ってシートを追加
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('新しいタブテストシート')
    await input.press('Enter')

    // シートが追加されたことを確認
    await expect(page.locator('text=新しいタブテストシート')).toBeVisible()

    // 新しいタブを開く
    const newPage = await context.newPage()
    const newPageMonitor = setupConsoleMonitoring(newPage)

    await newPage.goto('/')

    // 新しいタブでも同じデータが読み込まれることを確認
    await expect(newPage.locator('text=新しいタブテストシート')).toBeVisible()

    // 新しいタブでもエラーがないことを確認
    const newPageErrors = newPageMonitor.getAllErrors()
    expect(newPageErrors).toHaveLength(0)

    await newPage.close()
  })
})
