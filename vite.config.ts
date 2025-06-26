import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/pocket-calcsheet_cca/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: {
        disabled: false,
        config: true,
      },
      manifest: {
        id: '/pocket-calcsheet_cca/',
        name: 'ぽけっと計算表',
        short_name: 'ぽけっと計算表',
        start_url: '/pocket-calcsheet_cca/#/',
        scope: '/pocket-calcsheet_cca/',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        // icons は pwaAssets により自動注入される
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // 開発時はService Worker無効（コンソールエラー回避）
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
