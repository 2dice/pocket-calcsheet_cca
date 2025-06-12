# Tailwind CSS v4 マイグレーションガイド

Tailwind CSS v4.0は2025年1月22日にリリースされ、新しいRust製「Oxide」エンジンによって**フルビルドが5倍高速**、**インクリメンタルビルドが100倍高速**になりました。JavaScriptベースの設定からCSS中心の設定へと移行し、Vite + React 19 + shadcn/uiワークフローとの完全な互換性を維持しています。

## インストール方法の革新

v4のインストールプロセスは、v3.4のマルチパッケージアプローチから専用ツールパッケージへと根本的に変更されました。**コア依存関係の変更**により、個別のPostCSSプラグインが不要になり、統合方法ごとに専用パッケージが導入されました。

### Viteプロジェクトの場合（推奨）

```bash
# v3.4のアプローチ
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# v4のアプローチ
npm install tailwindcss @tailwindcss/vite
```

**主な改善点**：新しい`@tailwindcss/vite`プラグインは、Viteのモジュールグラフを通じて自動コンテンツ検出を提供し、手動の`content`配列設定が不要になりました。組み込みのベンダープレフィックスとインポート処理により、`autoprefixer`と`postcss-import`への依存が削除されました。

## CSS中心の設定パラダイムへの移行

最も重要なアーキテクチャ変更は、JavaScriptの設定ファイルから`@theme`ディレクティブを使用した**CSS中心の設定**への移行です。これにより、`tailwind.config.js`ファイルが廃止され、ネイティブCSS構文が採用されました。

### 設定の比較

```css
/* v4 CSS中心の設定 */
@import 'tailwindcss';

@theme {
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;
  --spacing-18: 4.5rem;
  --font-sans: 'Inter', 'system-ui', 'sans-serif';
  --breakpoint-3xl: 120rem;
}
```

```javascript
// v3.4 JavaScript設定（非推奨）
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

**自動コンテンツ検出**は開発体験の大幅な改善です - v4はヒューリスティクスを使用してテンプレートファイルを自動的に発見し、`.gitignore`ファイルとバイナリタイプを自動的に無視します。特殊な場所にあるファイルは`@source`ディレクティブで追加可能です。

## CSSインポートの変換

慣れ親しんだ`@tailwind`ディレクティブは単一のインポート文に統合され、CSSセットアッププロセスが大幅に簡素化されました。

```css
/* v3.4のアプローチ */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* v4のアプローチ */
@import 'tailwindcss';
```

この変更により、標準的なCSSインポート構文が活用され、CSSバンドラーとツールとの統合が改善されます。

## 専用プラグインによるVite統合

新しい`@tailwindcss/vite`プラグインは、PostCSSベースの統合と比較して**優れたパフォーマンス**を提供し、Viteのモジュールグラフを活用して最適なファイル検出とコンパイルを実現します。

### Vite設定の更新

```javascript
// vite.config.js - v4のセットアップ
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // フレームワークプラグインの前に追加
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**パフォーマンスのメリット**には、マイクロ秒レベルのインクリメンタルビルドとより高速なホットリロードが含まれます。このプラグインにより、PostCSS設定ファイルが完全に不要になります。

## PostCSS設定の簡素化とLightning CSS統合

V4はLightning CSSを内部で統合し、`@import`の処理やベンダープレフィックスの付与を自動化しました。PostCSS統合が必要な場合、v4は簡素化された設定を持つ専用プラグインパッケージを使用します。

```javascript
// postcss.config.mjs - v4
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

// postcss.config.js - v3.4（より複雑）
module.exports = {
  plugins: {
    'postcss-import': {},
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

組み込みのベンダープレフィックスとインポート処理により、追加のPostCSSプラグインが不要になります。

## JITの進化とユーティリティクラスの強化

V4は従来のJITコンセプトを**Oxideエンジン**に置き換え、前例のないコンパイルパフォーマンスを実現します。新しいユーティリティクラスは、モダンなCSS機能でTailwindの機能を拡張します。

### 新しいユーティリティクラスとバリアント

- **コンテナクエリ**：`@min-*`と`@max-*`バリアントによるファーストクラスサポート
- **3D変換**：直接的な3D変換ユーティリティ
- **テキストシャドウ**：数十年のブラウザサポートを経て`text-shadow-*`ユーティリティ
- **高度な疑似セレクタ**：`not-*`バリアント、`nth-*`バリアント、`in-*`バリアント
- **モダンCSS機能**：`@starting-style`サポート、`:popover-open`スタイリング

### 移行が必要なユーティリティ名の変更

```css
/* v3.4 → v4 ユーティリティの名前変更 */
shadow-sm → shadow-xs
shadow → shadow-sm
blur-sm → blur-xs
blur → blur-sm
rounded-sm → rounded-xs
rounded → rounded-sm
ring → ring-3
outline-none → outline-hidden
```

**カラー透明度の処理**は、個別のユーティリティから統一された構文へと変換されます：

```css
/* v3.4（v4では非推奨） */
bg-blue-500 bg-opacity-50

/* v4（統一構文） */
bg-blue-500/50
```

## CSSカスタムプロパティの統合

V4はすべてのデザイントークンをCSSカスタムプロパティとしてネイティブに公開し、ランタイムテーマとJavaScriptフレームワークとのより良い統合を可能にします。

```css
/* すべてのテーマ値がCSS変数になる */
var(--color-primary-500)
var(--spacing-4)
var(--font-sans)
```

**モダンCSS機能**には、より良いパフォーマンスのための`@property`登録、`color-mix()`関数サポート、カスタム実装を置き換えるネイティブカスケードレイヤーが含まれます。

## shadcn/ui v4互換性の状況

**shadcn/ui v2.5は2025年3月時点でTailwind CSS v4を公式サポート**しており、コンポーネントライブラリの完全な移行が完了しています。主な変更には、React 19互換性の改善と強化されたスタイリング機能が含まれます。

### components.json の構成

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "", // v4では空欄でOK
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### コンポーネントの追加と使用

```bash
# 必要なコンポーネントを個別追加
npx shadcn@latest add button card dialog
```

追加されるファイル構成：

- `src/components/ui/button.tsx` - コンポーネント本体
- `src/lib/utils.ts` - cnユーティリティ関数

### cnユーティリティ関数

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

この関数は条件付きクラス名の結合とTailwindクラスの重複解決を行います。

### v2.5での主な変更点

- **Toastコンポーネント廃止**：外部ライブラリ`sonner`への移行推奨
  ```bash
  # Toastの代替実装
  npm install sonner
  ```
- **React forwardRef削除**：React 19の新しいref転送パターンに対応
- **data-slot属性**：全プリミティブコンポーネントに追加（スタイリング用）
- **アニメーションシステム**：`tailwindcss-animate`から`tw-animate-css`への移行

### CSSセットアップの変更

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

## 破壊的変更と非推奨機能

V4は、より直感的な構文パターンを優先していくつかのユーティリティクラスを削除し、ブラウザサポートに影響するモダンCSS依存関係を導入します。

### 完全に削除されたユーティリティ

- `text-opacity-*`、`bg-opacity-*`、`border-opacity-*` → `{utility}/{opacity}`構文を使用
- `decoration-slice` → `box-decoration-slice`を使用
- `flex-grow-*`、`flex-shrink-*` → `grow-*`、`shrink-*`を使用

### 動作の変更

- **デフォルトボーダーカラー**：`gray-200`から`currentColor`に変更
- **ボタンカーソル**：`cursor: pointer`から`cursor: default`に変更
- **リングユーティリティ**：デフォルト幅が3pxから1pxに変更
- **プレースホルダーカラー**：50%の透明度で`currentColor`を使用

### ブラウザサポート要件

- **Safari 16.4+**、**Chrome 111+**、**Firefox 128+**
- `@property`、`color-mix()`、その他のモダンCSS機能への依存
- レガシーブラウザプロジェクトはv3.4に留まる必要がある

## プロジェクト構成例

### 推奨ディレクトリ構造

```
project/
├── src/
│   ├── index.css         # Tailwindインポートとグローバルスタイル
│   ├── App.tsx
│   ├── components/
│   │   └── ui/          # shadcn/uiコンポーネント
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── dialog.tsx
│   └── lib/
│       └── utils.ts     # cnユーティリティ関数
├── components.json      # shadcn/ui設定
├── vite.config.ts
├── tsconfig.json
└── package.json
```
