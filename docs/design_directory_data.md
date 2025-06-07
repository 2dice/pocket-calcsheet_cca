# 最終ディレクトリ構成(ファイル単位:役割)

pocket-calcsheet_cca/
├── docs/                               # 開発用ドキュメント
├── dist/                               # ビルド/デプロイ用成果物
├── .github/
│   └── workflows/
│       ├── claude.yml                 # claude code action実行用
│       ├── manual_deploy.yml          # 各ブランチでのテストデプロイ用
│       ├── ci.yml                     # PR時のlint/test/build チェック
│       └── deploy.yml                 # main push時のビルド&GitHub Pagesデプロイ
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png           # PWA用アプリアイコン(192x192)
│   │   ├── icon-512x512.png           # PWA用アプリアイコン(512x512)
│   │   ├── apple-touch-icon.png       # iOS Safari用アイコン
│   │   └── favicon.ico                # ブラウザファビコン
│   ├── splash/
│   │   ├── apple-splash-2048-2732.png # iPhone Pro Max縦向きスプラッシュ
│   │   ├── apple-splash-1668-2224.png # iPad縦向きスプラッシュ
│   │   └── apple-splash-2224-1668.png # iPad横向きスプラッシュ
│   ├── manifest.json                  # PWAマニフェスト(ホーム画面追加設定)
│   └── robots.txt                     # 検索エンジン向けクロール設定
├── src/
│   ├── components/
│   │   ├── ui/                        # shadcn/ui コンポーネント
│   │   │   ├── alert-dialog.tsx       # 確認ダイアログ(削除確認等)
│   │   │   ├── button.tsx             # 基本ボタンコンポーネント
│   │   │   ├── input.tsx              # 基本入力フィールド
│   │   │   ├── textarea.tsx           # 複数行テキスト入力
│   │   │   ├── tabs.tsx               # タブUI(overview/variables/formula)
│   │   │   └── dialog.tsx             # モーダルダイアログ基底
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # アプリ全体レイアウト(SafeArea対応)
│   │   │   ├── TabBar.tsx             # 下部タブバー(3タブナビゲーション)
│   │   │   └── Header.tsx             # 上部ヘッダー(戻るボタン等)
│   │   ├── sheets/
│   │   │   ├── SheetList.tsx          # トップページのシート一覧表示
│   │   │   ├── SheetListItem.tsx      # シート一覧の個別アイテム
│   │   │   ├── EditableSheetItem.tsx  # 編集モード時のシートアイテム
│   │   │   └── DragHandle.tsx         # ドラッグ&ドロップ用ハンドル
│   │   ├── keyboard/
│   │   │   ├── CustomKeyboard.tsx     # カスタムキーボード本体
│   │   │   ├── KeyboardKey.tsx        # キーボードの個別キー
│   │   │   ├── FunctionPicker.tsx     # 関数選択ドラムロールUI
│   │   │   └── VariablePicker.tsx     # 変数選択ドラムロールUI
│   │   ├── calculator/
│   │   │   ├── VariableSlot.tsx       # 変数スロット(名前+式+値)
│   │   │   ├── FormulaInput.tsx       # 数式入力エリア
│   │   │   ├── ResultDisplay.tsx      # 計算結果表示
│   │   │   └── ExpressionRenderer.tsx # LaTeX数式レンダリング
│   │   └── common/
│   │       ├── LoadingSpinner.tsx     # ローディング表示
│   │       ├── ErrorBoundary.tsx      # エラー境界コンポーネント
│   │       └── Portal.tsx             # React Portal ラッパー
│   ├── pages/
│   │   ├── TopPage.tsx               # トップページ(シート一覧)
│   │   ├── OverviewTab.tsx           # 概要タブページ
│   │   ├── VariablesTab.tsx          # 変数タブページ
│   │   └── FormulaTab.tsx            # 数式タブページ
│   ├── hooks/
│   │   ├── useCustomKeyboard.ts      # カスタムキーボード制御フック
│   │   ├── useCalculation.ts         # 数式計算処理フック
│   │   ├── useLocalStorage.ts        # localStorage操作フック
│   │   ├── useDragAndDrop.ts         # dnd-kit操作フック
│   │   └── useScrollToInput.ts       # 入力時のスクロール制御フック
│   ├── store/
│   │   ├── index.ts                  # Zustandストア統合エクスポート
│   │   ├── sheetsStore.ts            # シート一覧・永続化ストア
│   │   ├── uiStore.ts                # UI一時状態ストア(非永続化)
│   │   └── middleware/
│   │       ├── persistMiddleware.ts   # localStorage永続化ミドルウェア
│   │       └── immerMiddleware.ts     # Immer状態更新ミドルウェア
│   ├── utils/
│   │   ├── calculation/
│   │   │   ├── mathEngine.ts         # math.js ラッパー・計算エンジン
│   │   │   ├── expressionParser.ts   # 数式パース・バリデーション
│   │   │   ├── latexConverter.ts     # LaTeX変換ロジック
│   │   │   └── numberFormatter.ts    # 数値フォーマット(SI接頭語等)
│   │   ├── validation/
│   │   │   ├── variableValidation.ts # 変数名バリデーション
│   │   │   └── expressionValidation.ts # 数式バリデーション
│   │   ├── storage/
│   │   │   ├── storageManager.ts     # localStorage抽象化レイヤー
│   │   │   ├── migrationManager.ts   # スキーママイグレーション
│   │   │   └── presetData.ts         # プリセットデータ定義
│   │   └── constants/
│   │       ├── functions.ts          # 対応関数一覧定義
│   │       ├── keyboard.ts           # キーボードレイアウト定義
│   │       └── routes.ts             # ルート定義
│   ├── types/
│   │   ├── sheet.ts                  # シートモデル型定義
│   │   ├── calculation.ts            # 計算関連型定義
│   │   ├── keyboard.ts               # キーボード関連型定義
│   │   └── storage.ts                # ストレージ関連型定義
│   ├── styles/
│   │   └── globals.css               # Tailwind v4 + カスタムスタイル(@import)
│   ├── App.tsx                       # ルートコンポーネント(Router設定)
│   ├── main.tsx                      # アプリケーションエントリーポイント
│   ├── index.css                     # グローバルCSS、Tailwind CSSのインポート (@import "tailwindcss"; を使用)
│   └── vite-env.d.ts                 # Vite環境変数型定義
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   ├── SheetList.test.tsx    # シート一覧コンポーネントテスト
│   │   │   ├── CustomKeyboard.test.tsx # カスタムキーボードテスト
│   │   │   └── VariableSlot.test.tsx  # 変数スロットテスト
│   │   ├── utils/
│   │   │   ├── mathEngine.test.ts    # 計算エンジンユニットテスト
│   │   │   ├── latexConverter.test.ts # LaTeX変換テスト
│   │   │   └── validation.test.ts    # バリデーションテスト
│   │   └── store/
│   │       ├── sheetsStore.test.ts   # ストアテスト
│   │       └── storageManager.test.ts # ストレージテスト
│   ├── e2e/
│   │   ├── app.spec.ts               # 基本動作E2Eテスト
│   │   ├── pwa.spec.ts               # PWA機能テスト
│   │   ├── mobile-safari.spec.ts     # iOS Safari特有テスト
│   │   └── mobile-chrome.spec.ts     # Android Chrome特有テスト
│   ├── fixtures/
│   │   ├── testData.ts               # テスト用データセット
│   │   └── mockFunctions.ts          # モック関数定義
│   └── setup/
│       ├── vitest.setup.ts           # Vitestセットアップ
│       └── playwright.setup.ts       # Playwrightセットアップ
├── .gitignore                        # Git除外設定
├── .eslintignore                     # ESLintの無視ファイル設定
├── eslint.config.js                    # ESLint設定
├── prettier.config.js                  # Prettier設定
├── .prettierignore                   # Prettier除外設定
├── vitest.config.ts                  # Vitestテスト設定
├── playwright.config.ts              # Playwrightテスト設定(モバイル)
├── tailwind.config.ts                # Tailwind CSS v4設定(TypeScript)
├── components.json                   # shadcn/ui設定
├── postcss.config.js                 # PostCSS設定ファイル
├── vite.config.ts                    # Vite設定(PWA/ベースパス等)
├── tsconfig.json                     # TypeScript設定(型チェック用)
├── tsconfig.node.json                # Node.js用TypeScript設定
├── index.html                        # アプリケーションのエントリーHTML (Viteが処理)
├── package.json                      # 依存関係・スクリプト定義
├── package-lock.json                 # npm依存関係ロック
├── LICENSE                           # MIT ライセンス本文
├── README.md                         # プロジェクト説明・セットアップ手順
└── CLAUDE.md                         # Claude Code 用

# データ構造
## 基本データ構造
### ルートモデル（アプリ全体を1本にまとめた最上位オブジェクト）
※計算ロジック、Zustand Store、localStorage JSONで1つを共有
※シート作成/削除/更新時は sheets と entities の両方を変更する
- schemaVersion
    - 保存スキーマの世代番号
- savedAt
    - 最終保存日時(ISO 8601文字列)
- sheets
    - 下記"シート一覧メタ情報"の配列が格納される
- entities
    - シート実体の辞書(キー＝シートID, 値＝シートモデル)
    - 値には下記"シートモデル"が格納される
#### シート一覧メタ情報
- 下記"シートモデル"の"メタ情報"部分だけを複製保持(dnd高速化のため)
- トップページはこの配列の順序どおりにレンダリング  
- 並び替えは並び順プロパティ(order)を書き換えるだけで完結  
#### シートモデル(１つの計算表の中身)
- メタ情報  
    - id : シートID(UUID相当の一意キー)
    - name : 表示名  
    - order : トップページ上の並び順  
    - createdAt : 作成日時
    - updatedAt : 更新日時  
- 概要データ（overviewタブ）  
    - description : 自由記述テキスト(複数行)
- 変数スロット(variablesタブ。要素8の配列)
    - slot : スロット番号(1～8)
    - varName : 変数名(空欄可。正規表現`/^[A-Za-z][A-Za-z0-9_]*$/`を満たす)
    - expression : 入力式(文字列。数値単体または式)
    - value : 計算結果(数値型)。未計算またはエラー時は`null`
    - error : エラー内容(文字列)。正常時は`null`
- 数式データ(formulaタブ)
    - inputExpr : ユーザー入力式(改行・空白を含む文字列)
    - result : 計算結果(数値型)。未計算またはエラー時は`null`
    - error : エラー内容(文字列)正常時は`null`
## UI一時状態データ構造（永続化しない）
Zust­andでは永続スライスと分離して管理し、localStorageには保存しない。
- isEditMode : 編集モードか否か  
- keyboardState : カスタムキーボードの可視状態と入力ターゲット
    - 例 : `visible: boolean`, `target: { type: 'variable' | 'formula'; sheetId; slot }`(slotはvariableのみ)
## 永続化ポリシー(ストレージとの対応)
- 保存キー : `pocket-calcsheet/〈スキーマ世代〉`の形式  
- 保存内容 : ルートモデルをJSON.stringifyした文字列
- 起動時 : 保存内容をルートモデルに展開
- プリセット読込 : 上記保存キーが存在しない場合のみプリセットデータを格納
- マイグレーション : schemaVersionを確認し、旧世代なら変換関数を適用