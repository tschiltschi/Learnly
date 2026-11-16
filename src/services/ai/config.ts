/**
 * AI integration settings.
 *
 * provider: 'demo'  -> no AI is called. Scripted sample conversations and rule-based generators,
 *                      every result is labelled "Demo" in the UI.
 * provider: 'http'  -> calls your own backend (see httpProvider.ts), which talks to the model provider.
 *                      Never put model API keys in the frontend.
 */
export const AI_CONFIG = {
  provider: (import.meta.env.VITE_AI_PROVIDER as 'demo' | 'http' | undefined) ?? 'demo',
  baseUrl: (import.meta.env.VITE_AI_BASE_URL as string | undefined) ?? '/api/ai',
  freeMonthlyGenerations: 10,
};
