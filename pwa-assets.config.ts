import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

const maskableIconBackground = '#20363c'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      ...minimal2023Preset.maskable,
      padding: 0,
      resizeOptions: {
        fit: 'cover',
        background: maskableIconBackground,
      },
    },
  },
  images: ['public/logo.png'],
})
