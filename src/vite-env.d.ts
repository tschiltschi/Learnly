/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL. Leave empty to run Learnly as a browser-only demo. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase anon (public) key. Safe to ship to the browser; row level security protects the data. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** "stripe" turns on real Premium payments through the create-checkout function. */
  readonly VITE_PAYMENTS?: string;
  /** "http" sends AI requests to the backend (the Supabase "ai" function by default). */
  readonly VITE_AI_PROVIDER?: string;
  /** Override for the AI endpoint, e.g. your own server. */
  readonly VITE_AI_BASE_URL?: string;
}
