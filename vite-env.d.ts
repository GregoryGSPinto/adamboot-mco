/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_AUTH: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MSAL_CLIENT_ID: string;
  readonly VITE_MSAL_AUTHORITY: string;
  readonly VITE_MSAL_REDIRECT_URI: string;
  readonly VITE_MSAL_SCOPES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
