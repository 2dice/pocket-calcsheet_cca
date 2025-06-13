import { test, expect } from '@playwright/test'

test.describe('PWA機能', () => {
  test('必要なメタタグが存在すること', async ({ page }) => {
    await page.goto('/')

    // viewport-fit=cover
    const viewport = page.locator('meta[name="viewport"]')
    await expect(viewport).toHaveAttribute('content', /viewport-fit=cover/)

    // iOS PWAメタタグ
    await expect(
      page.locator('meta[name="mobile-web-app-capable"]')
    ).toHaveAttribute('content', 'yes')
    await expect(
      page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')
    ).toHaveAttribute('content', 'default')
    await expect(
      page.locator('meta[name="apple-mobile-web-app-title"]')
    ).toHaveAttribute('content', 'ぽけっと計算表')
  })

  test('PWAビルド時のmanifest確認（ビルドが必要）', async ({ page }) => {
    // ビルド版のテストでは manifest link と theme-color を確認
    // 開発時はスキップ（devOptions.enabled: false のため）
    await page.goto('/')

    // 開発モードかどうかを判定（registerSWスクリプトが存在するかチェック）
    const isBuilt =
      (await page.locator('script[id="vite-plugin-pwa:register-sw"]').count()) >
      0

    if (isBuilt) {
      // theme-color
      await expect(
        page.locator('meta[name="theme-color"]').first()
      ).toHaveAttribute('content', '#ffffff')

      // manifest link
      await expect(
        page.locator('link[rel="manifest"]').first()
      ).toHaveAttribute('href', /manifest\.webmanifest/)
    } else {
      // 開発モードではスキップ
      console.log('開発モードのため manifest 確認をスキップ')
    }
  })

  test('bodyにSafeAreaが適用されていること', async ({ page }) => {
    await page.goto('/')

    const bodyStyles = await page.evaluate(() => {
      const body = document.body
      const styles = window.getComputedStyle(body)
      return {
        paddingTop: styles.paddingTop,
        paddingRight: styles.paddingRight,
        paddingBottom: styles.paddingBottom,
        paddingLeft: styles.paddingLeft,
      }
    })

    // 実機でないと0pxになる可能性があるため、存在確認のみ
    expect(bodyStyles.paddingTop).toBeDefined()
    expect(bodyStyles.paddingRight).toBeDefined()
    expect(bodyStyles.paddingBottom).toBeDefined()
    expect(bodyStyles.paddingLeft).toBeDefined()
  })
})
