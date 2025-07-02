export const FUNCTIONS = [
  { id: 'sqrt', label: 'sqrt', description: '平方根' },
  { id: 'log', label: 'log', description: '常用対数(底10)' },
  { id: 'ln', label: 'ln', description: '自然対数' },
  { id: 'exp', label: 'exp', description: 'e^x' },
  { id: 'sin', label: 'sin', description: 'サイン(度)' },
  { id: 'cos', label: 'cos', description: 'コサイン(度)' },
  { id: 'tan', label: 'tan', description: 'タンジェント(度)' },
  { id: 'dtor', label: 'dtor', description: '度→ラジアン' },
  { id: 'rtod', label: 'rtod', description: 'ラジアン→度' },
  { id: 'asin', label: 'asin', description: 'アークサイン(度)' },
  { id: 'acos', label: 'acos', description: 'アークコサイン(度)' },
  { id: 'atan', label: 'atan', description: 'アークタンジェント(度)' },
  { id: 'random', label: 'random', description: '乱数' },
  { id: 'pi', label: 'pi', description: '円周率' },
  { id: 'e', label: 'e', description: 'ネイピア数' },
] as const

export type FunctionId = (typeof FUNCTIONS)[number]['id']
