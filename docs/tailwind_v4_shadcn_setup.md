### 1. tailwind install

`npm install tailwindcss @tailwindcss/vite`

### 2. src/index.css(App.css)の編集

```css
@import 'tailwindcss';
```

### 3. tsconfig.json, tsconfig.app.jsonへの追加(compilerOptionsのbaseUrl,paths)

```json:tsconfig.json
{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.node.json"
    }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

```json:tsconfig.app.json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@/*": [
        "./src/*"
      ]
    }
    // ...
  }
}
```

### 4. ts-nodeのインストール

`npm install -D @types/node`

### 5. vite.config.tsへの追加(import path/tailwindcss, plugins tailwindcss(), resolve)

```ts:vite.config.ts

import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

### 6. shadcnセットアップ

`npx shadcn@latest init --force --silent --yes --base-color neutral`

### 7. shadcnコンポーネントの追加(例)

`npx shadcn@latest add button`

```tsx:src/App.tsx
import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <Button>Click me</Button>
    </div>
  )
}

export default App
```
