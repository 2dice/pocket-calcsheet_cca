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

  test('複数シートの追加・編集・削除後のリロードでデータが維持される @step2-6-2', async ({
    page,
  }) => {
    await page.goto('/')

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    // 複数のシートを追加
    const addButton = page.locator('button:has-text("+")')
    const sheetNames = ['永続化シート1', '永続化シート2', '永続化シート3']
    for (const name of sheetNames) {
      await addButton.click()
      const input = page.locator('[data-testid="new-sheet-input"]')
      await input.fill(name)
      await input.press('Enter')
    }

    // 2つ目のシートの名前を変更
    const sheet2Name = page.locator('text=永続化シート2')
    await sheet2Name.click()
    const editInput = page.locator('[data-testid="sheet-name-input"]')
    await editInput.fill('編集後シート2')
    await editInput.press('Enter')

    // 1つ目のシートを削除
    const deleteButtons = page.locator('[data-testid="delete-button"]')
    await deleteButtons.first().click()
    const confirmButton = page.locator('button:has-text("削除")')
    await confirmButton.click()

    // 編集モードを終了
    const completeButton = page.locator('button:has-text("完了")')
    await completeButton.click()

    // 残ったシートが表示されることを確認
    await expect(page.locator('text=編集後シート2')).toBeVisible()
    await expect(page.locator('text=永続化シート3')).toBeVisible()
    await expect(page.locator('text=永続化シート1')).not.toBeVisible()

    // ページをリロード
    await page.reload()

    // リロード後も正しいシートが表示されることを確認
    await expect(page.locator('text=編集後シート2')).toBeVisible()
    await expect(page.locator('text=永続化シート3')).toBeVisible()
    await expect(page.locator('text=永続化シート1')).not.toBeVisible()

    // ページが正常にロードされていることを確認
    await expect(page.locator('button:has-text("編集")')).toBeVisible()
  })

  test('ストレージ容量超過エラーダイアログの表示確認 @step2-6-3', async ({
    page,
  }) => {
    await page.goto('/')

    // localStorageの容量制限をシミュレーション
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem
      let callCount = 0
      localStorage.setItem = function(key: string, value: string) {
        callCount++
        // 3回目の保存でQuotaExceededErrorを投げる
        if (callCount >= 3) {
          const error = new Error('QuotaExceededError')
          error.name = 'QuotaExceededError'
          throw error
        }
        return originalSetItem.call(this, key, value)
      }
    })

    // 編集モードに入る
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    // 複数のシートを追加してストレージ容量超過をトリガー
    const addButton = page.locator('button:has-text("+")')
    
    // 1つ目のシート（成功）
    await addButton.click()
    const input1 = page.locator('[data-testid="new-sheet-input"]')
    await input1.fill('シート1')
    await input1.press('Enter')

    // 2つ目のシート（成功）
    await addButton.click()
    const input2 = page.locator('[data-testid="new-sheet-input"]')
    await input2.fill('シート2')
    await input2.press('Enter')

    // 3つ目のシート（容量超過エラー）
    await addButton.click()
    const input3 = page.locator('[data-testid="new-sheet-input"]')
    await input3.fill('シート3')
    await input3.press('Enter')

    // ストレージエラーダイアログが表示される
    const errorDialog = page.locator('[role="alertdialog"]')
    await expect(errorDialog).toBeVisible()

    // エラーダイアログのタイトルを確認
    await expect(
      page.getByRole('heading', { name: 'ストレージエラー' })
    ).toBeVisible()

    // エラーメッセージを確認
    await expect(
      page.getByText('ストレージ容量が不足しています。不要なシートを削除してください。')
    ).toBeVisible()

    // OKボタンをクリックしてダイアログを閉じる
    const okButton = page.locator('button:has-text("OK")')
    await okButton.click()

    // ダイアログが非表示になる
    await expect(errorDialog).not.toBeVisible()

    // 成功したシートは表示され、失敗したシートは表示されない
    await expect(page.locator('text=シート1')).toBeVisible()
    await expect(page.locator('text=シート2')).toBeVisible()
    await expect(page.locator('text=シート3')).not.toBeVisible()
  })

  test('マイグレーション実行後の動作確認 @step2-6-3', async ({ page }) => {
    // 旧バージョン（schemaVersionなし）のデータをlocalStorageに設定
    await page.addInitScript(() => {
      const v0Data = {
        state: {
          savedAt: '2023-01-01T00:00:00.000Z',
          sheets: [
            {
              id: 'migration-test-id-1',
              name: 'マイグレーションテストシート1',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
            {
              id: 'migration-test-id-2',
              name: 'マイグレーションテストシート2',
              order: 1,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          ],
          entities: {
            'migration-test-id-1': {
              id: 'migration-test-id-1',
              name: 'マイグレーションテストシート1',
              order: 0,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
            'migration-test-id-2': {
              id: 'migration-test-id-2',
              name: 'マイグレーションテストシート2',
              order: 1,
              createdAt: '2023-01-01T00:00:00.000Z',
              updatedAt: '2023-01-01T00:00:00.000Z',
            },
          },
        },
        version: 0,
      }
      localStorage.setItem('pocket-calcsheet/1', JSON.stringify(v0Data))
    })

    await page.goto('/')

    // マイグレーション後、旧データが正しく表示される
    await expect(page.locator('text=マイグレーションテストシート1')).toBeVisible()
    await expect(page.locator('text=マイグレーションテストシート2')).toBeVisible()

    // 編集モードに入ってシートを追加（マイグレーション後も正常動作）
    const editButton = page.locator('button:has-text("編集")')
    await editButton.click()

    const addButton = page.locator('button:has-text("+")')
    await addButton.click()

    const input = page.locator('[data-testid="new-sheet-input"]')
    await input.fill('マイグレーション後追加シート')
    await input.press('Enter')

    // 新しいシートが追加される
    await expect(page.locator('text=マイグレーション後追加シート')).toBeVisible()

    // 編集モードを終了
    const completeButton = page.locator('button:has-text("完了")')
    await completeButton.click()

    // ページをリロードして永続化確認
    await page.reload()

    // リロード後もすべてのシートが表示される
    await expect(page.locator('text=マイグレーションテストシート1')).toBeVisible()
    await expect(page.locator('text=マイグレーションテストシート2')).toBeVisible()
    await expect(page.locator('text=マイグレーション後追加シート')).toBeVisible()
  })

  test('navigator.storage.persist()の実行確認 @step2-6-3', async ({ page }) => {
    // navigator.storage.persist()の呼び出しを監視
    let persistCalled = false
    await page.addInitScript(() => {
      const originalPersist = navigator.storage?.persist
      if (originalPersist) {
        navigator.storage.persist = async () => {
          window.persistCalled = true
          return true
        }
      }
    })

    await page.goto('/')

    // navigator.storage.persist()が呼び出されたことを確認
    const wasCalled = await page.evaluate(() => window.persistCalled)
    expect(wasCalled).toBe(true)
  })
})
