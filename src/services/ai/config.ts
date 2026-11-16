/**
 * AI integration settings.
 *
 * provider: 'demo'  -> no AI is called. Scripted sample conversations and rule-based generators,
 *                      every result is labelled "Demo" in the UI.
 * provider: 'http'  -> calls the backend (see httpProvider.ts and supabase/functions/ai), which talks to Claude.
 *                      Never put model API keys in the frontend.
 */
export const AI_CONFIG = {
  provider: (import.meta.env.VITE_AI_PROVIDER as 'demo' | 'http' | undefined) ?? 'demo',
  // Defaults to the Supabase "ai" Edge Function when Supabase is configured.
  baseUrl:
    import.meta.env.VITE_AI_BASE_URL ??
    (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, '')}/functions/v1/ai` : '/api/ai'),
  freeMonthlyGenerations: 10,
};
