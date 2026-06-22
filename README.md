# ぽけっと計算表

[![CI](https://github.com/2dice/pocket-calcsheet_cca/actions/workflows/ci.yml/badge.svg)](https://github.com/2dice/pocket-calcsheet_cca/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/2dice/pocket-calcsheet_cca/actions/workflows/deploy.yml/badge.svg)](https://github.com/2dice/pocket-calcsheet_cca/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**ぽけっと計算表**は、スマートフォンでよく使う計算式を「シート」として保存し、名前付き変数と関数を組み合わせて再利用できる PWA 対応の計算シートアプリです。

計算式・変数・説明を 1 つのシートにまとめ、計算結果を自然な数式表示（LaTeX レンダリング）で確認できます。

## 目次

- [主な機能](#主な機能)
- [利用イメージ](#利用イメージ)
- [技術スタック](#技術スタック)
- [ローカル開発](#ローカル開発)
- [品質チェック / テスト](#品質チェック--テスト)
- [ディレクトリ構成](#ディレクトリ構成)
- [データ保存方針](#データ保存方針)
- [デプロイ](#デプロイ)
- [ライセンス](#ライセンス)

## 主な機能

- **計算シート管理**
  - シートの作成・名前変更・削除
  - ドラッグ&ドロップによる並び替え
- **3 タブ構成のシート編集**
  - `Overview`: シートの説明と数式結果の確認
  - `Variables`: 最大 8 個の名前付き変数を定義
  - `Formula`: 変数を参照した最終計算式を入力
- **変数参照による再利用**
  - `[g]`、`[time]` のように角括弧で変数を参照
  - 変数式から別の変数を参照可能
- **スマートフォン向け入力 UI**
  - 数値・演算子・関数・変数を入力できるカスタムキーボード
  - 関数選択・変数選択用のピッカー UI
  - Safe Area を考慮したモバイルファーストレイアウト
- **計算結果の見やすい表示**
  - KaTeX による LaTeX 形式の数式レンダリング
  - SI 接頭語相当の `× 10^n` 表記
  - エラー種別を考慮した計算結果表示
- **PWA 対応**
  - GitHub Pages 上での配信を想定
  - Service Worker によるキャッシュ
  - ホーム画面追加用アイコン・マニフェスト対応
- **データ永続化**
  - localStorage によるシート保存
  - スキーマバージョンごとの保存キー
  - 初回起動時のサンプルシート自動ロード

## 利用イメージ

1. トップページで計算シートを作成します。
2. `Variables` タブで、計算に使う値を名前付き変数として登録します。
3. `Formula` タブで、`[変数名]` 形式の参照を使って式を入力します。
4. `Overview` タブで、説明・数式・計算結果をまとめて確認します。

初回起動時には、以下のようなサンプルシートが自動で読み込まれます。

- 自由落下の落下距離
- 標高と気温から求める気圧
- 二等辺三角形の底角
- LC ローパスフィルタのカットオフ周波数
- 距離変化による音圧減衰

### 対応している主な関数

| 関数                     | 説明                         |
| ------------------------ | ---------------------------- |
| `sqrt`                   | 平方根                       |
| `log`                    | 常用対数（底 10）            |
| `ln`                     | 自然対数                     |
| `exp`                    | 指数関数                     |
| `sin` / `cos` / `tan`    | 度数法の三角関数             |
| `asin` / `acos` / `atan` | 度数法で結果を返す逆三角関数 |
| `dtor` / `rtod`          | 度・ラジアン変換             |
| `random`                 | 乱数                         |
| `pi` / `e`               | 円周率・ネイピア数           |

## 技術スタック

### アプリケーション

- Vite + React + TypeScript + SWC
- React Router（HashRouter）
- Tailwind CSS v4
- shadcn/ui ベースの UI コンポーネント
- Zustand による状態管理

### 計算・表示

- math.js による数式評価
- KaTeX による数式レンダリング
- 独自の変数参照パーサー・LaTeX 変換・数値フォーマッター

### PWA / 配信

- vite-plugin-pwa
- @vite-pwa/assets-generator
- GitHub Pages
- GitHub Actions

### テスト / 品質管理

- Vitest
- React Testing Library
- Playwright
- ESLint
- Prettier
- TypeScript 型チェック

## ローカル開発

### 前提条件

- Node.js 22 系
- npm

### セットアップ

```bash
npm install
```

Playwright の E2E テストを実行する場合は、ブラウザもインストールします。

```bash
npx playwright install webkit chromium --with-deps
```

### 開発サーバー起動

```bash
npm run dev
```

Vite の開発サーバーが起動します。表示されたローカル URL をブラウザで開いてください。

### 本番ビルド

```bash
npm run build
```

ビルド成果物は `dist/` に出力されます。

### ビルド後プレビュー

```bash
npm run preview
```

## 品質チェック / テスト

| コマンド               | 内容                                                           |
| ---------------------- | -------------------------------------------------------------- |
| `npm run lint`         | ESLint を実行し、自動修正可能な問題を修正                      |
| `npm run lint:check`   | ESLint のチェックのみ実行                                      |
| `npm run format`       | Prettier で整形                                                |
| `npm run format:check` | Prettier の整形状態を確認                                      |
| `npm run test:unit`    | Vitest によるユニットテスト                                    |
| `npm run test:e2e`     | Playwright による E2E テスト                                   |
| `npm run test`         | ユニットテストと E2E テストを実行                              |
| `npm run check`        | 型チェック・lint・format・ユニットテスト・E2E テストを一括実行 |

公開前の最終確認では、以下を実行することを推奨します。

```bash
npm run check
npm run build
```

## ディレクトリ構成

```text
pocket-calcsheet_cca/
├── .github/workflows/       # CI / GitHub Pages デプロイ設定
├── docs/                    # 設計・開発ドキュメント
├── public/                  # PWA アイコン・ファビコンなどの静的アセット
├── src/
│   ├── components/          # UI / レイアウト / シート / 計算 / キーボード部品
│   ├── hooks/               # カスタムフック
│   ├── lib/                 # 共通ユーティリティ
│   ├── pages/               # 画面単位のコンポーネント
│   ├── store/               # Zustand ストア
│   ├── types/               # 型定義
│   └── utils/               # 計算・ストレージ・バリデーション・定数
├── tests/
│   ├── e2e/                 # Playwright テスト
│   ├── setup/               # Vitest セットアップ
│   └── unit/                # ユニットテスト
├── index.html               # Vite エントリー HTML
├── vite.config.ts           # Vite / PWA 設定
└── package.json             # npm scripts / 依存関係
```

より詳細な構成は [`docs/design_directory_data.md`](docs/design_directory_data.md) を参照してください。

## データ保存方針

- シートデータは localStorage に保存されます。
- 保存キーは `pocket-calcsheet/<schemaVersion>` 形式です。
- 初回起動時のみプリセットデータを保存します。
- スキーマ変更時は `schemaVersion` を基準にマイグレーションします。
- ブラウザのストレージ削除・容量制限・プライベートブラウズ等により、保存データが利用できない場合があります。

## デプロイ

このアプリは GitHub Pages へのデプロイを想定しています。

- `main` ブランチへの push 時に `.github/workflows/deploy.yml` が実行されます。
- 任意のブランチから手動確認する場合は `.github/workflows/manual_deploy.yml` を使用します。
- Vite の `base` は `/pocket-calcsheet_cca/` に設定されています。

## ライセンス

このプロジェクトは MIT License のもとで公開されています。詳細は [LICENSE](LICENSE) を参照してください。
