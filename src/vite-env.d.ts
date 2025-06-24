/// <reference types="vite/client" />

declare global {
  interface Window {
    __testOverrideStorageQuota?: number
  }
}
