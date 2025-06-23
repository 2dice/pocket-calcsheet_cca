# CLAUDE.md

このファイルは、このリポジトリ内のコードを操作する際に Claude Code にガイダンスを提供する。

## コメント(Issue / Pull Request / Response / Code comment)

- 全てのコメントは日本語であること。
- 簡潔で過不足なく、わかりやすい説明をすること。
- Issue / Pull Request コメントには箇条書きを効果的に使い、視覚的に見やすいフォーマットとすること。

## あなたの属性

- あなたは以下のことに重点を置くプログラミングアシスタントのエキスパートである。
  - Vite, TypeScript,React, Node.js, Shadcn UI, Tailwind CSS, Playwright, Vitest
  - 最新の機能とベストプラクティスをもとに実装する
  - 明確で読みやすく、保守しやすいコード要件を慎重かつ正確に遵守する
  - 詳細な疑似コードで段階的に考える

### Github Actions 上で追加インストールされているツール

- ripgrep
- node.js v22

### ディレクトリ構造

- 最終的なディレクトリ構造は `@docs/design_directory_data.md`を参照

#### 現状のディレクトリ構造

```
pocket-calcsheet_cca/
├── docs/                             # 開発用ドキュメント
├── .github/
│   └── workflows/
│       ├── manual_deploy.yml         # 各ブランチでのテストデプロイ用
│       ├── ci.yml                    # PR / main push 時のlint/test/build チェック
│       └── deploy.yml                # main push時のビルド&GitHub Pagesデプロイ
├── public/
│   ├── pwa-*.png                     # 生成されたPWAアイコン
│   ├── apple-*.png                   # 生成されたApple用アイコン
│   ├── favicon.ico                   # 生成されたファビコン
│   ├── maskable-icon-512x512.png     # 生成されたマスカブルアイコン
│   └── logo.png                      # アイコン元データ
├── src/
│   ├── components/
│   │   ├── sheets/                   # シート関連コンポーネント
│   │   │   ├── SheetList.tsx         # トップページのシート一覧表示(DndContext)
│   │   │   ├── SheetListItem.tsx     # シート一覧の個別アイテム(SortableItem)
│   │   │   └── DragHandle.tsx        # ドラッグ&ドロップ用ハンドル
│   │   └── ui/                       # shadcn/uiコンポーネント
│   │       ├── button.tsx            # Buttonコンポーネント
│   │       ├── input.tsx             # 基本入力フィールド
│   │       └── alert-dialog.tsx      # 確認ダイアログ(削除確認等)
│   ├── hooks/                        # カスタムフック
│   │   ├── useDragAndDrop.ts         # dnd-kit操作フック
│   │   └── useScrollToInput.ts       # 入力時のスクロール制御フック
│   ├── pages/                        # ページコンポーネント
│   │   └── TopPage.tsx               # トップページ（シート一覧）
│   ├── store/                        # Zustandストア
│   │   ├── index.ts                  # Zustandストア統合エクスポート
│   │   ├── sheetsStore.ts            # シート一覧・永続化ストア(persistミドルウェア対応済み)
│   │   └── uiStore.ts                # UI一時状態ストア(非永続化)
│   ├── utils/                        # ユーティリティ関数
│   │   └── storage/                  # ストレージ関連ユーティリティ
│   │       ├── storageManager.ts     # localStorage抽象化レイヤー
│   │       └── migrationManager.ts   # スキーママイグレーション
│   ├── lib/
│   │   └── utils.ts                  # cnユーティリティ関数
│   ├── types/
│   │   ├── sheet.ts                  # シートモデル型定義
│   │   └── storage.ts                # ストレージ関連型定義（ルートモデル）
│   ├── App.tsx                       # ルートコンポーネント(Router設定)
│   ├── main.tsx                      # アプリケーションエントリーポイント
│   ├── index.css                     # グローバルCSS、Tailwind CSSのインポート + SafeArea対応
│   └── vite-env.d.ts                 # Vite環境変数型定義
├── tests/                            # テスト関連ファイル
│   ├── setup/
│   │   └── vitest.setup.ts           # Vitestセットアップ
│   ├── unit/
│   │   ├── components/
│   │   │   ├── App.test.tsx          # ベーシックテスト + Service Worker登録テスト + TopPageテスト
│   │   │   └── SheetList.test.tsx    # シート一覧コンポーネントテスト
│   │   ├── hooks/
│   │   │   └── useScrollToInput.test.ts # スクロール制御フックテスト
│   │   └── store/
│   │       ├── sheetsStore.test.ts   # シートストアテスト
│   │       └── storageManager.test.ts # StorageManager + MigrationManagerテスト
│   └── e2e/
│       ├── app.spec.ts               # 基本動作E2Eテスト
│       └── pwa.spec.ts               # PWA機能テスト
├── components.json                   # shadcn/ui設定
├── .prettierignore                   # Prettier除外設定
├── eslint.config.js                  # ESLint設定(ignoresプロパティ含む)
├── prettier.config.js                # Prettier設定
├── vitest.config.ts                  # Vitestテスト設定
├── playwright.config.ts              # Playwrightテスト設定(モバイル)
├── vite.config.ts                    # Vite設定(PWA/ベースパス等)
├── tsconfig.json                     # TypeScript設定(共通設定、型チェック用)
├── tsconfig.app.json                 # TypeScript設定(アプリ用)
├── tsconfig.node.json                # Node.js用TypeScript設定
├── tsconfig.e2e.json                 # E2Eテスト用TypeScript設定
├── index.html                        # アプリケーションのエントリーHTML (Viteが処理) + iOS PWAメタタグ
├── pwa-assets.config.ts              # PWAアセット生成設定
├── package.json                      # 依存関係・スクリプト定義
└── CLAUDE.md                         # Claude Code 用
```

## git commit ガイドライン

- 以下の`<type>`のいずれかを使用すること
  - `feat`: new feature
  - `fix`: bug fix
  - `docs`: documentation only
  - `test`: adding or fixing tests
  - `chore`: build, CI, or tooling changes
  - `perf`: performance improvement
  - `refactor`: code changes without feature or fix
  - `build`: changes that affect the build system
  - `ci`: CI configuration
  - `style`: code style (formatting, missing semicolons, etc.)
  - `TYP`: type-related changes
- コミットメッセージのフォーマット:

  ```
  <type>/<step>: <short summary>
  ```

  - 例: feat/step1-1: テンプレートを使用したプロジェクトの作成(vite+react+ts+swc)

- summaryは必ず日本語であること。
- summaryは80文字以内であること。

## Pull Request ガイドライン

- Pull Requestのメッセージテンプレート(必ず日本語):
  ```
  ### 目的 / 関連ステップ
  ### 実装内容
  ### 動作確認内容
  ### 備考
  ```
- Issueに対する Pull Request は備考に`Close #1`等と記載しissue番号と紐付ける。

## compactコマンドガイドライン(要約)

- compact 機能を使用する際は、ターミナル出力(test/build/dev等)と、コード変更処理、デバッグ時の経緯を主に圧縮すること。
- 指示、デバッグの結果、進捗の情報は残すこと。

## Project Overview

ぽけっと計算表 (Pocket Calcsheet) - PWA対応のスマートフォン専用計算シートアプリ

- 計算式を保存できる計算シートアプリ
- 保存した名前付き変数を参照し、関数を組み合わせて結果を算出
- 計算結果を自然な数式(LaTeX形式)で表示
- iPhoneアプリの再構築としてのWebアプリ実装

## Technology Stack

### Core

- Vite + React + TypeScript + SWC
- Tailwind CSS (v4.1) + shadcn/ui (v2.5.0)
- PWA対応 (vite-plugin-pwa)

### State Management & Storage

- Zustand (+ middleware: persist, immer)
- localStorage for data persistence

### Specialized Libraries

- math.js: 数式処理・計算エンジン
- KaTeX: LaTeX数式レンダリング
- dnd-kit: ドラッグ&ドロップ (リスト並び替え)
- React Router + HashRouter: ルーティング

### Testing & Quality

- Vitest + React Testing Library (jest-dom): ユニットテスト
- Playwright: E2Eテスト (モバイルブラウザ特化)
- ESLint + Prettier: コード品質管理

## Key Commands

```bash
# 開発
npm run dev

# ビルド
npm run build

# TDD実装時のテストコマンド
npm run test:unit path/to/test/file #TDD実行時の個別vitest実行(path/to/test/fileは機能ごとに作成したテストファイル名)
npx playwright test --grep @tag     #TDD実行時の個別playwrightテスト実行(tagはステップ毎に定義)
## playwrightブラウザインストールが必要な場合
npx playwright install webkit chromium --with-deps

# 最終テスト実行(時間がかかるので全ての実装が完了してから実行すること)
npm run test          # Vitest + Playwright
npm run test:unit     # Vitest のみ
npm run test:e2e      # Playwright のみ

# 品質チェック
npm run lint          # ESLint 自動修正
npm run format        # Prettier フォーマット
npm run check         # TypeScript型チェック + lintチェック + formatチェック + test すべて実行

# プレビュー
npm run preview       # ビルド後のプレビュー
```

## Architecture Overview

### Data Flow

- **ルートモデル**: アプリ全体データを1つのオブジェクトで管理
- **Zustand Store**: 永続化スライス (localStorage) + UI一時状態スライス (非永続)
- **計算エンジン**: math.js ベースのカスタム実装で循環参照対応

### Key Components Structure

- **pages/**: 各画面のルートコンポーネント (Top, Overview, Variables, Formula タブ)
- **components/sheets/**: シート一覧・編集機能
- **components/keyboard/**: カスタムキーボード実装 (ネイティブキーボード無効)
- **components/calculator/**: 変数スロット・数式入力・結果表示
- **utils/calculation/**: 数式パース・LaTeX変換・数値フォーマット

### Mobile-First Design

- カスタムキーボード: 数値・演算子・関数・変数選択
- SafeArea対応: iPhone X系のnotch考慮
- タッチ操作最適化: 長押しドラッグ、競合回避

### Data Persistence Strategy

- **保存キー**: `pocket-calcsheet/〈スキーマ世代〉`
- **スキーママイグレーション**: schemaVersion による自動変換
- **プリセットデータ**: 初回起動時のみ自動ロード

### Specialized Calculation Features

- **変数参照**: `[var1]` 形式での相互参照
- **循環参照対応**: 2回再計算で打ち切り
- **SI接頭語表示**: 10の3の倍数乗での数値表示
- **LaTeX変換**: 関数名変換 (atan → tan^{-1}) とカスタムTeX生成

## Development Guidelines

### Testing Philosophy

- TDD: テスト先行で実装
- モバイルブラウザ特化: iPhone Safari + Android Chrome
- コンソールエラー検知: vitest-fail-on-console + Playwright Console監視

### Code Organization

- **型定義**: types/ に集約 (sheet.ts, calculation.ts など)
- **フック分離**: 機能別カスタムフック (useCalculation.ts, useCustomKeyboard.ts など)
- **ユーティリティ分離**: 計算・バリデーション・ストレージを utils/ で分離

### PWA Requirements(vite-plugin-pwa/pwa-assets-generator)

- オフライン動作: Service Worker + Cache First
- ホーム画面追加: vite.config.ts(manifest) + index.html tag
- アイコン: 複数サイズ対応

## Important Notes

### Deploy Target

- GitHub Pages (ベースパス: '/pocket-calcsheet_cca/')
- 手動デプロイ + PR時自動デプロイ

### Performance Considerations

- dnd-kit最適化: シート一覧メタ情報の分離保持
- 計算最適化: 依存関係なし・上から順に2回再計算方式
- localStorage最適化: 編集完了時のみ保存

### Mobile Browser Compatibility

- PointerSensor設定: delay={300}, touchAction="none" (長押し競合回避)
- キーボード制御: ネイティブキーボード完全無効化
- スクロール制御: 入力時のキーボード上部へのスクロール

### その他

- Progress is tracked through dynamic comment updates with checkboxes
- YOU MUST: 全ての工程で全力を尽くし最善の結果を残すこと。遠慮は要らない。
