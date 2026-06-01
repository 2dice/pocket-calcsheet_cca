import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

export const maskableIconBackground = '#20363c'
export const maskableIconPadding = 0.12

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      padding: maskableIconPadding,
      resizeOptions: {
        fit: 'contain',
        background: maskableIconBackground,
      },
    },
  },
  images: ['public/logo.png'],
})
