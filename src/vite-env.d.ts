/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_KEY: string
  readonly VITE_API_DOMAIN: string
  readonly VITE_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
