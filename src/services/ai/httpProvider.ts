import type { AIProvider } from './types';
import { AI_CONFIG } from './config';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${AI_CONFIG.baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`AI request failed (${res.status})`);
  return res.json() as Promise<T>;
}

/**
 * Production provider: forwards every call to your backend, e.g.
 *   POST /api/ai/chat, /api/ai/flashcards, /api/ai/plan, /api/ai/voice, /api/ai/document
 * The backend holds the model API key, enforces Free/Premium quotas and returns the shapes in types.ts.
 */
export const httpProvider: AIProvider = {
  id: 'http',
  label: 'Learnly AI',
  isDemo: false,
  chat: (input) => post('/chat', input),
  generateFlashcards: (input) => post('/flashcards', input),
  suggestStudyPlan: (input) => post('/plan', input),
  voiceTurn: (input) => post('/voice', input),
  analyzeDocument: (input) => post('/document', input),
};
