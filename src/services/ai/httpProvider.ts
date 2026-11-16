import type { AIChatReply, AIProvider, Language } from './types';
import { AI_CONFIG } from './config';
import { authHeaders } from '@/services/backend';
import { translate } from '@/i18n';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_CONFIG.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `http_${res.status}`);
  return data as T;
}

const ERRORS: Record<string, string> = {
  premium_required: 'This is a Premium feature. Upgrade to use it.',
  free_limit_reached: 'You have used all free AI generations for this month.',
  ai_not_configured: 'The AI is not set up on the server yet. Add an Anthropic API key to the backend.',
  not_signed_in: 'Please sign in again.',
  busy: 'The AI is busy right now. Please try again in a moment.',
};

/** Turns a failed request into a message the student can read, in their language. */
export function aiErrorMessage(err: unknown, lang: Language): string {
  const code = err instanceof Error ? err.message : '';
  return translate(lang, ERRORS[code] ?? 'Something went wrong. Please try again.');
}

async function reply(path: string, input: object & { language: Language }): Promise<AIChatReply> {
  try {
    return await post<AIChatReply>(path, input);
  } catch (err) {
    return { messages: [], demo: false, notice: aiErrorMessage(err, input.language) };
  }
}

/**
 * Production provider: forwards every call to the backend, by default the Supabase "ai" Edge Function
 * (supabase/functions/ai): POST /chat, /flashcards, /plan, /voice, /document.
 * The backend holds the model API key, checks the plan and counts Free generations.
 */
export const httpProvider: AIProvider = {
  id: 'http',
  label: 'Learnly AI',
  isDemo: false,
  chat: (input) => reply('/chat', input),
  generateFlashcards: (input) => post('/flashcards', input),
  suggestStudyPlan: (input) => post('/plan', input),
  voiceTurn: (input) => reply('/voice', input),
  analyzeDocument: (input) => post('/document', input),
};
