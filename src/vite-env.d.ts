/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Capacitor global types
declare global {
  interface Window {
    Capacitor?: {
      isNative: boolean
    }
  }
}
