import { describe, expect, it } from 'vitest'
import { generateMaskableAsset } from '@vite-pwa/assets-generator/api'
import type { Preset } from '@vite-pwa/assets-generator/config'
import pwaAssetsConfig, {
  maskableIconBackground,
  maskableIconPadding,
} from '../../../pwa-assets.config'

const BRAND_BACKGROUND_PIXEL = [32, 54, 60, 255]
const WHITE_PIXEL = [255, 255, 255, 255]
const pwaAssetsPreset = pwaAssetsConfig.preset as Preset
const [pwaAssetsImage] = pwaAssetsConfig.images as string[]
const OPAQUE_ALPHA = 255

const readCornerPixels = async () => {
  const image = await generateMaskableAsset(
    'none',
    pwaAssetsImage,
    512,
    pwaAssetsPreset.maskable
  )
  const { data, info } = await image.ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  })
  const pixel = (x: number, y: number) => {
    const index = (y * info.width + x) * info.channels
    return [data[index], data[index + 1], data[index + 2], data[index + 3]]
  }

  return {
    width: info.width,
    height: info.height,
    topLeft: pixel(0, 0),
    topRight: pixel(info.width - 1, 0),
    bottomLeft: pixel(0, info.height - 1),
    bottomRight: pixel(info.width - 1, info.height - 1),
  }
}

describe('PWAアセット設定', () => {
  it('maskable iconをブランド背景色の余白付きで生成する設定になっている', () => {
    expect(pwaAssetsPreset.maskable.padding).toBe(maskableIconPadding)
    expect(pwaAssetsPreset.maskable.resizeOptions).toMatchObject({
      fit: 'contain',
      background: maskableIconBackground,
    })
  })

  it('生成されるmaskable iconの外周が白余白や透過にならない', async () => {
    const corners = await readCornerPixels()

    expect(corners.width).toBe(512)
    expect(corners.height).toBe(512)

    for (const corner of [
      corners.topLeft,
      corners.topRight,
      corners.bottomLeft,
      corners.bottomRight,
    ]) {
      expect(corner).toEqual(BRAND_BACKGROUND_PIXEL)
      expect(corner).not.toEqual(WHITE_PIXEL)
      expect(corner[3]).toBe(OPAQUE_ALPHA)
    }
  })
})
